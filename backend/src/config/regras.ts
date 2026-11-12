/**
 * Parâmetros das regras de negócio do Víamos.
 * Cada valor cita a fonte (RF/RNF/decisão registrada em docs/DECISOES.md) para rastreabilidade.
 * Centralizar aqui evita "números mágicos" espalhados pelo código.
 */
export const REGRAS = {
  /** RF13 — duração mínima contratada (minutos). */
  DURACAO_MINIMA_MIN: 60,
  /** Múltiplo aceito para a duração prevista (blocos de 30 minutos a partir de 1 h). */
  DURACAO_BLOCO_MIN: 30,
  /** Limite superior razoável para uma solicitação (12 h). */
  DURACAO_MAXIMA_MIN: 12 * 60,

  /** RF17/RF24/RNF27 — raio máximo de distribuição (km). */
  RAIO_MAXIMO_KM: 15,

  /** RF32 — distância máxima do intérprete ao local para validar o check-in (metros). */
  CHECKIN_DISTANCIA_MAXIMA_M: 200,
  /** RNF26 — precisão máxima aceita da leitura de GPS (metros). */
  CHECKIN_PRECISAO_MAXIMA_M: 50,
  /** DECISÃO D-05 — janela em que o check-in pode ser feito antes do início previsto (minutos). */
  CHECKIN_ANTECEDENCIA_MIN: 30,

  /** RNF35 — tentativas de login antes do bloqueio e duração do bloqueio. */
  LOGIN_MAX_TENTATIVAS: 5,
  LOGIN_BLOQUEIO_MIN: 15,

  /** RF07 — validade do link de recuperação de senha (minutos). */
  RECUPERACAO_SENHA_VALIDADE_MIN: 30,

  /** RF05 — tamanho máximo do arquivo do certificado (bytes) e tipos aceitos. */
  CERTIFICADO_TAMANHO_MAX_BYTES: 5 * 1024 * 1024,
  CERTIFICADO_MIMES: ['application/pdf', 'image/jpeg', 'image/png'],

  /** RF30 — tamanho máximo de uma foto de ponto de referência enviada no chat (bytes, data URL). */
  FOTO_CHAT_TAMANHO_MAX_BYTES: 1 * 1024 * 1024,

  /**
   * RF15 / DECISÃO D-01 — fórmula de estimativa (versão v1):
   *   valorServico     = precoHoraReferencia[tipo] × horas
   *   valorDeslocamento = tarifa fixa dentro do raio de 15 km
   *   taxaPlataforma   = 10% do valor do serviço
   *   valorTotal       = soma dos três, arredondado a 2 casas
   */
  PRECO: {
    VERSAO_REGRA: 'v1',
    HORA_REFERENCIA: {
      SAUDE: 95,
      JURIDICO: 110,
      EDUCACAO: 80,
      EVENTO: 100,
      OUTRO: 85,
    } as Record<string, number>,
    DESLOCAMENTO_FIXO: 15,
    TAXA_PLATAFORMA_PERCENTUAL: 0.1,
  },

  /**
   * RF19 / DECISÃO D-02 — cancelamento pelo cliente:
   *   - sem custo até 24 h antes do início previsto;
   *   - 20% do valor estimado quando faltar menos de 24 h e a solicitação já tiver sido aceita;
   *   - não é permitido após o check-in (atendimento em andamento).
   */
  CANCELAMENTO: {
    JANELA_SEM_TAXA_HORAS: 24,
    PERCENTUAL_TAXA: 0.2,
  },

  /**
   * RF33 / DECISÃO D-03 — valor final cobrado:
   *   cobra-se a duração prevista (mínimo contratado) ou a duração real arredondada para cima em blocos
   *   de 30 min, o que for maior; o excedente usa o mesmo preço/hora de referência da cotação.
   */
  COBRANCA: {
    BLOCO_EXCEDENTE_MIN: 30,
  },

  /** RF26 — a semana financeira começa na segunda-feira. */
  SEMANA_INICIA_SEGUNDA: true,

  /** Versão atual dos termos para registro de consentimento (RNF09). */
  VERSAO_TERMOS: '2026-11',
} as const;
