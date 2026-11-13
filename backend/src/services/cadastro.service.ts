/**
 * RF02–RF05 — cadastro de cliente surdo e de intérprete (com certificação Prolibras ou equivalente).
 * RNF09 — registra os consentimentos (termos e privacidade) no ato do cadastro.
 */
import { sql } from 'drizzle-orm';
import { REGRAS } from '../config/regras.js';
import { db } from '../models/db.js';
import { certificacoes, clientes, consentimentos, interpretes, usuarios } from '../models/schema.js';
import { somenteDigitos } from '../utils/documentos.js';
import { Erros } from '../utils/erros.js';
import { registrarEvento } from './auditoria.service.js';
import { gerarHashSenha, login } from './auth.service.js';
import { notificar } from './notificacao.service.js';

export interface EntradaCliente {
  nome: string;
  cpf: string;
  dataNascimento: string; // YYYY-MM-DD
  email: string;
  telefone: string;
  senha: string;
  cep?: string;
  endereco?: string;
  preferenciasAcessibilidade?: string;
  aceiteTermos: boolean;
  aceitePrivacidade: boolean;
}

export interface ArquivoBase64 {
  nome: string;
  mime: string;
  conteudoBase64: string;
}

export interface EntradaInterprete {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  senha: string;
  enderecoBase: string;
  latitudeBase: number;
  longitudeBase: number;
  especialidades: string[];
  precoHora: number;
  raioKm?: number;
  certificacao: { tipo: 'PROLIBRAS' | 'EQUIVALENTE'; numero: string; arquivo: ArquivoBase64 };
  aceiteTermos: boolean;
  aceitePrivacidade: boolean;
}

async function emailJaUsado(email: string): Promise<boolean> {
  const [linha] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(sql`lower(${usuarios.email}) = ${email.toLowerCase()}`)
    .limit(1);
  return Boolean(linha);
}

function assinaturaBinariaValida(buffer: Buffer, mime: string): boolean {
  if (mime === 'application/pdf') return buffer.subarray(0, 4).toString('ascii') === '%PDF';
  if (mime === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === 'image/png') return buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  return false;
}

export function decodificarArquivo(arquivo: ArquivoBase64): { buffer: Buffer; mime: string; nome: string } {
  if (!(REGRAS.CERTIFICADO_MIMES as readonly string[]).includes(arquivo.mime)) {
    throw Erros.validacao([{ campo: 'certificacao.arquivo', mensagem: 'Envie o certificado em PDF, JPG ou PNG.' }]);
  }
  const base64 = arquivo.conteudoBase64.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) throw Erros.validacao([{ campo: 'certificacao.arquivo', mensagem: 'Arquivo vazio ou corrompido.' }]);
  if (buffer.length > REGRAS.CERTIFICADO_TAMANHO_MAX_BYTES) {
    throw Erros.validacao([{ campo: 'certificacao.arquivo', mensagem: 'O arquivo deve ter no máximo 5 MB.' }]);
  }
  if (!assinaturaBinariaValida(buffer, arquivo.mime)) {
    throw Erros.validacao([{ campo: 'certificacao.arquivo', mensagem: 'O conteúdo do arquivo não corresponde ao formato declarado (PDF, JPG ou PNG).' }]);
  }
  return { buffer, mime: arquivo.mime, nome: arquivo.nome.slice(0, 200) };
}

function consentimentosIniciais(usuarioId: string) {
  return [
    { usuarioId, finalidade: 'TERMOS_USO' as const, versaoTermo: REGRAS.VERSAO_TERMOS },
    { usuarioId, finalidade: 'PRIVACIDADE' as const, versaoTermo: REGRAS.VERSAO_TERMOS },
  ];
}

