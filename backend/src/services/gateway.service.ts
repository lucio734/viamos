/**
 * Gateway de pagamento SIMULADO (sandbox interno) — RNF23/RNF37.
 * Mantém a mesma interface que um provedor real (tokenização, cobrança Pix/cartão e repasse),
 * para que a troca por Pagar.me/Stripe/Mercado Pago seja localizada neste arquivo.
 *
 * Regras de simulação (úteis para demonstrar os caminhos de exceção — item #48):
 *  - cartão cujo final é "0000" → recusado ("saldo insuficiente");
 *  - valor exatamente 13,13 → falha de comunicação (timeout simulado);
 *  - demais casos → aprovado.
 */
import { randomUUID } from 'node:crypto';

export interface ResultadoCobranca {
  aprovado: boolean;
  referencia: string;
  mensagem: string;
}

export async function tokenizarCartao(cartao: { numero: string; validade: string; nomeTitular: string }): Promise<{ token: string; bandeira: string; final: string }> {
  const digitos = cartao.numero.replace(/\D/g, '');
  const bandeira = digitos.startsWith('4') ? 'Visa' : digitos.startsWith('5') ? 'Mastercard' : digitos.startsWith('3') ? 'Amex' : 'Cartão';
  // NUNCA armazenamos o número: só o token devolvido pelo "gateway" e os 4 últimos dígitos.
  return { token: `tok_sim_${randomUUID()}`, bandeira, final: digitos.slice(-4) };
}

export async function cobrar(entrada: { valor: number; meio: 'PIX' | 'CARTAO'; tokenCartao?: string | null; finalCartao?: string | null }): Promise<ResultadoCobranca> {
  const referencia = `sim_${entrada.meio.toLowerCase()}_${randomUUID().slice(0, 8)}`;
  if (entrada.meio === 'CARTAO' && entrada.finalCartao === '0000') {
    return { aprovado: false, referencia, mensagem: 'Transação recusada pelo emissor (saldo insuficiente).' };
  }
  if (Math.abs(entrada.valor - 13.13) < 0.001) {
    return { aprovado: false, referencia, mensagem: 'Falha de comunicação com o gateway. Tente novamente.' };
  }
  return { aprovado: true, referencia, mensagem: entrada.meio === 'PIX' ? 'Pix confirmado.' : 'Pagamento aprovado.' };
}

export async function transferir(entrada: { valor: number; contaDescricao: string }): Promise<ResultadoCobranca> {
  return { aprovado: entrada.valor > 0, referencia: `sim_repasse_${randomUUID().slice(0, 8)}`, mensagem: entrada.valor > 0 ? 'Repasse agendado.' : 'Valor inválido.' };
}
