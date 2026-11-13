/**
 * RF01 (login), RF07 (recuperar senha), RF08 (logout), RNF07 (bcrypt), RNF35 (bloqueio por tentativas).
 */
import { randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { and, eq, gt, isNull, ne, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { REGRAS } from '../config/regras.js';
import { assinarToken, hashToken } from '../middlewares/auth.js';
import { db } from '../models/db.js';
import { clientes, interpretes, sessoes, tokensRecuperacao, usuarios } from '../models/schema.js';
import { adicionarMinutos } from '../utils/datas.js';
import { Erros } from '../utils/erros.js';
import { registrarEvento } from './auditoria.service.js';
import { enviarEmail } from './email.service.js';
import { apresentarUsuario } from '../views/presenters.js';

const CUSTO_BCRYPT = 10;

export async function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, CUSTO_BCRYPT);
}

function destinoPorPapel(papel: string): string {
  switch (papel) {
    case 'CLIENTE':
      return '/cliente';
    case 'INTERPRETE':
      return '/interprete';
    case 'BACKOFFICE':
    case 'SUPORTE':
      return '/backoffice';
    default:
      return '/';
  }
}

export async function login(entrada: { email: string; senha: string; dispositivo?: string; ip?: string }) {
  const email = entrada.email.trim().toLowerCase();
  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(sql`lower(${usuarios.email}) = ${email}`)
    .limit(1);

  // Mensagem única para e-mail inexistente ou senha errada (não revela qual dos dois falhou).
  const credenciaisInvalidas = () => Erros.naoAutenticado('E-mail ou senha incorretos.');
  if (!usuario || !usuario.ativo) throw credenciaisInvalidas();

  const agora = new Date();
  if (usuario.bloqueadoAte && usuario.bloqueadoAte > agora) {
    const minutos = Math.ceil((usuario.bloqueadoAte.getTime() - agora.getTime()) / 60_000);
    throw Erros.bloqueado(`Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em ${minutos} min.`);
  }

  const senhaConfere = await bcrypt.compare(entrada.senha, usuario.senhaHash);
  if (!senhaConfere) {
    const tentativas = usuario.tentativasFalhas + 1;
    const bloquear = tentativas >= REGRAS.LOGIN_MAX_TENTATIVAS;
    await db
      .update(usuarios)
      .set({
        tentativasFalhas: bloquear ? 0 : tentativas,
        bloqueadoAte: bloquear ? adicionarMinutos(agora, REGRAS.LOGIN_BLOQUEIO_MIN) : null,
        atualizadoEm: agora,
      })
      .where(eq(usuarios.id, usuario.id));
    await registrarEvento({ usuarioId: usuario.id, tipo: 'LOGIN_FALHA', detalhes: { tentativas, bloqueado: bloquear }, ip: entrada.ip });
    if (bloquear) {
      throw Erros.bloqueado(`Conta bloqueada por ${REGRAS.LOGIN_BLOQUEIO_MIN} minutos após ${REGRAS.LOGIN_MAX_TENTATIVAS} tentativas inválidas.`);
    }
    throw credenciaisInvalidas();
  }

  // Sucesso: zera tentativas, cria sessão e assina o token
  const sessaoId = randomUUID();
  const token = assinarToken({ sub: usuario.id, papel: usuario.papel, sid: sessaoId });
  const decodificado = jwt.decode(token) as { exp: number };
  await db.transaction(async (tx) => {
    await tx.update(usuarios).set({ tentativasFalhas: 0, bloqueadoAte: null, atualizadoEm: agora }).where(eq(usuarios.id, usuario.id));
    await tx.insert(sessoes).values({
      id: sessaoId,
      usuarioId: usuario.id,
      tokenHash: hashToken(token),
      dispositivo: entrada.dispositivo?.slice(0, 200),
      expiraEm: new Date(decodificado.exp * 1000),
    });
    await registrarEvento({ usuarioId: usuario.id, tipo: 'LOGIN', ip: entrada.ip }, tx);
  });

  const perfil = await carregarPerfil(usuario.id, usuario.papel);
  return { token, usuario: apresentarUsuario(usuario, perfil), destino: destinoPorPapel(usuario.papel) };
}

export async function logout(sessaoId: string, usuarioId: string): Promise<void> {
  await db.update(sessoes).set({ revogada: true }).where(and(eq(sessoes.id, sessaoId), eq(sessoes.usuarioId, usuarioId)));
  await registrarEvento({ usuarioId, tipo: 'LOGOUT' });
}

export async function obterSessaoAtual(usuarioId: string) {
  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, usuarioId)).limit(1);
  if (!usuario) throw Erros.naoAutenticado();
  const perfil = await carregarPerfil(usuario.id, usuario.papel);
  return { usuario: apresentarUsuario(usuario, perfil), destino: destinoPorPapel(usuario.papel) };
}

