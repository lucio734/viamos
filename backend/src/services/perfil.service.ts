/**
 * RF43 (dados do perfil), RF45 (consentimento, exportação e exclusão — LGPD / RNF09).
 */
import { and, desc, eq, isNull } from 'drizzle-orm';
import { REGRAS } from '../config/regras.js';
import { db } from '../models/db.js';
import {
  atendimentos,
  avaliacoes,
  clientes,
  consentimentos,
  interpretes,
  mensagens,
  pagamentos,
  sessoes,
  solicitacoes,
  solicitacoesDados,
  usuarios,
  type PapelUsuario,
} from '../models/schema.js';
import { somenteDigitos } from '../utils/documentos.js';
import { Erros } from '../utils/erros.js';
import { apresentarUsuario } from '../views/presenters.js';
import { registrarEvento } from './auditoria.service.js';
import { carregarPerfil } from './auth.service.js';

export async function obterPerfil(usuarioId: string, papel: PapelUsuario) {
  const [u] = await db.select().from(usuarios).where(eq(usuarios.id, usuarioId)).limit(1);
  if (!u) throw Erros.naoEncontrado('Usuário');
  return apresentarUsuario(u, await carregarPerfil(usuarioId, papel));
}

export async function atualizarPerfil(
  usuarioId: string,
  papel: PapelUsuario,
  dados: {
    nome?: string;
    telefone?: string;
    fotoUrl?: string | null;
    cliente?: { cep?: string; endereco?: string; preferenciasAcessibilidade?: string };
    interprete?: { enderecoBase?: string; latitudeBase?: number; longitudeBase?: number; especialidades?: string[]; precoHora?: number };
  },
  ip?: string,
) {
  await db.transaction(async (tx) => {
    const camposUsuario: Partial<typeof usuarios.$inferInsert> = { atualizadoEm: new Date() };
    if (dados.nome) camposUsuario.nome = dados.nome.trim();
    if (dados.telefone) camposUsuario.telefone = somenteDigitos(dados.telefone);
    if (dados.fotoUrl !== undefined) camposUsuario.fotoUrl = dados.fotoUrl;
    await tx.update(usuarios).set(camposUsuario).where(eq(usuarios.id, usuarioId));

    if (papel === 'CLIENTE' && dados.cliente) {
      await tx
        .update(clientes)
        .set({
          ...(dados.cliente.cep !== undefined ? { cep: somenteDigitos(dados.cliente.cep) || null } : {}),
          ...(dados.cliente.endereco !== undefined ? { endereco: dados.cliente.endereco.trim() || null } : {}),
          ...(dados.cliente.preferenciasAcessibilidade !== undefined ? { preferenciasAcessibilidade: dados.cliente.preferenciasAcessibilidade.trim() || null } : {}),
        })
        .where(eq(clientes.usuarioId, usuarioId));
    }
    if (papel === 'INTERPRETE' && dados.interprete) {
      const i = dados.interprete;
      await tx
        .update(interpretes)
        .set({
          ...(i.enderecoBase !== undefined ? { enderecoBase: i.enderecoBase.trim() } : {}),
          ...(i.latitudeBase !== undefined ? { latitudeBase: i.latitudeBase } : {}),
          ...(i.longitudeBase !== undefined ? { longitudeBase: i.longitudeBase } : {}),
          ...(i.especialidades !== undefined ? { especialidades: i.especialidades } : {}),
          ...(i.precoHora !== undefined ? { precoHora: i.precoHora } : {}),
        })
        .where(eq(interpretes.usuarioId, usuarioId));
    }
    await registrarEvento({ usuarioId, tipo: 'PERFIL_ATUALIZADO', detalhes: { campos: Object.keys(dados) }, ip }, tx);
  });
  return obterPerfil(usuarioId, papel);
}

// ---------------------------------------------------------------------------
// Consentimentos (RNF09, RNF44)
// ---------------------------------------------------------------------------
export async function listarConsentimentos(usuarioId: string) {
  const linhas = await db.select().from(consentimentos).where(eq(consentimentos.usuarioId, usuarioId)).orderBy(desc(consentimentos.concedidoEm));
  const finalidades = ['TERMOS_USO', 'PRIVACIDADE', 'LOCALIZACAO', 'NOTIFICACOES'] as const;
  return finalidades.map((f) => {
    const vigente = linhas.find((l) => l.finalidade === f && !l.revogadoEm);
    return { finalidade: f, concedido: Boolean(vigente), versaoTermo: vigente?.versaoTermo ?? null, concedidoEm: vigente?.concedidoEm ?? null };
  });
}

export async function alterarConsentimento(usuarioId: string, finalidade: 'LOCALIZACAO' | 'NOTIFICACOES' | 'TERMOS_USO' | 'PRIVACIDADE', concedido: boolean, ip?: string) {
  if (!concedido && (finalidade === 'TERMOS_USO' || finalidade === 'PRIVACIDADE')) {
    throw Erros.regraNegocio('Para revogar os termos de uso ou a política de privacidade, solicite a exclusão da conta.', 'CONSENTIMENTO_OBRIGATORIO');
  }
  await db.transaction(async (tx) => {
    await tx
      .update(consentimentos)
      .set({ revogadoEm: new Date() })
      .where(and(eq(consentimentos.usuarioId, usuarioId), eq(consentimentos.finalidade, finalidade), isNull(consentimentos.revogadoEm)));
    if (concedido) await tx.insert(consentimentos).values({ usuarioId, finalidade, versaoTermo: REGRAS.VERSAO_TERMOS });
    await registrarEvento({ usuarioId, tipo: 'CONSENTIMENTO', detalhes: { finalidade, concedido }, ip }, tx);
  });
  return listarConsentimentos(usuarioId);
}

