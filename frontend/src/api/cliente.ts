/**
 * Cliente HTTP da API do Víamos.
 * - Anexa o token JWT guardado no sessionStorage (RF08: limpo no logout).
 * - Normaliza erros no formato { status, codigo, mensagem, detalhes } para as telas exibirem feedback (item #32).
 */
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const CHAVE_TOKEN = 'viamos.token';

export interface CampoInvalido {
  campo: string;
  mensagem: string;
}

export class ErroApi extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly detalhes?: CampoInvalido[] | unknown;

  constructor(status: number, codigo: string, mensagem: string, detalhes?: unknown) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.codigo = codigo;
    this.detalhes = detalhes;
  }

  /** Mensagem amigável vinda da API (alias de `message`, em português para as telas). */
  get mensagem(): string {
    return this.message;
  }

  /** Mapa campo → mensagem (para mostrar o erro abaixo de cada input). */
  get porCampo(): Record<string, string> {
    const lista = Array.isArray(this.detalhes) ? (this.detalhes as CampoInvalido[]) : [];
    return Object.fromEntries(lista.map((d) => [d.campo, d.mensagem]));
  }
}

export const tokenStore = {
  obter: () => sessionStorage.getItem(CHAVE_TOKEN),
  salvar: (token: string) => sessionStorage.setItem(CHAVE_TOKEN, token),
  limpar: () => sessionStorage.removeItem(CHAVE_TOKEN),
};

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function requisicao<T>(metodo: Metodo, caminho: string, corpo?: unknown): Promise<T> {
  const cabecalhos: Record<string, string> = { Accept: 'application/json' };
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  const token = tokenStore.obter();
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}/api${caminho}`, { method: metodo, headers: cabecalhos, body: corpo !== undefined ? JSON.stringify(corpo) : undefined });
  } catch {
    throw new ErroApi(0, 'SEM_CONEXAO', 'Não foi possível conectar ao servidor. Verifique sua internet (RNF01).');
  }

  if (resposta.status === 204) return undefined as T;
  const texto = await resposta.text();
  const dados = texto ? (JSON.parse(texto) as unknown) : null;

  if (!resposta.ok) {
    const erro = (dados as { erro?: { codigo?: string; mensagem?: string; detalhes?: unknown } } | null)?.erro;
    if (resposta.status === 401 && token) tokenStore.limpar();
    throw new ErroApi(resposta.status, erro?.codigo ?? 'ERRO', erro?.mensagem ?? 'Ocorreu um erro inesperado.', erro?.detalhes);
  }
  return dados as T;
}

export const api = {
  get: <T>(caminho: string) => requisicao<T>('GET', caminho),
  post: <T>(caminho: string, corpo?: unknown) => requisicao<T>('POST', caminho, corpo ?? {}),
  put: <T>(caminho: string, corpo?: unknown) => requisicao<T>('PUT', caminho, corpo ?? {}),
  delete: <T>(caminho: string) => requisicao<T>('DELETE', caminho),
  /** URL absoluta para abrir arquivos (PDF do comprovante) em nova aba, com o token na query. */
  urlArquivo: (caminho: string) => `${BASE_URL}/api${caminho}${caminho.includes('?') ? '&' : '?'}token=${encodeURIComponent(tokenStore.obter() ?? '')}`,
};
