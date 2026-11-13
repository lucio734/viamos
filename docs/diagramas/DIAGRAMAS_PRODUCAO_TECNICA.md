# Diagramas da Produção Técnica Gerados do Código Real (Bloco P1 — Itens #3, #7, #8, #9, #16, #17, #22, #24, #26)

> Fonte: Autoria própria apoiado por IA generativa — extraídos diretamente de `frontend/src/rotas.tsx`, `backend/src/models/schema.ts` e `backend/src/routes/index.ts`.

---

## 1. Sitemap Completo da Aplicação (Item #3 do Documento / #29 do Dossiê)

```mermaid
flowchart TD
  subgraph Publico["Rotas Públicas (Sem Sessão)"]
    R_SPLASH["/ (Splash)"]
    R_LOGIN["/login (Login)"]
    R_REC["/recuperar-senha"]
    R_RED["/redefinir-senha/:token"]
    R_CAD["/cadastro (Seleção de Perfil)"]
    R_CAD_CLI["/cadastro/cliente"]
    R_CAD_INT["/cadastro/interprete"]
    R_VER["/verificar/:codigo (Verificação Pública RF38)"]
  end

  subgraph Comum["Rotas Autenticadas Comuns (Todos os Papéis)"]
    R_NOTIF["/notificacoes (RF42)"]
    R_SUP["/suporte (Suporte & SOS RF34)"]
  end

  subgraph Cliente["Jornada do Cliente (Papel: CLIENTE)"]
    C_HUB["/cliente (Hub do Cliente)"]
    C_NOVA["/cliente/solicitacoes/nova (3 Passos + Estimativa RF10–RF16)"]
    C_SOL["/cliente/solicitacoes/:id (Timeline + Cancelamento RF18/RF19)"]
    C_ATD["/cliente/atendimentos/:id (QR Code Check-in + Encerrar RF31/RF33)"]
    C_SALA["/cliente/atendimentos/:id/sala (Chat + Foto + GPS RF28–RF30)"]
    C_PAG["/cliente/atendimentos/:id/pagamento (Pix/Cartão + PDF RF35–RF37)"]
    C_AVA["/cliente/atendimentos/:id/avaliar (Avaliação RF40)"]
    C_HIST["/cliente/historico (Filtros + PDF RF39)"]
    C_PERF["/cliente/perfil (Dados + Pagamentos + LGPD RF43/RF45)"]
  end

  subgraph Interprete["Jornada do Intérprete (Papel: INTERPRETE)"]
    I_HUB["/interprete (Hub Online/Offline + Mapa + Ganhos)"]
    I_DEM["/interprete/demandas (Lista & Mapa no Raio RF20)"]
    I_DET_DEM["/interprete/demandas/:id (Aceite Exclusivo / Recusa RF21–RF23)"]
    I_AGD["/interprete/agenda (Raio ≤ 15 km + Disponibilidade Semanal RF24/RF25)"]
    I_ATD["/interprete/atendimentos/:id (Leitor QR + GPS Check-in + Encerrar RF31–RF33)"]
    I_SALA["/interprete/atendimentos/:id/sala (Sala Compartilhada)"]
    I_AVA["/interprete/atendimentos/:id/avaliar (Avaliar Cliente RF40)"]
    I_GAN["/interprete/ganhos (Saldo + Contas + Repasse RF26/RF27)"]
    I_HIST["/interprete/historico (Histórico + PDF RF39)"]
    I_PERF["/interprete/perfil (Foto + Base + Certificações Prolibras + LGPD)"]
  end

  subgraph Backoffice["Jornada do Operador (Papéis: BACKOFFICE / SUPORTE)"]
    B_FILA["/backoffice (Indicadores + Fila de Certificações RF06)"]
    B_PAR["/backoffice/certificacoes/:id (Inspeção de Arquivo + Parecer RF06)"]
    B_CHA["/backoffice/chamados (Gestão de SOS Emergência & Suporte RF34)"]
    B_AUD["/backoffice/auditoria (Trilha Imutável de Auditoria RF44)"]
  end

  R_SPLASH --> R_LOGIN
  R_LOGIN --> R_REC --> R_RED
  R_LOGIN --> R_CAD
  R_CAD --> R_CAD_CLI --> C_HUB
  R_CAD --> R_CAD_INT --> I_HUB
  R_LOGIN --> C_HUB
  R_LOGIN --> I_HUB
  R_LOGIN --> B_FILA

  C_HUB --> C_NOVA --> C_SOL --> C_ATD
  C_ATD --> C_SALA
  C_ATD --> C_PAG --> R_VER
  C_ATD --> C_AVA
  C_HUB --> C_HIST
  C_HUB --> C_PERF

  I_HUB --> I_DEM --> I_DET_DEM --> I_ATD
  I_ATD --> I_SALA
  I_ATD --> I_AVA
  I_HUB --> I_AGD
  I_HUB --> I_GAN
  I_HUB --> I_HIST
  I_HUB --> I_PERF

  B_FILA --> B_PAR
  B_FILA --> B_CHA
  B_FILA --> B_AUD
```

