<!-- ARQUIVO GERADO por docs/diagramas/gerar.mjs — não edite à mão; altere o código-fonte e rode `npm run gerar`. -->

# Dicionário de dados

Gerado de `backend/src/models/schema.ts`: 27 tabelas, 230 colunas, 39 chaves estrangeiras e 20 tipos enumerados. Chaves: PK = primária, FK = estrangeira, UK = única.

## Identidade e perfis (DC1, DC11)

### `usuarios`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `nome` | varchar(120) |  | sim |  |  |
| `email` | varchar(160) |  | sim |  |  |
| `senha_hash` | varchar(100) |  | sim |  | bcrypt (RNF07) |
| `telefone` | varchar(20) |  | sim |  |  |
| `papel` | enum `papel_usuario` |  | sim |  |  |
| `foto_url` | text |  | não |  |  |
| `ativo` | boolean |  | sim | true |  |
| `tentativas_falhas` | integer |  | sim | 0 |  |
| `bloqueado_ate` | timestamp with time zone |  | não |  |  |
| `dois_fatores_ativo` | boolean |  | sim | false |  |
| `criado_em` | timestamp with time zone |  | sim | now() |  |
| `atualizado_em` | timestamp with time zone |  | sim | now() |  |

Índices e regras de integridade:

- índice único `usuarios_email_unique` em (lower(email))

### `clientes`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `usuario_id` | uuid | PK, FK | sim |  |  |
| `cpf` | varchar(11) | UK | sim |  |  |
| `data_nascimento` | date |  | sim |  |  |
| `cep` | varchar(8) |  | não |  |  |
| `endereco` | text |  | não |  |  |
| `preferencias_acessibilidade` | text |  | não |  |  |

Chaves estrangeiras:

- `usuario_id` → `usuarios(id)` — ao excluir: cascade

### `interpretes`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `usuario_id` | uuid | PK, FK | sim |  |  |
| `documento` | varchar(14) | UK | sim |  | CPF ou CNPJ |
| `endereco_base` | text |  | sim |  |  |
| `latitude_base` | double precision |  | sim |  |  |
| `longitude_base` | double precision |  | sim |  |  |
| `especialidades` | text[] |  | sim | '{}'::text[] |  |
| `preco_hora` | numeric(10, 2) |  | sim |  |  |
| `raio_km` | integer |  | sim | 15 | RF24 / RNF27: máximo 15 km |
| `disponivel_agora` | boolean |  | sim | false | toggle "Ficar Online" |
| `status_habilitacao` | enum `status_habilitacao` |  | sim | 'PENDENTE' | RF06 / RNF36 |
| `reputacao` | numeric(3, 2) |  | não |  | RF41 (média das avaliações) |
| `total_avaliacoes` | integer |  | sim | 0 |  |

Chaves estrangeiras:

- `usuario_id` → `usuarios(id)` — ao excluir: cascade

Índices e regras de integridade:

- CHECK `interpretes_raio_km_check`: raio_km BETWEEN 1 AND 15

### `certificacoes`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `interprete_id` | uuid | FK | sim |  |  |
| `tipo` | enum `tipo_certificacao` |  | sim |  |  |
| `numero` | varchar(60) |  | sim |  |  |
| `nome_arquivo` | varchar(200) |  | sim |  |  |
| `mime_arquivo` | varchar(80) |  | sim |  |  |
| `arquivo` | bytea |  | sim |  |  |
| `tamanho_bytes` | integer |  | sim |  |  |
| `status` | enum `status_certificacao` |  | sim | 'EM_ANALISE' |  |
| `enviada_em` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `interprete_id` → `interpretes(usuario_id)` — ao excluir: cascade

### `analises_documentais`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `certificacao_id` | uuid | FK | sim |  |  |
| `operador_id` | uuid | FK | sim |  |  |
| `resultado` | enum `resultado_analise` |  | sim |  |  |
| `justificativa` | text |  | não |  |  |
| `data` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `certificacao_id` → `certificacoes(id)` — ao excluir: cascade
- `operador_id` → `usuarios(id)` — ao excluir: no action

### `disponibilidades`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `interprete_id` | uuid | FK | sim |  |  |
| `dia_semana` | smallint |  | sim |  | 0 = domingo ... 6 = sábado |
| `inicio` | time |  | sim |  |  |
| `fim` | time |  | sim |  |  |

Chaves estrangeiras:

- `interprete_id` → `interpretes(usuario_id)` — ao excluir: cascade

