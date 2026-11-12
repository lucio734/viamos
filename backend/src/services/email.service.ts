/**
 * Serviço de e-mail. No MVP o provedor é "console" (escreve no log do servidor);
 * em produção basta implementar outro provedor (SMTP, Resend, SES) mantendo a mesma assinatura.
 */
import { env } from '../config/env.js';

export interface Mensagem {
  para: string;
  assunto: string;
  texto: string;
}

export async function enviarEmail(mensagem: Mensagem): Promise<void> {
  if (env.EMAIL_PROVIDER === 'console') {
    if (!env.emTeste) {
      // eslint-disable-next-line no-console
      console.info(`[email simulado] para=${mensagem.para} assunto="${mensagem.assunto}"\n${mensagem.texto}`);
    }
    return;
  }
}