// ---------------------------------------------------------------------------
// Exportação e exclusão de dados (RF45)
// ---------------------------------------------------------------------------
export async function exportarDados(usuarioId: string, papel: PapelUsuario, ip?: string) {
  const perfil = await obterPerfil(usuarioId, papel);
  const minhasSolicitacoes = papel === 'CLIENTE' ? await db.select().from(solicitacoes).where(eq(solicitacoes.clienteId, usuarioId)) : [];
  const meusAtendimentos = papel === 'INTERPRETE' ? await db.select().from(atendimentos).where(eq(atendimentos.interpreteId, usuarioId)) : [];
  const minhasMensagens = await db.select({ id: mensagens.id, atendimentoId: mensagens.atendimentoId, tipo: mensagens.tipo, texto: mensagens.texto, enviadaEm: mensagens.enviadaEm }).from(mensagens).where(eq(mensagens.autorId, usuarioId));
  const minhasAvaliacoes = await db.select().from(avaliacoes).where(eq(avaliacoes.autorId, usuarioId));
  const meusConsentimentos = await db.select().from(consentimentos).where(eq(consentimentos.usuarioId, usuarioId));
  const pedidos = await db.select().from(solicitacoesDados).where(eq(solicitacoesDados.usuarioId, usuarioId));

  await db.transaction(async (tx) => {
    await tx.insert(solicitacoesDados).values({ usuarioId, tipo: 'EXPORTACAO', status: 'CONCLUIDA', concluidaEm: new Date() });
    await registrarEvento({ usuarioId, tipo: 'SOLICITACAO_DADOS', detalhes: { tipo: 'EXPORTACAO' }, ip }, tx);
  });

  return {
    geradoEm: new Date(),
    baseLegal: 'Lei 13.709/2018 (LGPD), art. 18 — direito de acesso e portabilidade.',
    perfil,
    solicitacoes: minhasSolicitacoes,
    atendimentos: meusAtendimentos,
    mensagens: minhasMensagens,
    avaliacoes: minhasAvaliacoes,
    consentimentos: meusConsentimentos,
    pedidosAnteriores: pedidos,
  };
}

/** Exclusão: registra o pedido e anonimiza/inativa a conta se não houver atendimento em aberto. */
export async function solicitarExclusao(usuarioId: string, papel: PapelUsuario, ip?: string) {
  const abertos =
    papel === 'CLIENTE'
      ? await db.select({ id: solicitacoes.id }).from(solicitacoes).where(and(eq(solicitacoes.clienteId, usuarioId), eq(solicitacoes.status, 'EM_ANDAMENTO'))).limit(1)
      : await db.select({ id: atendimentos.id }).from(atendimentos).where(and(eq(atendimentos.interpreteId, usuarioId), eq(atendimentos.status, 'EM_ANDAMENTO'))).limit(1);
  if (abertos.length) throw Erros.regraNegocio('Conclua o atendimento em andamento antes de solicitar a exclusão.', 'ATENDIMENTO_EM_ANDAMENTO');
  const pendentes = papel === 'CLIENTE'
    ? await db.select({ id: pagamentos.id }).from(pagamentos).innerJoin(atendimentos, eq(atendimentos.id, pagamentos.atendimentoId)).innerJoin(solicitacoes, eq(solicitacoes.id, atendimentos.solicitacaoId)).where(and(eq(solicitacoes.clienteId, usuarioId), eq(pagamentos.status, 'PENDENTE'))).limit(1)
    : [];
  if (pendentes.length) throw Erros.regraNegocio('Há pagamentos pendentes. Quite-os antes de solicitar a exclusão.', 'PAGAMENTO_PENDENTE');

  await db.transaction(async (tx) => {
    await tx.insert(solicitacoesDados).values({ usuarioId, tipo: 'EXCLUSAO', status: 'CONCLUIDA', concluidaEm: new Date() });
    // Anonimização: registros de atendimento/comprovantes são retidos por 5 anos (RNF29); dados pessoais são removidos.
    await tx
      .update(usuarios)
      .set({ nome: 'Usuário removido', email: `removido+${usuarioId}@viamos.invalid`, telefone: '', fotoUrl: null, ativo: false, atualizadoEm: new Date() })
      .where(eq(usuarios.id, usuarioId));
    await tx.update(sessoes).set({ revogada: true }).where(eq(sessoes.usuarioId, usuarioId));
    await tx.update(consentimentos).set({ revogadoEm: new Date() }).where(and(eq(consentimentos.usuarioId, usuarioId), isNull(consentimentos.revogadoEm)));
    await registrarEvento({ usuarioId, tipo: 'SOLICITACAO_DADOS', detalhes: { tipo: 'EXCLUSAO' }, ip }, tx);
  });
  return { mensagem: 'Sua conta foi desativada e seus dados pessoais anonimizados. Registros fiscais e de atendimento são mantidos pelo prazo legal.' };
}