Índices e regras de integridade:

- CHECK `disponibilidades_dia_semana_check`: dia_semana BETWEEN 0 AND 6

## Solicitação, cotação, distribuição e aceite (DC3, DC4)

### `solicitacoes`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `cliente_id` | uuid | FK | sim |  |  |
| `tipo_servico` | enum `tipo_servico` |  | sim |  |  |
| `inicio_previsto` | timestamp with time zone |  | sim |  |  |
| `duracao_prevista_min` | integer |  | sim |  | RF13: mínimo 60 |
| `endereco` | text |  | sim |  |  |
| `complemento` | varchar(120) |  | não |  |  |
| `ponto_referencia` | varchar(200) |  | não |  |  |
| `latitude` | double precision |  | sim |  |  |
| `longitude` | double precision |  | sim |  |  |
| `observacoes` | varchar(300) |  | não |  |  |
| `status` | enum `status_solicitacao` |  | sim | 'BUSCANDO' |  |
| `cancelada_em` | timestamp with time zone |  | não |  |  |
| `motivo_cancelamento` | varchar(300) |  | não |  |  |
| `taxa_cancelamento` | numeric(10, 2) |  | não |  |  |
| `criada_em` | timestamp with time zone |  | sim | now() |  |
| `atualizada_em` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `cliente_id` → `clientes(usuario_id)` — ao excluir: no action

Índices e regras de integridade:

- índice `solicitacoes_status_idx` em (status)
- índice `solicitacoes_cliente_idx` em (cliente_id)
- CHECK `solicitacoes_duracao_min_check`: duracao_prevista_min >= 60

### `cotacoes`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `solicitacao_id` | uuid | FK, UK | sim |  |  |
| `valor_servico` | numeric(10, 2) |  | sim |  |  |
| `valor_deslocamento` | numeric(10, 2) |  | sim |  |  |
| `taxa_plataforma` | numeric(10, 2) |  | sim |  |  |
| `valor_total` | numeric(10, 2) |  | sim |  |  |
| `versao_regra` | varchar(20) |  | sim |  |  |
| `calculada_em` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `solicitacao_id` → `solicitacoes(id)` — ao excluir: cascade

### `ofertas`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `solicitacao_id` | uuid | FK | sim |  |  |
| `interprete_id` | uuid | FK | sim |  |  |
| `distancia_km` | numeric(6, 2) |  | sim |  |  |
| `status` | enum `status_oferta` |  | sim | 'ENVIADA' |  |
| `enviada_em` | timestamp with time zone |  | sim | now() |  |
| `respondida_em` | timestamp with time zone |  | não |  |  |
| `motivo_recusa` | varchar(300) |  | não |  |  |

Chaves estrangeiras:

- `solicitacao_id` → `solicitacoes(id)` — ao excluir: cascade
- `interprete_id` → `interpretes(usuario_id)` — ao excluir: cascade

Índices e regras de integridade:

- índice único `ofertas_solicitacao_interprete_unique` em (solicitacao_id, interprete_id)

## Atendimento presencial (DC4, DC5, DC6)

### `atendimentos`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `solicitacao_id` | uuid | FK, UK | sim |  |  |
| `interprete_id` | uuid | FK | sim |  |  |
| `aceito_em` | timestamp with time zone |  | sim | now() |  |
| `inicio_real` | timestamp with time zone |  | não |  |  |
| `fim_real` | timestamp with time zone |  | não |  |  |
| `duracao_real_min` | integer |  | não |  |  |
| `valor_final` | numeric(10, 2) |  | não |  |  |
| `status` | enum `status_atendimento` |  | sim | 'AGENDADO' |  |

Chaves estrangeiras:

- `solicitacao_id` → `solicitacoes(id)` — ao excluir: no action
- `interprete_id` → `interpretes(usuario_id)` — ao excluir: no action

Índices e regras de integridade:

- índice `atendimentos_interprete_idx` em (interprete_id)

### `checkins`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `atendimento_id` | uuid | FK, UK | sim |  |  |
| `qr_hash` | varchar(64) | UK | sim |  | conteúdo do QR exibido pelo cliente |
| `emitido_em` | timestamp with time zone |  | sim | now() |  |
| `lido_em` | timestamp with time zone |  | não |  |  |
| `latitude` | double precision |  | não |  |  |
| `longitude` | double precision |  | não |  |  |
| `precisao_m` | double precision |  | não |  |  |
| `distancia_m` | double precision |  | não |  |  |

