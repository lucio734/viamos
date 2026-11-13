# Roteiro de Demonstração e Manual de Uso — Víamos (Bloco Z & Dossiê #50)

## 1. Credenciais Prontas do Seed (`senha padrão: Viamos@2026`)

| Perfil | E-mail | Situação Inicial no Seed |
|---|---|---|
| **Cliente (Pessoa Surda)** | `joao@viamos.app` | Possui atendimento agendado com QR Code pronto, atendimento concluído com comprovante PDF e cartão salvo |
| **Cliente (Pessoa Surda)** | `ana@viamos.app` | Possui atendimento encerrado com pagamento pendente |
| **Intérprete Habilitada** | `maria@viamos.app` | Habilitação `APROVADO`, online, com demanda no raio, atendimento agendado para check-in e saldo para repasse |
| **Intérprete Habilitado** | `carlos@viamos.app` | Habilitação `APROVADO`, online em São Paulo |
| **Intérprete em Análise** | `pedro@viamos.app` | Habilitação `EM_ANALISE` com certificado Prolibras na fila do Backoffice |
| **Operador Backoffice** | `operador@viamos.app` | Acesso às filas de certificações, chamados SOS/suporte e trilha de auditoria |

---

## 2. Roteiro Passo a Passo para Apresentação à Banca (7 a 10 minutos)

### Preparação (3 minutos antes de começar)
1. Se estiver usando o ambiente em nuvem (Render), abra `/api/health` para acordar a instância gratuita.
2. Deixe duas janelas do navegador abertas lado a lado (uma normal para o **Cliente João** e uma anônima para a **Intérprete Maria** / **Operador Backoffice**).

### Ato 1 — Jornada do Cliente: Solicitação Presencial com Estimativa e Mapa (2 min)
1. Na janela 1, entre com `joao@viamos.app` / `Viamos@2026`.
2. No **Hub do Cliente** (`/cliente`), mostre o resumo de atendimentos e clique em **Solicitar Intérprete** (`/cliente/solicitacoes/nova`).
3. **Passo 1:** escolha o contexto **Saúde**, data/hora futura e duração de **90 min** (blocos de 30 min, mín. 60 min — RF11).
4. **Passo 2:** clique no atalho **"Usar Hospital das Clínicas (Demo)"** (ou marque no mapa Leaflet) e avance.
5. **Passo 3:** mostre a **estimativa discriminada** calculada pela API (`POST /solicitacoes/estimativa` — RF15: valor das horas + deslocamento R$ 15 + taxa de 10%) e clique em **Confirmar Solicitação**.

### Ato 2 — Jornada do Intérprete: Mapa de Raio, Aceite Exclusivo e Sala (2 min)
1. Na janela 2, entre com `maria@viamos.app` / `Viamos@2026`.
2. No **Hub da Intérprete** (`/interprete`), mostre o botão **Online**, o mapa com o raio de atuação (≤ 15 km — RNF27) e a nova demanda recebida com distância calculada por Haversine.
3. Clique na demanda e clique em **Aceitar Demanda** (`POST /demandas/:id/aceitar` — RF22, aceite atômico exclusivo).
4. Acesse a **Sala do Atendimento** (`/interprete/atendimentos/:id/sala` — RF28–RF30) e envie uma mensagem de texto e o compartilhamento temporário de localização GPS; mostre a mensagem chegando na janela do cliente.

### Ato 3 — Check-in Presencial com QR Code + GPS, Encerramento, Pagamento e PDF (3 min)
1. No atendimento agendado entre João e Maria:
   - Na janela do **Cliente João** (`/cliente/atendimentos/:id`), exiba na tela o **QR Code de Check-in** (`GET /atendimentos/:id/qrcode` — RF31) e copie o código manual.
   - Na janela da **Intérprete Maria** (`/interprete/atendimentos/:id`), clique no botão **"Simular GPS no Local do Atendimento (Demo Indoor)"** (garantindo precisão ≤ 50 m e distância ≤ 200 m — RF32/RNF26), cole o código do QR Code no `<LeitorQr />` e confirme o **Check-in Presencial**.
2. Em seguida, clique em **Encerrar Atendimento** (`POST /atendimentos/:id/encerrar` — RF33), mostrando o cálculo automático da duração real e geração da cobrança.
3. Na janela do **Cliente João**, clique em **Realizar Pagamento** (`/cliente/atendimentos/:id/pagamento` — RF36), selecione o cartão salvo (ou Pix) e confirme.
4. Clique em **Baixar Comprovante PDF** (`RF37`) e depois em **Verificar Autenticidade Pública** (`/verificar/:codigo` — RF38), mostrando o selo **Comprovante Autêntico**.
5. Registre a avaliação de 5 estrelas em `/cliente/atendimentos/:id/avaliar` (`RF40`).

### Ato 4 — Ganhos do Intérprete, LGPD e Backoffice (2 min)
1. Na janela da **Intérprete Maria**, abra **Ganhos e Repasse** (`/interprete/ganhos` — RF26/RF27), mostre o crédito líquido creditado e solicite um repasse para a conta bancária cadastrada.
2. Em **Perfil** (`/interprete/perfil` ou `/cliente/perfil` — RF43/RF45), demonstre a exportação de dados pessoais em JSON (portabilidade LGPD).
3. Saia e entre com `operador@viamos.app` / `Viamos@2026` (`/backoffice`):
   - Mostre os 6 indicadores operacionais e a certificação de **Pedro** (`EM_ANALISE` — RF06).
   - Abra `/backoffice/certificacoes/:id`, clique em **Inspecionar documento enviado** e aprove a certificação (`APROVADO`).
   - Mostre rapidamente **Chamados de Suporte/SOS** (`/backoffice/chamados` — RF34) e a **Trilha de Auditoria Imutável** (`/backoffice/auditoria` — RF44).
