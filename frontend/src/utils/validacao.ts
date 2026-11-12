/**
 * Validações instantâneas de formulário (item #33 do checklist).
 * Espelham as regras de backend/src/utils/documentos.ts e dos esquemas Zod dos controllers —
 * o backend valida de novo (nunca confia no cliente); aqui o objetivo é dar feedback imediato por campo.
 */

export const somenteDigitos = (valor: string) => (valor ?? '').replace(/\D+/g, '');

export function cpfValido(bruto: string): boolean {
  const cpf = somenteDigitos(bruto);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (tamanho: number) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

export function cnpjValido(bruto: string): boolean {
  const cnpj = somenteDigitos(bruto);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (tamanho: number) => {
    const pesos = tamanho === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cnpj[i]) * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

/** CPF (11 dígitos) ou CNPJ (14 dígitos). */
export function documentoValido(bruto: string): boolean {
  const d = somenteDigitos(bruto);
  return d.length === 11 ? cpfValido(d) : d.length === 14 ? cnpjValido(d) : false;
}

export const telefoneValido = (bruto: string) => [10, 11].includes(somenteDigitos(bruto).length);
export const cepValido = (bruto: string) => somenteDigitos(bruto).length === 8;
export const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Mesma regra do backend (esquemaCadastroCliente): idade entre 16 e 120 anos, sem rollover de calendário (ex.: 2000-02-31). Recebe AAAA-MM-DD. */
export function idadeValida(dataIso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataIso)) return false;
  const data = new Date(`${dataIso}T00:00:00Z`);
  if (Number.isNaN(data.getTime()) || !data.toISOString().startsWith(dataIso)) return false;
  const idade = (Date.now() - data.getTime()) / (365.25 * 86_400_000);
  return idade >= 16 && idade <= 120;
}

/** Senha: 8 a 72 caracteres (limite do bcrypt), como no backend. */
export function erroSenha(senha: string): string | undefined {
  if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (senha.length > 72) return 'Senha muito longa (máximo 72 caracteres).';
  return undefined;
}

/** RF05 / D-12 — certificado em PDF, JPG ou PNG com até 5 MB. */
export const CERTIFICADO_MIMES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export const CERTIFICADO_TAMANHO_MAX = 5 * 1024 * 1024;

export function erroArquivoCertificado(arquivo: File): string | undefined {
  if (!(CERTIFICADO_MIMES as readonly string[]).includes(arquivo.type)) return 'Envie o certificado em PDF, JPG ou PNG.';
  if (arquivo.size < 8) return 'O arquivo está vazio ou corrompido.';
  if (arquivo.size > CERTIFICADO_TAMANHO_MAX) return 'O arquivo deve ter no máximo 5 MB.';
  if (arquivo.name.length > 200) return 'O nome do arquivo deve ter no máximo 200 caracteres.';
  return undefined;
}

/** Lê um arquivo como base64 puro (sem o prefixo data:), formato esperado por { nome, mime, conteudoBase64 }. */
export function lerComoBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result).replace(/^data:[^;]+;base64,/, ''));
    leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    leitor.readAsDataURL(arquivo);
  });
}