Chaves estrangeiras:

- `atendimento_id` → `atendimentos(id)` — ao excluir: cascade

### `mensagens`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `atendimento_id` | uuid | FK | sim |  |  |
| `autor_id` | uuid | FK | não |  | null = mensagem do sistema |
| `tipo` | enum `tipo_mensagem` |  | sim | 'TEXTO' |  |
| `texto` | varchar(1000) |  | não |  |  |
| `arquivo_uri` | text |  | não |  | foto do ponto de referência (data URL pequena) — RF30 |
| `latitude` | double precision |  | não |  |  |
| `longitude` | double precision |  | não |  |  |
| `enviada_em` | timestamp with time zone |  | sim | now() |  |
| `lida_em` | timestamp with time zone |  | não |  |  |

Chaves estrangeiras:

- `atendimento_id` → `atendimentos(id)` — ao excluir: cascade
- `autor_id` → `usuarios(id)` — ao excluir: no action

Índices e regras de integridade:

- índice `mensagens_atendimento_idx` em (atendimento_id, enviada_em)

### `localizacoes_compartilhadas`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `atendimento_id` | uuid | FK | sim |  |  |
| `usuario_id` | uuid | FK | sim |  |  |
| `latitude` | double precision |  | sim |  |  |
| `longitude` | double precision |  | sim |  |  |
| `precisao_m` | double precision |  | não |  |  |
| `registrada_em` | timestamp with time zone |  | sim | now() |  |
| `encerrada_em` | timestamp with time zone |  | não |  |  |

Chaves estrangeiras:

- `atendimento_id` → `atendimentos(id)` — ao excluir: cascade
- `usuario_id` → `usuarios(id)` — ao excluir: no action

### `chamados_suporte`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `atendimento_id` | uuid | FK | não |  |  |
| `solicitante_id` | uuid | FK | sim |  |  |
| `operador_id` | uuid | FK | não |  |  |
| `tipo` | enum `tipo_chamado` |  | sim |  |  |
| `descricao` | varchar(500) |  | não |  |  |
| `latitude` | double precision |  | não |  |  |
| `longitude` | double precision |  | não |  |  |
| `status` | enum `status_chamado` |  | sim | 'ABERTO' |  |
| `aberto_em` | timestamp with time zone |  | sim | now() |  |
| `encerrado_em` | timestamp with time zone |  | não |  |  |

Chaves estrangeiras:

- `atendimento_id` → `atendimentos(id)` — ao excluir: no action
- `solicitante_id` → `usuarios(id)` — ao excluir: no action
- `operador_id` → `usuarios(id)` — ao excluir: no action

## Financeiro (DC7, DC8)

### `formas_pagamento`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `cliente_id` | uuid | FK | sim |  |  |
| `tipo` | enum `tipo_forma_pagamento` |  | sim |  |  |
| `chave_pix` | varchar(120) |  | não |  |  |
| `token_gateway` | varchar(120) |  | não |  | RNF37: nunca o número do cartão |
| `bandeira` | varchar(30) |  | não |  |  |
| `final_cartao` | varchar(4) |  | não |  |  |
| `principal` | boolean |  | sim | false |  |
| `ativa` | boolean |  | sim | true |  |
| `criada_em` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `cliente_id` → `clientes(usuario_id)` — ao excluir: cascade

### `pagamentos`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `atendimento_id` | uuid | FK | sim |  |  |
| `forma_pagamento_id` | uuid | FK | não |  |  |
| `valor` | numeric(10, 2) |  | sim |  |  |
| `meio` | enum `tipo_forma_pagamento` |  | não |  |  |
| `status` | enum `status_pagamento` |  | sim | 'PENDENTE' |  |
| `referencia_gateway` | varchar(80) | UK | não |  |  |
| `mensagem_gateway` | varchar(200) |  | não |  |  |
| `tentativas` | integer |  | sim | 0 |  |
| `criado_em` | timestamp with time zone |  | sim | now() |  |
| `confirmado_em` | timestamp with time zone |  | não |  |  |

Chaves estrangeiras:

- `atendimento_id` → `atendimentos(id)` — ao excluir: no action
- `forma_pagamento_id` → `formas_pagamento(id)` — ao excluir: no action

Índices e regras de integridade:

- índice único `pagamentos_um_pago_por_atendimento` em (atendimento_id) onde status = 'PAGO'