---

## 2. Arquitetura Funcional, Técnica e MVC (Itens #7, #8 e #9 do Documento)

```mermaid
flowchart LR
  subgraph CamadaCliente["Camada de Apresentação — Frontend SPA (Vercel)"]
    UI["React 19 + TypeScript + Tailwind v4"]
    LEAF["Leaflet / OpenStreetMap (Mapa.tsx)"]
    QR["qrcode.react & html5-qrcode (LeitorQr.tsx)"]
    API_CLI["Cliente HTTP Autenticado + Blob Download (cliente.ts)"]
  end

  subgraph CamadaServidor["Camada de Aplicação — Backend MVC (Render)"]
    ROT["Routes (src/routes/index.ts)"]
    MID["Middlewares (JWT + Sessão Revogável, RBAC, Zod, Rate Limit, Erros)"]
    CTL["Controllers (src/controllers/*.controller.ts)"]
    SVC["Services — Regras de Negócio D-01 a D-18 (src/services/*.service.ts)"]
    VW["Views / Presenters JSON & PDFKit (src/views/comprovante.view.ts)"]
    MOD["Models — Drizzle ORM (src/models/schema.ts)"]
  end

  subgraph CamadaDados["Camada de Persistência (Neon / Render PostgreSQL)"]
    PG[("PostgreSQL 16/18\n27 Tabelas + Índices Únicos\n+ Trigger de Auditoria Imutável")]
  end

  UI --> LEAF
  UI --> QR
  UI --> API_CLI
  API_CLI -->|"HTTPS REST JSON / Blob"| ROT
  ROT --> MID --> CTL --> SVC
  SVC --> VW
  SVC --> MOD -->|"Consultas Parametrizadas SQL"| PG
```

---

## 3. Macroprocesso e Fluxograma do Atendimento Presencial (Itens #16 e #17)

```mermaid
flowchart TD
  A(["Início: Necessidade de Mediação Presencial em Libras"]) --> B["Cliente informa Contexto, Data/Hora, Duração (≥ 60 min) e Local no Mapa"]
  B --> C["Sistema calcula Estimativa Transparente (RF15) e Cliente confirma"]
  C --> D["Motor Geoespacial (Haversine) filtra Intérpretes Aprovados e Online cujo Raio ≤ 15 km cobre o ponto (RF17)"]
  D --> E{"Algum Intérprete Aceitou?"}
  E -- "Recusou" --> D
  E -- "Cancelar antes do Check-in" --> X["Política de Cancelamento aplicada (RF19)"]
  E -- "Aceite Exclusivo Atômico (RF22)" --> F["Atendimento Agendado + Sala de Chat/Foto/GPS liberada (RF28–RF30)"]
  F --> G["Encontro Presencial no Local: Cliente exibe QR Code e Intérprete lê com GPS"]
  G --> H{"Janela ≤ 30 min, Precisão ≤ 50 m e Distância ≤ 200 m?"}
  H -- "Não" --> G_ERR["Check-in Recusado (HTTP 422) com motivo claro"] --> G
  H -- "Sim (RF31/RF32)" --> I["Atendimento EM_ANDAMENTO"]
  I --> J["Encerramento Único (RF33): Apura Duração Real e Valor Final"]
  J --> K["Cliente processa Pagamento via Pix ou Cartão (RF36)"]
  K --> L{"Gateway Aprovou?"}
  L -- "Recusado (402)" --> K
  L -- "Aprovado (200)" --> M["Emite Comprovante PDF com Código Público (RF37/RF38) + Credita 90% ao Intérprete (RF26)"]
  M --> N["Avaliação Bilateral 1–5 Estrelas (RF40) + Solicitação de Repasse (RF27)"]
  N --> O(["Fim do Ciclo Auditado (RF44)"])
```

---

## 4. Diagrama de Operação / Sequência — Aceite Exclusivo, Check-in e Pagamento (Item #24)

```mermaid
sequenceDiagram
  autonumber
  actor Cli as Cliente (Surdo)
  actor Int1 as Intérprete A
  actor Int2 as Intérprete B
  participant API as Backend MVC (Express)
  participant DB as PostgreSQL (Transacional)

  Cli->>API: POST /api/solicitacoes (lat, lng, inicio, duracao)
  API->>DB: INSERT solicitacoes (status='BUSCANDO') + ofertas por Haversine
  DB-->>API: Solicitação criada

  par Concorrência de Aceite (RF22 / RNF33)
    Int1->>API: POST /api/demandas/:id/aceitar
    Int2->>API: POST /api/demandas/:id/aceitar
  end
  API->>DB: UPDATE solicitacoes SET status='ACEITA' WHERE id=:id AND status='BUSCANDO'
  DB-->>API: 1 linha afetada (Intérprete A vence) + INSERT atendimentos (UNIQUE solicitacao_id)
  API-->>Int1: 200 OK (Atendimento alocado)
  API-->>Int2: 409 Conflict (SOLICITACAO_INDISPONIVEL)

  Cli->>API: GET /api/atendimentos/:id/qrcode
  API-->>Cli: 200 OK (codigoQr)

  Int1->>API: POST /api/atendimentos/:id/checkin (codigoQr, lat, lng, precisaoM)
  API->>DB: Valida janela 30 min, precisão <= 50m, distância <= 200m + INSERT checkins
  API-->>Int1: 200 OK (status='EM_ANDAMENTO')

  Int1->>API: POST /api/atendimentos/:id/encerrar
  API->>DB: Calcula duração real/valor final + UPDATE atendimentos (status='CONCLUIDO') + INSERT pagamentos
  API-->>Int1: 200 OK

  Cli->>API: POST /api/pagamentos/:id/processar
  API->>DB: Atualiza pagamento='PAGO' + INSERT comprovantes + INSERT lancamentos_financeiros (CREDITO)
  API-->>Cli: 200 OK (Comprovante PDF disponível)
```

