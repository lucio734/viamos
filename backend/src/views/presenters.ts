/**
 * VIEW (API JSON) — "apresentadores" que moldam o que sai da API.
 * Garantem que dados sensíveis (hash de senha, token de cartão, arquivo binário) nunca sejam expostos
 * e que o intérprete/cliente vejam apenas o necessário um do outro.
 */
import type { Cliente, Interprete, Usuario } from '../models/schema.js';
import { mascararDocumento } from '../utils/documentos.js';

export function apresentarUsuario(u: Usuario, perfil: { cliente?: Cliente; interprete?: Interprete } = {}) {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    telefone: u.telefone,
    papel: u.papel,
    fotoUrl: u.fotoUrl,
    doisFatoresAtivo: u.doisFatoresAtivo,
    criadoEm: u.criadoEm,
    cliente: perfil.cliente
      ? {
          cpf: mascararDocumento(perfil.cliente.cpf),
          dataNascimento: perfil.cliente.dataNascimento,
          cep: perfil.cliente.cep,
          endereco: perfil.cliente.endereco,
          preferenciasAcessibilidade: perfil.cliente.preferenciasAcessibilidade,
        }
      : undefined,
    interprete: perfil.interprete
      ? {
          documento: mascararDocumento(perfil.interprete.documento),
          enderecoBase: perfil.interprete.enderecoBase,
          latitudeBase: perfil.interprete.latitudeBase,
          longitudeBase: perfil.interprete.longitudeBase,
          especialidades: perfil.interprete.especialidades,
          precoHora: perfil.interprete.precoHora,
          raioKm: perfil.interprete.raioKm,
          disponivelAgora: perfil.interprete.disponivelAgora,
          statusHabilitacao: perfil.interprete.statusHabilitacao,
          reputacao: perfil.interprete.reputacao,
          totalAvaliacoes: perfil.interprete.totalAvaliacoes,
        }
      : undefined,
  };
}

/** O que o cliente vê sobre o intérprete que aceitou a demanda. */
export function apresentarInterpretePublico(
  u: Pick<Usuario, 'id' | 'nome' | 'fotoUrl' | 'telefone'>,
  i: Pick<Interprete, 'especialidades' | 'reputacao' | 'totalAvaliacoes' | 'statusHabilitacao'>,
  certificado?: { tipo: string; numero: string } | null,
) {
  return {
    id: u.id,
    nome: u.nome,
    fotoUrl: u.fotoUrl,
    telefone: u.telefone,
    especialidades: i.especialidades,
    reputacao: i.reputacao,
    totalAvaliacoes: i.totalAvaliacoes,
    habilitado: i.statusHabilitacao === 'APROVADO',
    certificacao: certificado ? { tipo: certificado.tipo, numero: certificado.numero } : null,
  };
}

/** O que o intérprete vê sobre o cliente (apenas o necessário para o encontro presencial). */
export function apresentarClientePublico(u: Pick<Usuario, 'id' | 'nome' | 'fotoUrl' | 'telefone'>) {
  return { id: u.id, nome: u.nome, fotoUrl: u.fotoUrl, telefone: u.telefone };
}

export const ROTULOS = {
  tipoServico: {
    SAUDE: 'Saúde',
    JURIDICO: 'Jurídico',
    EDUCACAO: 'Educação',
    EVENTO: 'Evento',
    OUTRO: 'Outro',
  } as Record<string, string>,
  statusSolicitacao: {
    BUSCANDO: 'Buscando intérprete',
    ACEITA: 'Aceita',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada',
  } as Record<string, string>,
};