### `contas_bancarias`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `interprete_id` | uuid | FK | sim |  |  |
| `banco` | varchar(60) |  | sim |  |  |
| `agencia` | varchar(10) |  | sim |  |  |
| `conta` | varchar(20) |  | sim |  |  |
| `titular` | varchar(120) |  | sim |  |  |
| `chave_pix` | varchar(120) |  | não |  |  |
| `principal` | boolean |  | sim | true |  |

Chaves estrangeiras:

- `interprete_id` → `interpretes(usuario_id)` — ao excluir: cascade

### `repasses`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `interprete_id` | uuid | FK | sim |  |  |
| `conta_bancaria_id` | uuid | FK | não |  |  |
| `valor` | numeric(10, 2) |  | sim |  |  |
| `status` | enum `status_repasse` |  | sim | 'SOLICITADO' |  |
| `referencia_gateway` | varchar(80) |  | não |  |  |
| `solicitado_em` | timestamp with time zone |  | sim | now() |  |
| `concluido_em` | timestamp with time zone |  | não |  |  |

Chaves estrangeiras:

- `interprete_id` → `interpretes(usuario_id)` — ao excluir: no action
- `conta_bancaria_id` → `contas_bancarias(id)` — ao excluir: no action

### `lancamentos_financeiros`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `interprete_id` | uuid | FK | sim |  |  |
| `pagamento_id` | uuid | FK | não |  |  |
| `repasse_id` | uuid | FK | não |  |  |
| `tipo` | enum `tipo_lancamento` |  | sim |  |  |
| `valor` | numeric(10, 2) |  | sim |  | positivo = crédito, negativo = débito |
| `descricao` | varchar(200) |  | não |  |  |
| `data` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `interprete_id` → `interpretes(usuario_id)` — ao excluir: no action
- `pagamento_id` → `pagamentos(id)` — ao excluir: no action
- `repasse_id` → `repasses(id)` — ao excluir: no action

Índices e regras de integridade:

- índice `lancamentos_interprete_idx` em (interprete_id, data)
- CHECK `lancamentos_origem_check`: (pagamento_id IS NOT NULL AND repasse_id IS NULL) OR (pagamento_id IS NULL AND repasse_id IS NOT NULL)

## Pós-atendimento (DC9)

### `avaliacoes`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `atendimento_id` | uuid | FK | sim |  |  |
| `autor_id` | uuid | FK | sim |  |  |
| `avaliado_id` | uuid | FK | sim |  |  |
| `nota` | smallint |  | sim |  |  |
| `comentario` | varchar(500) |  | não |  |  |
| `data` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `atendimento_id` → `atendimentos(id)` — ao excluir: cascade
- `autor_id` → `usuarios(id)` — ao excluir: no action
- `avaliado_id` → `usuarios(id)` — ao excluir: no action

Índices e regras de integridade:

- índice único `avaliacoes_autor_por_atendimento_unique` em (atendimento_id, autor_id)
- CHECK `avaliacoes_nota_check`: nota BETWEEN 1 AND 5
- CHECK `avaliacoes_autor_diferente_check`: autor_id <> avaliado_id

### `comprovantes`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `atendimento_id` | uuid | FK, UK | sim |  |  |
| `codigo_verificacao` | uuid | UK | sim | gen_random_uuid() | RNF41 |
| `data_atendimento` | timestamp with time zone |  | sim |  |  |
| `url_pdf` | text |  | sim |  |  |
| `emitido_em` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `atendimento_id` → `atendimentos(id)` — ao excluir: no action

## Privacidade, notificações, sessões e auditoria (DC10, DC11)

### `consentimentos`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `usuario_id` | uuid | FK | sim |  |  |
| `finalidade` | enum `finalidade_consentimento` |  | sim |  |  |
| `versao_termo` | varchar(20) |  | sim |  |  |
| `concedido_em` | timestamp with time zone |  | sim | now() |  |
| `revogado_em` | timestamp with time zone |  | não |  |  |

Chaves estrangeiras:

- `usuario_id` → `usuarios(id)` — ao excluir: cascade

### `solicitacoes_dados`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `usuario_id` | uuid | FK | sim |  |  |
| `tipo` | enum `tipo_solicitacao_dados` |  | sim |  |  |
| `status` | enum `status_solicitacao_dados` |  | sim | 'ABERTA' |  |
| `criada_em` | timestamp with time zone |  | sim | now() |  |
| `concluida_em` | timestamp with time zone |  | não |  |  |

Chaves estrangeiras:

- `usuario_id` → `usuarios(id)` — ao excluir: cascade

