/**
 * Validação de documentos brasileiros (CPF/CNPJ) e normalização de campos mascarados.
 * O frontend aplica máscaras (item #33); o backend valida novamente, pois nunca confia no cliente.
 */
export function somenteDigitos(valor: string): string {
  return (valor ?? '').replace(/\D+/g, '');
}

export function cpfValido(cpfBruto: string): boolean {
  const cpf = somenteDigitos(cpfBruto);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (tamanho: number) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

export function cnpjValido(cnpjBruto: string): boolean {
  const cnpj = somenteDigitos(cnpjBruto);
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

/** CPF (11 dígitos) ou CNPJ (14 dígitos) válido. */
export function documentoValido(doc: string): boolean {
  const d = somenteDigitos(doc);
  return d.length === 11 ? cpfValido(d) : d.length === 14 ? cnpjValido(d) : false;
}

export function telefoneValido(telefoneBruto: string): boolean {
  const t = somenteDigitos(telefoneBruto);
  return t.length === 10 || t.length === 11;
}

export function cepValido(cepBruto: string): boolean {
  return somenteDigitos(cepBruto).length === 8;
}

/** Mascara um documento para exibição (ex.: 123.***.***-09). */
export function mascararDocumento(doc: string): string {
  const d = somenteDigitos(doc);
  if (d.length === 11) return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
  if (d.length === 14) return `${d.slice(0, 2)}.***.***/****-${d.slice(12)}`;
  return '***';
}