---

## 5. Diagrama Entidade-Relacionamento — DER de 27 Tabelas (Item #22 / #38 do Dossiê)

```mermaid
erDiagram
  USUARIOS ||--o| CLIENTES : "1:1 perfil"
  USUARIOS ||--o| INTERPRETES : "1:1 perfil"
  USUARIOS ||--o{ SESSOES : "possui"
  USUARIOS ||--o{ TOKENS_RECUPERACAO : "solicita"
  USUARIOS ||--o{ CONSENTIMENTOS : "concede"
  USUARIOS ||--o{ SOLICITACOES_DADOS : "exerce LGPD"
  USUARIOS ||--o{ NOTIFICACOES : "recebe"
  USUARIOS ||--o{ EVENTOS_AUDITORIA : "gera"

  INTERPRETES ||--o{ CERTIFICACOES : "envia"
  CERTIFICACOES ||--o{ ANALISES_DOCUMENTAIS : "recebe parecer"
  INTERPRETES ||--o{ DISPONIBILIDADES : "configura agenda"
  INTERPRETES ||--o{ CONTAS_BANCARIAS : "cadastra"
  INTERPRETES ||--o{ REPASSES : "solicita"
  INTERPRETES ||--o{ LANCAMENTOS_FINANCEIROS : "movimenta"

  CLIENTES ||--o{ FORMAS_PAGAMENTO : "salva"
  CLIENTES ||--o{ SOLICITACOES : "abre"

  SOLICITACOES ||--o{ COTACOES : "calcula"
  SOLICITACOES ||--o{ OFERTAS : "distribui no raio"
  INTERPRETES ||--o{ OFERTAS : "recebe"
  SOLICITACOES ||--o| ATENDIMENTOS : "gera (1:1 único)"

  ATENDIMENTOS ||--o| CHECKINS : "valida presença"
  ATENDIMENTOS ||--o{ MENSAGENS : "sala"
  ATENDIMENTOS ||--o{ LOCALIZACOES_COMPARTILHADAS : "rastreia janela"
  ATENDIMENTOS ||--o{ CHAMADOS_SUPORTE : "aciona SOS"
  ATENDIMENTOS ||--o{ PAGAMENTOS : "cobra"
  ATENDIMENTOS ||--o| COMPROVANTES : "emite PDF"
  ATENDIMENTOS ||--o{ AVALIACOES : "avalia"

  USUARIOS {
    uuid id PK
    varchar nome
    varchar email UK
    varchar senha_hash
    enum papel "CLIENTE | INTERPRETE | BACKOFFICE | SUPORTE"
    enum status "ATIVO | INATIVO | BLOQUEADO | ANONIMIZADO"
    int tentativas_falhas
    timestamp bloqueado_ate
  }
  CLIENTES {
    uuid usuario_id PK,FK
    varchar cpf UK
    date data_nascimento
    varchar cep
    varchar endereco
  }
  INTERPRETES {
    uuid usuario_id PK,FK
    varchar documento UK
    enum status_habilitacao "PENDENTE | EM_ANALISE | APROVADO | REPROVADO | CORRECAO_SOLICITADA"
    int raio_km "CHECK 1..15"
    double latitude_base
    double longitude_base
    boolean disponivel_agora
    numeric preco_hora
  }
  SOLICITACOES {
    uuid id PK
    uuid cliente_usuario_id FK
    enum tipo_servico "SAUDE | JURIDICO | EDUCACAO | EVENTO | OUTRO"
    timestamp inicio_previsto
    int duracao_prevista_min "CHECK >= 60"
    double latitude
    double longitude
    enum status "BUSCANDO | ACEITA | EM_ANDAMENTO | CONCLUIDA | CANCELADA"
  }
  ATENDIMENTOS {
    uuid id PK
    uuid solicitacao_id FK,UK
    uuid cliente_usuario_id FK
    uuid interprete_usuario_id FK
    varchar codigo_qr UK
    enum status "AGENDADO | EM_ANDAMENTO | CONCLUIDO | CANCELADO"
    int duracao_real_min
    numeric valor_final
  }
```