### `notificacoes`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `usuario_id` | uuid | FK | sim |  |  |
| `tipo` | enum `tipo_notificacao` |  | sim |  |  |
| `titulo` | varchar(120) |  | sim |  |  |
| `conteudo` | varchar(500) |  | sim |  |  |
| `referencia_recurso` | varchar(200) |  | não |  | ex.: /cliente/solicitacoes/<id> |
| `lida` | boolean |  | sim | false |  |
| `criada_em` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `usuario_id` → `usuarios(id)` — ao excluir: cascade

Índices e regras de integridade:

- índice `notificacoes_usuario_idx` em (usuario_id, lida)

### `sessoes`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `usuario_id` | uuid | FK | sim |  |  |
| `token_hash` | varchar(64) | UK | sim |  |  |
| `dispositivo` | varchar(200) |  | não |  |  |
| `expira_em` | timestamp with time zone |  | sim |  |  |
| `revogada` | boolean |  | sim | false |  |
| `criada_em` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `usuario_id` → `usuarios(id)` — ao excluir: cascade

### `tokens_recuperacao`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `usuario_id` | uuid | FK | sim |  |  |
| `hash` | varchar(64) | UK | sim |  |  |
| `expira_em` | timestamp with time zone |  | sim |  |  |
| `usado_em` | timestamp with time zone |  | não |  |  |

Chaves estrangeiras:

- `usuario_id` → `usuarios(id)` — ao excluir: cascade

### `eventos_auditoria`

| Coluna | Tipo | Chave | Obrigatória | Padrão | Observação |
|---|---|---|---|---|---|
| `id` | uuid | PK | sim | gen_random_uuid() |  |
| `usuario_id` | uuid | FK | não |  | null = agente automático |
| `tipo` | varchar(60) |  | sim |  | ex.: LOGIN, CADASTRO, ACEITE, CHECKIN, PAGAMENTO, CANCELAMENTO |
| `entidade` | varchar(60) |  | não |  |  |
| `entidade_id` | uuid |  | não |  |  |
| `detalhes` | jsonb |  | não |  |  |
| `ip` | varchar(45) |  | não |  |  |
| `data` | timestamp with time zone |  | sim | now() |  |

Chaves estrangeiras:

- `usuario_id` → `usuarios(id)` — ao excluir: set null

Índices e regras de integridade:

- índice `eventos_auditoria_data_idx` em (data)

## Tipos enumerados

| Enum | Valores |
|---|---|
| `finalidade_consentimento` | TERMOS_USO, PRIVACIDADE, LOCALIZACAO, NOTIFICACOES |
| `papel_usuario` | CLIENTE, INTERPRETE, BACKOFFICE, SUPORTE |
| `resultado_analise` | APROVADO, REPROVADO, CORRECAO |
| `status_atendimento` | AGENDADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO |
| `status_certificacao` | EM_ANALISE, APROVADA, REPROVADA, CORRECAO_SOLICITADA |
| `status_chamado` | ABERTO, EM_ATENDIMENTO, ENCERRADO |
| `status_habilitacao` | PENDENTE, EM_ANALISE, APROVADO, REPROVADO, CORRECAO_SOLICITADA |
| `status_oferta` | ENVIADA, ACEITA, RECUSADA, EXPIRADA |
| `status_pagamento` | PENDENTE, PAGO, FALHOU, ESTORNADO |
| `status_repasse` | SOLICITADO, PROCESSANDO, PAGO, FALHOU |
| `status_solicitacao` | BUSCANDO, ACEITA, EM_ANDAMENTO, CONCLUIDA, CANCELADA |
| `status_solicitacao_dados` | ABERTA, CONCLUIDA, NEGADA |
| `tipo_certificacao` | PROLIBRAS, EQUIVALENTE |
| `tipo_chamado` | SUPORTE, EMERGENCIA |
| `tipo_forma_pagamento` | PIX, CARTAO |
| `tipo_lancamento` | CREDITO_ATENDIMENTO, DEBITO_REPASSE, ESTORNO |
| `tipo_mensagem` | TEXTO, IMAGEM, LOCALIZACAO, SISTEMA |
| `tipo_notificacao` | ACEITE, LEMBRETE, MENSAGEM, PAGAMENTO, CERTIFICACAO, SOLICITACAO, SISTEMA |
| `tipo_servico` | SAUDE, JURIDICO, EDUCACAO, EVENTO, OUTRO |
| `tipo_solicitacao_dados` | EXPORTACAO, EXCLUSAO |
