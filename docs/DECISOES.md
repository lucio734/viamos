# Decisões de produto e de regra de negócio

Registro das decisões tomadas para fechar lacunas do briefing/PRD. Cada decisão é referenciada no código
(`backend/src/config/regras.ts`) e deve aparecer no documento final (seção de requisitos / arquitetura).
Alterar uma decisão = alterar o parâmetro em `regras.ts`, atualizar este arquivo e os testes.

| ID | Tema | Decisão | Onde está | Status |
|---|---|---|---|---|
| D-01 | Fórmula da estimativa (RF15) | `valorServico = preçoHoraReferência[tipo] × horas`; deslocamento fixo R$ 15 dentro do raio; taxa da plataforma 10% do serviço; `valorTotal` = soma. Preços de referência: Saúde 95, Jurídico 110, Educação 80, Evento 100, Outro 85 (R$/h). Versão da regra gravada na cotação (`versaoRegra = v1`). | `REGRAS.PRECO`, `solicitacao.service.ts` | Adotada — confirmar valores com o grupo |
| D-02 | Cancelamento pelo cliente (RF19) | Sem custo até 24 h antes do início. Com menos de 24 h **e** solicitação já aceita: taxa de 20% do valor estimado. Não é permitido após o check-in. Intérprete alocado e ofertas pendentes são notificados/expiradas. | `REGRAS.CANCELAMENTO`, `cancelarSolicitacao` | Adotada |
| D-03 | Valor final cobrado (RF33) | Cobra-se o maior entre a duração contratada e a duração real arredondada **para cima** em blocos de 30 min; excedente usa o mesmo preço/hora da cotação; deslocamento e taxa recalculados. O cliente nunca paga menos que o mínimo contratado. | `REGRAS.COBRANCA`, `calcularValorFinal` | Adotada |
| D-04 | Duração da solicitação (RF13) | Mínimo 60 min, máximo 12 h, em blocos de 30 min. Validação no frontend e no backend. | `REGRAS.DURACAO_*` | Adotada |
| D-05 | Janela do check-in (RF31/RF32) | O check-in abre **30 min** antes do horário previsto (o mockup citava 15; 30 dá margem ao intérprete que chega antes). Exige QR do atendimento, distância ≤ 200 m e precisão GPS ≤ 50 m. | `REGRAS.CHECKIN_*`, `realizarCheckin` | Adotada — revisar se o grupo preferir 15 min |
| D-06 | Aceite exclusivo (RF22) | Garantido por `UPDATE … WHERE status = 'BUSCANDO'` em transação + índice único em `atendimentos.solicitacao_id`. O segundo intérprete recebe HTTP 409. Também se verifica conflito de agenda do intérprete. | `aceitarDemanda` | Adotada |
| D-07 | Quem pode encerrar (RF33) | Cliente **ou** intérprete participantes, apenas com atendimento EM_ANDAMENTO; encerramento repetido → 409. | `encerrarAtendimento` | Adotada |
| D-08 | Pagamento (RF36) | Gateway **simulado** com a interface de um gateway real (tokenização, cobrança, repasse). Idempotência: um único pagamento `PAGO` por atendimento (índice parcial); repetição devolve o mesmo resultado. Casos de teste: cartão final `0000` recusa; valor 13,13 simula falha de comunicação. | `gateway.service.ts`, `processarPagamento` | Adotada (integração real é evolução futura) |
| D-09 | Repasse ao intérprete (RF27) | Crédito = valor pago − taxa da plataforma. Saldo disponível = soma dos lançamentos. Repasse manual (sob demanda) transfere todo o saldo para a conta principal; um repasse por vez. Semana financeira começa na segunda. | `pagamento.service.ts` | Adotada |
| D-10 | Comprovante (RF37/RF38) | Emitido automaticamente quando o pagamento é confirmado. PDF acessível só aos participantes (link com token); verificação pública por código UUID devolve apenas dados essenciais (sem documentos/telefones). | `comprovante.service.ts`, `views/comprovante.pdf.ts` | Adotada |
| D-11 | Localização temporária (RF29/RNF44) | Compartilhamento permitido de 2 h antes do início até o encerramento; a sala consulta apenas as posições dos últimos 15 min; tudo é encerrado no encerramento do atendimento. Sala fecha 24 h após o fim. | `compartilharLocalizacao`, `obterLocalizacoes` | Adotada |
| D-12 | Certificado do intérprete (RF05) | PDF/JPG/PNG até 5 MB, enviado em base64 e armazenado no banco (`bytea`) — simples e sobrevive a redeploys em hospedagem gratuita. Operador e o próprio intérprete podem baixar. | `cadastro.service.ts`, `backoffice.service.ts` | Adotada |
| D-13 | Login e sessão (RF01/RF08/RNF35) | JWT de 8 h **com sessão persistida** (`sessoes`): logout revoga; redefinição de senha revoga todas. 5 tentativas inválidas bloqueiam a conta por 15 min (HTTP 423). Mensagem única para e-mail/senha errados. | `auth.service.ts`, `middlewares/auth.ts` | Adotada |
| D-14 | Notificações (RF42/RNF25) | Persistidas no banco e consultadas pelo app (sino + polling de 30 s). Push externo fica como evolução. | `notificacao.service.ts`, `AppShell.tsx` | Adotada |
| D-15 | Chat (RF28) | Polling incremental (`?apos=<data>`) a cada poucos segundos — simples, funciona em qualquer hospedagem gratuita. WebSocket é evolução. | `listarMensagens` | Adotada |
| D-16 | Exclusão de conta (RF45/RNF29) | Anonimização dos dados pessoais + inativação; registros de atendimento/comprovante são retidos pelo prazo legal. Bloqueada se houver atendimento em andamento ou pagamento pendente. | `solicitarExclusao` | Adotada |
| D-17 | ORM | **Drizzle ORM** em vez de Prisma: 100% JavaScript (sem binários), migrações SQL legíveis e consultas parametrizadas; o schema TypeScript é a fonte do DER. | `backend/drizzle.config.ts` | Adotada |
| D-18 | Stack e hospedagem | React + Vite + Tailwind v4 (frontend) · Express + TS (API) · PostgreSQL · Vercel + Render + Neon/Render Postgres (todos gratuitos, HTTPS automático). | `README.md`, `render.yaml` | Adotada |

## Pendências que dependem do grupo

- **P-01** Link do Figma (item #5): importar as telas do Stitch para o Figma (Stitch → *Copy to Figma*) ou usar o Figma Make e colar o link no documento.
- **P-02** Validar os valores de D-01 (preços de referência) e D-05 (janela de 30 min).
- **P-03** Criar as contas gratuitas Render, Vercel e Neon (um integrante) e registrar as URLs em `docs/DEPLOY.md`.
- **P-04** Fotos de perfil: hoje `fotoUrl` aceita uma URL/data URL pequena; decidir se entra no MVP.
