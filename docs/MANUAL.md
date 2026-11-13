# Manual do Usuário e do Administrador — Víamos (Checklist 2026 — Fase 5)

## 1. Visão Geral da Plataforma
O **Víamos** conecta pessoas surdas (**Clientes**) a **Intérpretes de Libras** certificados (Prolibras ou equivalente) para mediação comunicacional **exclusivamente presencial** dentro de um raio de até **15 km**.

---

## 2. Manual do Cliente (Pessoa Surda)

1. **Cadastro e Acesso (`/cadastro/cliente`, `/login`):**
   - Informe nome, CPF válido, data de nascimento (mín. 16 anos), telefone com DDD, e-mail, senha (mín. 8 caracteres) e preferências de acessibilidade, aceitando os termos e a política de privacidade (LGPD).
2. **Solicitar Intérprete Presencial (`/cliente/solicitacoes/nova`):**
   - **Passo 1:** selecione o contexto (Saúde, Jurídico, Educação, Evento ou Outro), data/hora de início e duração prevista (mínimo 60 minutos, em blocos de 30 minutos).
   - **Passo 2:** digite o endereço ou clique em **Buscar no Mapa** para posicionar o pino no local exato do atendimento.
   - **Passo 3:** confira a **estimativa transparente de preço** (serviço + deslocamento + taxa da plataforma) e confirme.
3. **Acompanhamento, Sala e Check-in (`/cliente/solicitacoes/:id`, `/cliente/atendimentos/:id`):**
   - Quando um intérprete aceitar a solicitação, acesse a **Sala do Atendimento** para combinar o ponto de encontro por texto, foto ou localização temporária.
   - No encontro presencial, apresente o **QR Code de Check-in** exibido na tela para que o intérprete valide o início do atendimento.
   - Antes do check-in, caso necessário, é possível cancelar a solicitação visualizando a política de antecedência (isento até 24h antes; taxa de 20% se faltarem menos de 24h e já houver intérprete alocado).
4. **Pagamento, Comprovante PDF e Avaliação (`/cliente/atendimentos/:id/pagamento`, `/avaliar`):**
   - Após o encerramento do atendimento, realize o pagamento via Pix ou cartão salvo.
   - Emita o **Comprovante Oficial em PDF** (com código de verificação pública) e avalie o intérprete de 1 a 5 estrelas.
5. **Perfil e Privacidade LGPD (`/cliente/perfil`):**
   - Atualize seus dados, gerencie cartões/chaves Pix, altere sua senha, gerencie consentimentos opcionais, exporte todos os seus dados em JSON ou solicite a exclusão/anonimização da conta.

---

## 3. Manual do Intérprete de Libras

1. **Cadastro e Habilitação Documental (`/cadastro/interprete`):**
   - Informe CPF ou CNPJ, telefone, especialidades, valor/hora, endereço-base no mapa, raio de atuação (1 a 15 km) e envie seu certificado **Prolibras ou equivalente** (PDF, JPG ou PNG de até 5 MB).
   - Aguarde a aprovação pelo Backoffice. Caso seja solicitada correção, reenvie o documento em `/interprete/perfil`.
2. **Disponibilidade e Raio (`/interprete`, `/interprete/agenda`):**
   - No Hub, ative a chave **Online** para receber ofertas imediatas dentro do seu raio e configure suas janelas semanais de horário em **Agenda e Raio**.
3. **Aceitar ou Recusar Demandas (`/interprete/demandas`):**
   - Visualize a distância até o local, o contexto, a duração e o valor líquido estimado. O aceite é exclusivo do primeiro intérprete habilitado que confirmar.
4. **Check-in Presencial e Encerramento (`/interprete/atendimentos/:id`):**
   - A partir de 30 minutos antes do início previsto e estando a até 200 metros do local (com precisão de GPS ≤ 50 m), capture sua localização e escaneie o QR Code do cliente (ou digite o código manual).
   - Ao término da mediação presencial, clique em **Encerrar Atendimento**.
5. **Ganhos e Repasse (`/interprete/ganhos`):**
   - Consulte os ganhos da semana, o extrato de créditos, cadastre sua conta bancária/Pix e solicite o repasse do saldo disponível.

---

## 4. Manual do Administrador / Operador Backoffice

1. **Fila de Certificações (`/backoffice` e `/backoffice/certificacoes/:id`):**
   - Acompanhe os indicadores operacionais e filtre certificações `EM_ANALISE`.
   - Clique em **Ver arquivo** para inspecionar o certificado original e emita o parecer: **Aprovar** (habilita o intérprete imediatamente), **Solicitar Correção** ou **Recusar** (exige justificativa enviada ao intérprete por notificação).
2. **Chamados de Suporte e SOS Emergência (`/backoffice/chamados`):**
   - Chamados do tipo `EMERGENCIA` aparecem destacados em vermelho com o mapa da localização reportada pelo participante. Assuma (`EM_ATENDIMENTO`) e encerre (`ENCERRADO`) após a tratativa.
3. **Trilha de Auditoria (`/backoffice/auditoria`):**
   - Consulte os logs imutáveis filtrando por tipo de evento (`LOGIN_SUCESSO`, `CHECKIN_REALIZADO`, `PAGAMENTO_APROVADO`, `PARECER_CERTIFICACAO`, etc.) e intervalo de datas.