export async function cadastrarCliente(entrada: EntradaCliente, ip?: string) {
  if (!entrada.aceiteTermos || !entrada.aceitePrivacidade) {
    throw Erros.validacao([{ campo: 'aceiteTermos', mensagem: 'É necessário aceitar os termos de uso e a política de privacidade.' }]);
  }
  if (await emailJaUsado(entrada.email)) {
    throw Erros.conflito('Já existe uma conta com este e-mail.', 'EMAIL_EM_USO', [{ campo: 'email', mensagem: 'Já existe uma conta com este e-mail.' }]);
  }

  const senhaHash = await gerarHashSenha(entrada.senha);
  const usuarioId = await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(usuarios)
      .values({
        nome: entrada.nome.trim(),
        email: entrada.email.trim().toLowerCase(),
        senhaHash,
        telefone: somenteDigitos(entrada.telefone),
        papel: 'CLIENTE',
      })
      .returning({ id: usuarios.id });
    await tx.insert(clientes).values({
      usuarioId: u.id,
      cpf: somenteDigitos(entrada.cpf),
      dataNascimento: entrada.dataNascimento,
      cep: entrada.cep ? somenteDigitos(entrada.cep) : null,
      endereco: entrada.endereco?.trim() || null,
      preferenciasAcessibilidade: entrada.preferenciasAcessibilidade?.trim() || null,
    });
    await tx.insert(consentimentos).values(consentimentosIniciais(u.id));
    await registrarEvento({ usuarioId: u.id, tipo: 'CADASTRO', entidade: 'cliente', entidadeId: u.id, ip }, tx);
    await notificar(
      { usuarioId: u.id, tipo: 'SISTEMA', titulo: 'Bem-vindo(a) ao Víamos!', conteudo: 'Sua conta foi criada. Solicite um intérprete quando precisar.', referencia: '/cliente' },
      tx,
    );
    return u.id;
  });

  // Já devolve a sessão: o usuário recém-cadastrado entra direto no hub.
  return login({ email: entrada.email, senha: entrada.senha, ip, dispositivo: 'cadastro' }).then((s) => ({ ...s, usuarioId }));
}

export async function cadastrarInterprete(entrada: EntradaInterprete, ip?: string) {
  if (!entrada.aceiteTermos || !entrada.aceitePrivacidade) {
    throw Erros.validacao([{ campo: 'aceiteTermos', mensagem: 'É necessário aceitar os termos de uso e a política de privacidade.' }]);
  }
  if (await emailJaUsado(entrada.email)) {
    throw Erros.conflito('Já existe uma conta com este e-mail.', 'EMAIL_EM_USO', [{ campo: 'email', mensagem: 'Já existe uma conta com este e-mail.' }]);
  }
  const arquivo = decodificarArquivo(entrada.certificacao.arquivo);
  const senhaHash = await gerarHashSenha(entrada.senha);

  const usuarioId = await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(usuarios)
      .values({
        nome: entrada.nome.trim(),
        email: entrada.email.trim().toLowerCase(),
        senhaHash,
        telefone: somenteDigitos(entrada.telefone),
        papel: 'INTERPRETE',
      })
      .returning({ id: usuarios.id });
    await tx.insert(interpretes).values({
      usuarioId: u.id,
      documento: somenteDigitos(entrada.documento),
      enderecoBase: entrada.enderecoBase.trim(),
      latitudeBase: entrada.latitudeBase,
      longitudeBase: entrada.longitudeBase,
      especialidades: entrada.especialidades,
      precoHora: entrada.precoHora,
      raioKm: Math.min(entrada.raioKm ?? REGRAS.RAIO_MAXIMO_KM, REGRAS.RAIO_MAXIMO_KM),
      statusHabilitacao: 'EM_ANALISE',
    });
    const [cert] = await tx
      .insert(certificacoes)
      .values({
        interpreteId: u.id,
        tipo: entrada.certificacao.tipo,
        numero: entrada.certificacao.numero.trim(),
        nomeArquivo: arquivo.nome,
        mimeArquivo: arquivo.mime,
        arquivo: arquivo.buffer,
        tamanhoBytes: arquivo.buffer.length,
      })
      .returning({ id: certificacoes.id });
    await tx.insert(consentimentos).values(consentimentosIniciais(u.id));
    await registrarEvento({ usuarioId: u.id, tipo: 'CADASTRO', entidade: 'interprete', entidadeId: u.id, ip }, tx);
    await registrarEvento({ usuarioId: u.id, tipo: 'CERTIFICACAO_ENVIADA', entidade: 'certificacao', entidadeId: cert.id }, tx);
    await notificar(
      {
        usuarioId: u.id,
        tipo: 'CERTIFICACAO',
        titulo: 'Documentação em análise',
        conteudo: 'Recebemos seu certificado. Você poderá aceitar demandas assim que a equipe aprovar a documentação.',
        referencia: '/interprete/perfil',
      },
      tx,
    );
    return u.id;
  });

  return login({ email: entrada.email, senha: entrada.senha, ip, dispositivo: 'cadastro' }).then((s) => ({ ...s, usuarioId }));
}