export async function carregarPerfil(usuarioId: string, papel: string) {
  if (papel === 'CLIENTE') {
    const [c] = await db.select().from(clientes).where(eq(clientes.usuarioId, usuarioId)).limit(1);
    return c ? { cliente: c } : {};
  }
  if (papel === 'INTERPRETE') {
    const [i] = await db.select().from(interpretes).where(eq(interpretes.usuarioId, usuarioId)).limit(1);
    return i ? { interprete: i } : {};
  }
  return {};
}

/** RF07 — gera link temporário. Mesma resposta exista ou não o e-mail (evita enumeração de contas). */
export async function solicitarRecuperacaoSenha(emailBruto: string, ip?: string): Promise<{ tokenDev?: string }> {
  const email = emailBruto.trim().toLowerCase();
  const [usuario] = await db
    .select({ id: usuarios.id, nome: usuarios.nome })
    .from(usuarios)
    .where(sql`lower(${usuarios.email}) = ${email}`)
    .limit(1);
  if (!usuario) return {};

  const token = randomBytes(32).toString('hex');
  await db.insert(tokensRecuperacao).values({
    usuarioId: usuario.id,
    hash: hashToken(token),
    expiraEm: adicionarMinutos(new Date(), REGRAS.RECUPERACAO_SENHA_VALIDADE_MIN),
  });
  const link = `${env.FRONTEND_URL}/redefinir-senha/${token}`;
  await enviarEmail({
    para: email,
    assunto: 'Víamos — redefinição de senha',
    texto: `Olá, ${usuario.nome}. Para redefinir sua senha acesse: ${link}\nO link vale por ${REGRAS.RECUPERACAO_SENHA_VALIDADE_MIN} minutos.`,
  });
  await registrarEvento({ usuarioId: usuario.id, tipo: 'RECUPERACAO_SENHA', ip });
  // Fora de produção devolvemos o token para facilitar testes/demonstração (não há servidor de e-mail).
  return env.emProducao ? {} : { tokenDev: token };
}

export async function redefinirSenha(token: string, novaSenha: string): Promise<void> {
  const agora = new Date();
  const [registro] = await db
    .select()
    .from(tokensRecuperacao)
    .where(and(eq(tokensRecuperacao.hash, hashToken(token)), isNull(tokensRecuperacao.usadoEm), gt(tokensRecuperacao.expiraEm, agora)))
    .limit(1);
  if (!registro) throw Erros.regraNegocio('Link de redefinição inválido ou expirado. Solicite um novo.', 'TOKEN_INVALIDO');

  const senhaHash = await gerarHashSenha(novaSenha);
  await db.transaction(async (tx) => {
    await tx.update(usuarios).set({ senhaHash, tentativasFalhas: 0, bloqueadoAte: null, atualizadoEm: agora }).where(eq(usuarios.id, registro.usuarioId));
    await tx.update(tokensRecuperacao).set({ usadoEm: agora }).where(eq(tokensRecuperacao.id, registro.id));
    // Encerra todas as sessões abertas: quem redefiniu a senha quer invalidar acessos antigos.
    await tx.update(sessoes).set({ revogada: true }).where(eq(sessoes.usuarioId, registro.usuarioId));
    await registrarEvento({ usuarioId: registro.usuarioId, tipo: 'SENHA_REDEFINIDA' }, tx);
  });
}

export async function alterarSenha(usuarioId: string, senhaAtual: string, novaSenha: string, sessaoAtualId?: string): Promise<void> {
  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, usuarioId)).limit(1);
  if (!usuario) throw Erros.naoAutenticado();
  if (!(await bcrypt.compare(senhaAtual, usuario.senhaHash))) throw Erros.regraNegocio('Senha atual incorreta.', 'SENHA_ATUAL_INCORRETA');
  const senhaHash = await gerarHashSenha(novaSenha);
  await db.transaction(async (tx) => {
    await tx.update(usuarios).set({ senhaHash, atualizadoEm: new Date() }).where(eq(usuarios.id, usuarioId));
    // Revoga todas as outras sessões ativas do usuário (preservando a sessão atual que fez a troca)
    await tx
      .update(sessoes)
      .set({ revogada: true })
      .where(sessaoAtualId ? and(eq(sessoes.usuarioId, usuarioId), ne(sessoes.id, sessaoAtualId)) : eq(sessoes.usuarioId, usuarioId));
    await registrarEvento({ usuarioId, tipo: 'SENHA_REDEFINIDA', detalhes: { origem: 'perfil' } }, tx);
  });
}
