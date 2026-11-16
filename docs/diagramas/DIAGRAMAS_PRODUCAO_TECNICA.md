<!-- ARQUIVO GERADO por docs/diagramas/gerar.mjs — não edite à mão; altere o código-fonte e rode `npm run gerar`. -->

# Diagramas da Produção Técnica gerados do código (Bloco P1)

Este índice reúne 34 diagramas dos itens #3, #7, #8, #9, #16, #17, #22, #23, #24, #26, #27, #28 do checklist. Todos são gerados por `docs/diagramas/gerar.mjs` a partir do código-fonte; as figuras em PNG ficam em `docs/producao-tecnica/figuras/` e as fontes Mermaid em `docs/diagramas/fontes/`.

Base da geração: 27 tabelas, 33 rotas (30 telas distintas), 65 endpoints e 91 transições entre telas lidas do código.

## Como regenerar

```bash
cd backend && npm install && npm run docs:modelo      # exporta o modelo do banco (schema.ts → dados/modelo.json)
cd ../docs/diagramas && npm install                   # Mermaid CLI + TypeScript
npm run gerar                                         # fontes .mmd, dados e tabelas
npm run figuras                                       # idem + PNGs (usa o Chrome ou o Edge instalado)
npm run verificar                                     # falha se algo versionado estiver desatualizado
```

Detalhes e solução de problemas: [`README.md`](README.md).

## Sumário

| Item | Assunto | Figuras |
|---|---|---|
| #3 | Sitemap | [03-sitemap-backoffice](#03-sitemap-backoffice)<br/>[03-sitemap-cliente](#03-sitemap-cliente)<br/>[03-sitemap-completo](#03-sitemap-completo)<br/>[03-sitemap-interprete](#03-sitemap-interprete)<br/>[03-sitemap-publico](#03-sitemap-publico) |
| #7 | Arquitetura funcional | [07-arquitetura-funcional](#07-arquitetura-funcional) |
| #8 | Arquitetura técnica | [08-arquitetura-tecnica](#08-arquitetura-tecnica) |
| #9 | Arquitetura MVC | [09-arquitetura-mvc](#09-arquitetura-mvc) |
| #16 | Macroprocesso | [16-macroprocesso](#16-macroprocesso) |
| #17 | Fluxograma | [17-fluxograma-1-solicitacao-e-estimativa](#17-fluxograma-1-solicitacao-e-estimativa)<br/>[17-fluxograma-2-resposta-e-aceite](#17-fluxograma-2-resposta-e-aceite)<br/>[17-fluxograma-3-encontro-e-checkin](#17-fluxograma-3-encontro-e-checkin)<br/>[17-fluxograma-4-pagamento-e-avaliacao](#17-fluxograma-4-pagamento-e-avaliacao) |
| #22 | Diagrama entidade-relacionamento | [22-der-1-identidade-e-perfis](#22-der-1-identidade-e-perfis)<br/>[22-der-2-solicitacao-cotacao-distribuicao-e-aceite](#22-der-2-solicitacao-cotacao-distribuicao-e-aceite)<br/>[22-der-3-atendimento-presencial](#22-der-3-atendimento-presencial)<br/>[22-der-4-financeiro](#22-der-4-financeiro)<br/>[22-der-5-pos-atendimento](#22-der-5-pos-atendimento)<br/>[22-der-6-privacidade-notificacoes-sessoes-e-auditoria](#22-der-6-privacidade-notificacoes-sessoes-e-auditoria)<br/>[22-der-visao-geral](#22-der-visao-geral) |
| #23 | Diagrama de estado de máquina | [23-estados-1-solicitacao](#23-estados-1-solicitacao)<br/>[23-estados-2-atendimento](#23-estados-2-atendimento)<br/>[23-estados-3-pagamento](#23-estados-3-pagamento)<br/>[23-estados-4-habilitacao](#23-estados-4-habilitacao) |
| #24 | Diagrama de operação | [24-operacao-a-aceite-exclusivo](#24-operacao-a-aceite-exclusivo)<br/>[24-operacao-b-checkin](#24-operacao-b-checkin)<br/>[24-operacao-c-encerramento](#24-operacao-c-encerramento)<br/>[24-operacao-d-pagamento-comprovante](#24-operacao-d-pagamento-comprovante) |
| #26 | Diagrama de processos (telas) | [26-telas-backoffice](#26-telas-backoffice)<br/>[26-telas-cliente](#26-telas-cliente)<br/>[26-telas-interprete](#26-telas-interprete)<br/>[26-telas-publico](#26-telas-publico) |
| #27 | Ferramenta CASE | [27-ferramenta-case](#27-ferramenta-case) |
| #28 | Diagrama de contexto | [28-diagrama-de-contexto](#28-diagrama-de-contexto) |

Tabelas de apoio (geradas dos mesmos dados): [`dicionario-de-dados.md`](../producao-tecnica/tabelas/dicionario-de-dados.md) · [`rotas-e-telas.md`](../producao-tecnica/tabelas/rotas-e-telas.md) · [`api.md`](../producao-tecnica/tabelas/api.md) · [`tecnologias.md`](../producao-tecnica/tabelas/tecnologias.md) · [`transicoes-de-telas.md`](../producao-tecnica/tabelas/transicoes-de-telas.md).

## Item #3 — Sitemap

<a id="03-sitemap-backoffice"></a>

### Sitemap — backoffice

![Sitemap — backoffice](../producao-tecnica/figuras/03-sitemap-backoffice.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Parte do sitemap: 4 rotas de acesso por papéis BACKOFFICE e SUPORTE, mais 2 telas comuns.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/03-sitemap-backoffice.mmd</code>)</summary>

```mermaid
flowchart TD
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  entrada(["/login — autenticação"]):::externo
  subgraph sg_backoffice["Backoffice — papéis BACKOFFICE e SUPORTE"]
    r_backoffice["<b>Fila de certificações</b><br/>/backoffice"]
    r_backoffice_certificacoes_id["<b>Parecer da certificação</b><br/>/backoffice/certificacoes/:id"]
    r_backoffice_chamados["<b>Chamados de suporte</b><br/>/backoffice/chamados"]
    r_backoffice_auditoria["<b>Trilha de auditoria</b><br/>/backoffice/auditoria"]
  end
  r_backoffice --> r_backoffice_certificacoes_id
  r_backoffice --> r_backoffice_chamados
  r_backoffice --> r_backoffice_auditoria
  class r_backoffice hub;
  entrada ==>|"BACKOFFICE / SUPORTE"| r_backoffice
  subgraph sg_comum["Telas comuns (qualquer papel autenticado)"]
    r_notificacoes["<b>Notificações</b><br/>/notificacoes"]
    r_suporte["<b>Suporte</b><br/>/suporte"]
  end
  r_backoffice -.-> r_notificacoes
  r_backoffice -.-> r_suporte
```

</details>

<a id="03-sitemap-cliente"></a>

### Sitemap — área do cliente

![Sitemap — área do cliente](../producao-tecnica/figuras/03-sitemap-cliente.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Parte do sitemap: 9 rotas de acesso por papel CLIENTE, mais 2 telas comuns.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/03-sitemap-cliente.mmd</code>)</summary>

```mermaid
flowchart TD
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  entrada(["/login — autenticação"]):::externo
  subgraph sg_cliente["Área do cliente — papel CLIENTE"]
    r_cliente["<b>Hub do cliente</b><br/>/cliente"]
    r_cliente_solicitacoes_nova["<b>Nova solicitação</b><br/>/cliente/solicitacoes/nova"]
    r_cliente_solicitacoes_id["<b>Acompanhamento da solicitação</b><br/>/cliente/solicitacoes/:id"]
    r_cliente_atendimentos_id["<b>Detalhe do atendimento (cliente)</b><br/>/cliente/atendimentos/:id"]
    r_cliente_atendimentos_id_sala["<b>Sala de atendimento (cliente)</b><br/>/cliente/atendimentos/:id/sala"]
    r_cliente_atendimentos_id_pagamento["<b>Pagamento</b><br/>/cliente/atendimentos/:id/pagamento"]
    r_cliente_atendimentos_id_avaliar["<b>Avaliar intérprete</b><br/>/cliente/atendimentos/:id/avaliar"]
    r_cliente_historico["<b>Histórico (cliente)</b><br/>/cliente/historico"]
    r_cliente_perfil["<b>Perfil (cliente)</b><br/>/cliente/perfil"]
  end
  r_cliente --> r_cliente_solicitacoes_nova
  r_cliente --> r_cliente_solicitacoes_id
  r_cliente --> r_cliente_atendimentos_id
  r_cliente_atendimentos_id --> r_cliente_atendimentos_id_sala
  r_cliente_atendimentos_id --> r_cliente_atendimentos_id_pagamento
  r_cliente_atendimentos_id --> r_cliente_atendimentos_id_avaliar
  r_cliente --> r_cliente_historico
  r_cliente --> r_cliente_perfil
  class r_cliente hub;
  entrada ==>|"CLIENTE"| r_cliente
  subgraph sg_comum["Telas comuns (qualquer papel autenticado)"]
    r_notificacoes["<b>Notificações</b><br/>/notificacoes"]
    r_suporte["<b>Suporte</b><br/>/suporte"]
  end
  r_cliente -.-> r_notificacoes
  r_cliente -.-> r_suporte
```

</details>

<a id="03-sitemap-completo"></a>

### Sitemap completo da aplicação

![Sitemap completo da aplicação](../producao-tecnica/figuras/03-sitemap-completo.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Gerado de `frontend/src/rotas.tsx`: 33 rotas (30 telas distintas) em 5 áreas. Setas finas: hierarquia de URL (a rota de destino é filha da de origem; as filhas mostram só o trecho que acrescentam ao caminho, como `…/sala`). Setas grossas: entrada na área após o login, com o papel exigido pela guarda `Protegida`. Setas tracejadas: telas comuns, acessíveis a qualquer papel com sessão ativa. Os caminhos completos estão nas figuras de cada área e em `docs/producao-tecnica/tabelas/rotas-e-telas.md`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/03-sitemap-completo.mmd</code>)</summary>

```mermaid
flowchart LR
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  subgraph sg_publico["Área pública (sem login) · 8 rotas"]
    r_raiz["<b>Splash</b><br/>/"]
    r_login["<b>Login</b><br/>/login"]
    r_recuperar_senha["<b>Recuperar senha</b><br/>/recuperar-senha"]
    r_redefinir_senha_token["<b>Redefinir senha</b><br/>/redefinir-senha/:token"]
    r_cadastro["<b>Seleção de perfil</b><br/>/cadastro"]
    r_cadastro_cliente["<b>Cadastro do cliente</b><br/>…/cliente"]
    r_cadastro_interprete["<b>Cadastro do intérprete</b><br/>…/interprete"]
    r_verificar_codigo["<b>Verificar comprovante</b><br/>/verificar/:codigo"]
  end
  subgraph sg_cliente["Área do cliente · 9 rotas"]
    r_cliente["<b>Hub do cliente</b><br/>/cliente"]
    r_cliente_solicitacoes_nova["<b>Nova solicitação</b><br/>…/solicitacoes/nova"]
    r_cliente_solicitacoes_id["<b>Acompanhamento da solicitação</b><br/>…/solicitacoes/:id"]
    r_cliente_atendimentos_id["<b>Detalhe do atendimento (cliente)</b><br/>…/atendimentos/:id"]
    r_cliente_atendimentos_id_sala["<b>Sala de atendimento (cliente)</b><br/>…/sala"]
    r_cliente_atendimentos_id_pagamento["<b>Pagamento</b><br/>…/pagamento"]
    r_cliente_atendimentos_id_avaliar["<b>Avaliar intérprete</b><br/>…/avaliar"]
    r_cliente_historico["<b>Histórico (cliente)</b><br/>…/historico"]
    r_cliente_perfil["<b>Perfil (cliente)</b><br/>…/perfil"]
  end
  subgraph sg_interprete["Área do intérprete · 10 rotas"]
    r_interprete["<b>Hub do intérprete</b><br/>/interprete"]
    r_interprete_demandas["<b>Demandas próximas</b><br/>…/demandas"]
    r_interprete_demandas_id["<b>Detalhe da demanda</b><br/>…/:id"]
    r_interprete_agenda["<b>Raio e disponibilidade</b><br/>…/agenda"]
    r_interprete_atendimentos_id["<b>Detalhe do atendimento (intérprete)</b><br/>…/atendimentos/:id"]
    r_interprete_atendimentos_id_sala["<b>Sala de atendimento (intérprete)</b><br/>…/sala"]
    r_interprete_atendimentos_id_avaliar["<b>Avaliar cliente</b><br/>…/avaliar"]
    r_interprete_ganhos["<b>Ganhos e repasse</b><br/>…/ganhos"]
    r_interprete_historico["<b>Histórico (intérprete)</b><br/>…/historico"]
    r_interprete_perfil["<b>Perfil e habilitação</b><br/>…/perfil"]
  end
  subgraph sg_backoffice["Backoffice · 4 rotas"]
    r_backoffice["<b>Fila de certificações</b><br/>/backoffice"]
    r_backoffice_certificacoes_id["<b>Parecer da certificação</b><br/>…/certificacoes/:id"]
    r_backoffice_chamados["<b>Chamados de suporte</b><br/>…/chamados"]
    r_backoffice_auditoria["<b>Trilha de auditoria</b><br/>…/auditoria"]
  end
  subgraph sg_comum["Telas comuns · 2 rotas"]
    r_notificacoes["<b>Notificações</b><br/>/notificacoes"]
    r_suporte["<b>Suporte</b><br/>/suporte"]
  end
  r_raiz --> r_login
  r_raiz --> r_recuperar_senha
  r_raiz --> r_redefinir_senha_token
  r_raiz --> r_cadastro
  r_cadastro --> r_cadastro_cliente
  r_cadastro --> r_cadastro_interprete
  r_raiz --> r_verificar_codigo
  r_cliente --> r_cliente_solicitacoes_nova
  r_cliente --> r_cliente_solicitacoes_id
  r_cliente --> r_cliente_atendimentos_id
  r_cliente_atendimentos_id --> r_cliente_atendimentos_id_sala
  r_cliente_atendimentos_id --> r_cliente_atendimentos_id_pagamento
  r_cliente_atendimentos_id --> r_cliente_atendimentos_id_avaliar
  r_cliente --> r_cliente_historico
  r_cliente --> r_cliente_perfil
  r_interprete --> r_interprete_demandas
  r_interprete_demandas --> r_interprete_demandas_id
  r_interprete --> r_interprete_agenda
  r_interprete --> r_interprete_atendimentos_id
  r_interprete_atendimentos_id --> r_interprete_atendimentos_id_sala
  r_interprete_atendimentos_id --> r_interprete_atendimentos_id_avaliar
  r_interprete --> r_interprete_ganhos
  r_interprete --> r_interprete_historico
  r_interprete --> r_interprete_perfil
  r_backoffice --> r_backoffice_certificacoes_id
  r_backoffice --> r_backoffice_chamados
  r_backoffice --> r_backoffice_auditoria
  r_login ==>|"login · CLIENTE"| r_cliente
  class r_cliente hub;
  r_login ==>|"login · INTERPRETE"| r_interprete
  class r_interprete hub;
  r_login ==>|"login · BACKOFFICE / SUPORTE"| r_backoffice
  class r_backoffice hub;
  r_login -.->|"sessão ativa"| r_notificacoes
  r_login -.->|"sessão ativa"| r_suporte
  class r_raiz hub;
```

</details>

<a id="03-sitemap-interprete"></a>

### Sitemap — área do intérprete

![Sitemap — área do intérprete](../producao-tecnica/figuras/03-sitemap-interprete.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Parte do sitemap: 10 rotas de acesso por papel INTERPRETE, mais 2 telas comuns.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/03-sitemap-interprete.mmd</code>)</summary>

```mermaid
flowchart TD
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  entrada(["/login — autenticação"]):::externo
  subgraph sg_interprete["Área do intérprete — papel INTERPRETE"]
    r_interprete["<b>Hub do intérprete</b><br/>/interprete"]
    r_interprete_demandas["<b>Demandas próximas</b><br/>/interprete/demandas"]
    r_interprete_demandas_id["<b>Detalhe da demanda</b><br/>/interprete/demandas/:id"]
    r_interprete_agenda["<b>Raio e disponibilidade</b><br/>/interprete/agenda"]
    r_interprete_atendimentos_id["<b>Detalhe do atendimento (intérprete)</b><br/>/interprete/atendimentos/:id"]
    r_interprete_atendimentos_id_sala["<b>Sala de atendimento (intérprete)</b><br/>/interprete/atendimentos/:id/sala"]
    r_interprete_atendimentos_id_avaliar["<b>Avaliar cliente</b><br/>/interprete/atendimentos/:id/avaliar"]
    r_interprete_ganhos["<b>Ganhos e repasse</b><br/>/interprete/ganhos"]
    r_interprete_historico["<b>Histórico (intérprete)</b><br/>/interprete/historico"]
    r_interprete_perfil["<b>Perfil e habilitação</b><br/>/interprete/perfil"]
  end
  r_interprete --> r_interprete_demandas
  r_interprete_demandas --> r_interprete_demandas_id
  r_interprete --> r_interprete_agenda
  r_interprete --> r_interprete_atendimentos_id
  r_interprete_atendimentos_id --> r_interprete_atendimentos_id_sala
  r_interprete_atendimentos_id --> r_interprete_atendimentos_id_avaliar
  r_interprete --> r_interprete_ganhos
  r_interprete --> r_interprete_historico
  r_interprete --> r_interprete_perfil
  class r_interprete hub;
  entrada ==>|"INTERPRETE"| r_interprete
  subgraph sg_comum["Telas comuns (qualquer papel autenticado)"]
    r_notificacoes["<b>Notificações</b><br/>/notificacoes"]
    r_suporte["<b>Suporte</b><br/>/suporte"]
  end
  r_interprete -.-> r_notificacoes
  r_interprete -.-> r_suporte
```

</details>

<a id="03-sitemap-publico"></a>

### Sitemap — área pública (sem login)

![Sitemap — área pública (sem login)](../producao-tecnica/figuras/03-sitemap-publico.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Parte do sitemap: 8 rotas de acesso por qualquer visitante.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/03-sitemap-publico.mmd</code>)</summary>

```mermaid
flowchart TD
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  subgraph sg_publico["Área pública (sem login) — qualquer visitante"]
    r_raiz["<b>Splash</b><br/>/"]
    r_login["<b>Login</b><br/>/login"]
    r_recuperar_senha["<b>Recuperar senha</b><br/>/recuperar-senha"]
    r_redefinir_senha_token["<b>Redefinir senha</b><br/>/redefinir-senha/:token"]
    r_cadastro["<b>Seleção de perfil</b><br/>/cadastro"]
    r_cadastro_cliente["<b>Cadastro do cliente</b><br/>/cadastro/cliente"]
    r_cadastro_interprete["<b>Cadastro do intérprete</b><br/>/cadastro/interprete"]
    r_verificar_codigo["<b>Verificar comprovante</b><br/>/verificar/:codigo"]
  end
  r_raiz --> r_login
  r_raiz --> r_recuperar_senha
  r_raiz --> r_redefinir_senha_token
  r_raiz --> r_cadastro
  r_cadastro --> r_cadastro_cliente
  r_cadastro --> r_cadastro_interprete
  r_raiz --> r_verificar_codigo
  class r_raiz hub;
```

</details>

## Item #7 — Arquitetura funcional

<a id="07-arquitetura-funcional"></a>

### Arquitetura funcional

![Arquitetura funcional](../producao-tecnica/figuras/07-arquitetura-funcional.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Cada caixa é um módulo de negócio do backend (um arquivo em `backend/src/services`: 14 serviços), com os requisitos declarados no cabeçalho do arquivo e o número de endpoints que o acionam (65 no total), separados pelo acesso que a rota exige em `backend/src/routes/index.ts` ("qualquer papel" = basta estar autenticado). Os módulos estão agrupados em faixas; as setas são as importações reais entre serviços — dentro da faixa, de módulo para módulo; entre faixas, rotuladas com os módulos e as funções importadas. Os serviços transversais (auditoria e notificacao) são chamados por quase todos os módulos e por isso aparecem sem setas.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/07-arquitetura-funcional.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  subgraph sg_interface["Interface e recursos do aparelho"]
    spa["<b>Interface web (SPA)</b><br/>30 telas · 33 rotas · cliente, intérprete e operador"]:::hub
    gps["GPS do aparelho<br/>check-in e localização"]:::externo
    camera["Câmera<br/>leitura do QR Code"]:::externo
    osm["OpenStreetMap e Nominatim<br/>mapa e busca de endereço"]:::externo
    spa -.-> gps & camera & osm
  end
  subgraph sg_api["Backend — API REST · 65 endpoints · 14 módulos"]
    subgraph sg_contratacao["Contratação"]
      m_demanda["<b>Demandas, aceite exclusivo e<br/>agenda</b><br/>RF20–RF25, RNF36<br/>7 endpoints: 7 intérprete"]
      m_solicitacao["<b>Solicitação, estimativa e<br/>distribuição</b><br/>RF10–RF19<br/>6 endpoints: 5 cliente · 1 qualquer papel"]
      m_solicitacao -->|"interpreteElegivelParaDemanda, travarDistribuicaoDemandas"| m_demanda
    end
    subgraph sg_financeiro["Financeiro e comprovação"]
      m_comprovante["<b>Comprovante e verificação<br/>pública</b><br/>RF37, RF38, RNF41<br/>2 endpoints: 1 qualquer papel · 1 público"]
      m_pagamento["<b>Pagamento, ganhos e repasse</b><br/>RF26, RF27, RF35–RF37<br/>11 endpoints: 5 cliente · 5 intérprete<br/>1 qualquer papel"]
    end
    subgraph sg_execucao["Execução presencial"]
      m_atendimento["<b>Atendimento presencial:<br/>sala, check-in, encerramento<br/>e suporte</b><br/>RF28–RF34, RF39<br/>11 endpoints: 1 cliente · 1 intérprete<br/>9 qualquer papel"]
      m_avaliacao["<b>Avaliação bilateral e<br/>reputação</b><br/>RF40, RF41, RNF42<br/>1 endpoint: 1 qualquer papel"]
      m_avaliacao -->|"exigirParticipante"| m_atendimento
    end
    subgraph sg_operacao["Operação (backoffice)"]
      m_backoffice["<b>Habilitação de intérpretes,<br/>chamados e indicadores</b><br/>RF06, RNF36<br/>8 endpoints: 2 intérprete · 5 operador<br/>1 qualquer papel"]
    end
    subgraph sg_acesso["Acesso e cadastro"]
      m_auth["<b>Autenticação e sessão</b><br/>RF01, RF07, RF08, RNF07, RNF35<br/>6 endpoints: 3 qualquer papel · 3 público"]
      m_cadastro["<b>Cadastro e envio da<br/>certificação</b><br/>RF02–RF05, RNF09<br/>2 endpoints: 2 público"]
      m_perfil["<b>Perfil, consentimentos e<br/>direitos LGPD</b><br/>RF43, RF45, RNF09<br/>6 endpoints: 6 qualquer papel"]
      m_cadastro -->|"gerarHashSenha, login"| m_auth
      m_perfil -->|"carregarPerfil"| m_auth
    end
    subgraph sg_transversal["Serviços transversais"]
      m_auditoria["<b>Trilha de auditoria</b><br/>RF44, RNF33<br/>1 endpoint: 1 operador<br/>chamado por 9 módulos"]
      m_notificacao["<b>Notificações</b><br/>RF42, RNF25<br/>3 endpoints: 3 qualquer papel<br/>chamado por 7 módulos"]
    end
    subgraph sg_adaptador["Adaptadores de serviços externos"]
      m_email["<b>Adaptador de e-mail</b>"]
      m_gateway["<b>Adaptador do gateway de<br/>pagamento</b><br/>RNF23, RNF37"]
    end
    sg_contratacao ~~~ sg_execucao
    sg_contratacao ~~~ sg_operacao
    sg_financeiro ~~~ sg_execucao
    sg_financeiro ~~~ sg_operacao
    sg_execucao ~~~ sg_acesso
    sg_execucao ~~~ sg_transversal
    sg_operacao ~~~ sg_acesso
    sg_operacao ~~~ sg_transversal
    sg_acesso ~~~ sg_adaptador
    sg_transversal ~~~ sg_adaptador
    sg_acesso -->|"auth → email<br/>enviarEmail"| sg_adaptador
    sg_operacao -->|"backoffice → cadastro<br/>decodificarArquivo"| sg_acesso
    sg_financeiro -->|"comprovante → atendimento<br/>exigirParticipante"| sg_execucao
    sg_financeiro -->|"pagamento → gateway<br/>tokenizarCartao, cobrar,<br/>transferir"| sg_adaptador
  end
  subgraph sg_ext["Serviços externos"]
    ext_gateway["Gateway de pagamento<br/>simulado no MVP (D-08)"]:::externo
    ext_email["Provedor de e-mail<br/>console no MVP"]:::externo
  end
  sg_interface ==>|"HTTPS · REST/JSON"| sg_api
  sg_adaptador -.-> sg_ext
```

</details>

## Item #8 — Arquitetura técnica

<a id="08-arquitetura-tecnica"></a>

### Arquitetura técnica

![Arquitetura técnica](../producao-tecnica/figuras/08-arquitetura-tecnica.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Servidores, protocolos e portas da publicação em nuvem, com as versões lidas de `package-lock.json` e as configurações lidas de `render.yaml`, `frontend/vercel.json` e `.github/workflows/ci.yml`. Em desenvolvimento local: Vite na porta 5173 (com proxy de `/api` para http://localhost:3333), API na porta 3333 e PostgreSQL na porta 5432 (`docker-compose.yml`, imagem postgres:16-alpine). A tabela de tecnologias correspondente está em `docs/producao-tecnica/tabelas/tecnologias.md`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/08-arquitetura-tecnica.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  subgraph sg_usuario["Aparelho do usuário (celular ou computador)"]
    navegador["<b>Navegador</b><br/>SPA React 19 + React Router 7<br/>Tailwind CSS 4 · Leaflet 1.9.4<br/>token JWT em sessionStorage"]:::hub
    sensores["APIs do navegador<br/>Geolocation · câmera (getUserMedia)"]
  end
  subgraph sg_vercel["Vercel — hospedagem estática com CDN"]
    estatico["<b>Arquivos estáticos</b><br/>build do Vite 8 (frontend/dist)<br/>rewrite /((?!api/).*) → /index.html"]
  end
  subgraph sg_render["Render — web service node (plano free)"]
    api["<b>API REST viamos-api</b><br/>Node.js >=20 · Express 5.3.0<br/>Helmet · CORS · rate limit · JWT + sessão<br/>Zod 4 · Drizzle ORM 0.45.4<br/>health check /api/health"]:::hub
  end
  subgraph sg_banco["PostgreSQL gerenciado (Render Postgres ou Neon)"]
    banco[("<b>PostgreSQL</b><br/>27 tabelas · 20 enums<br/>migrações SQL versionadas")]
  end
  subgraph sg_externos["Serviços externos"]
    osm["OpenStreetMap<br/>(blocos de mapa)"]:::externo
    nominatim["Nominatim<br/>(busca de endereço)"]:::externo
  end
  subgraph sg_github["GitHub"]
    repo["Repositório<br/>lucio734/viamos"]
    ci["GitHub Actions (CI)<br/>Node 22 + postgres:16-alpine<br/>typecheck · lint · testes · build"]
  end
  navegador -->|"HTTPS 443<br/>HTML, JS e CSS"| estatico
  navegador -->|"HTTPS 443 · REST/JSON<br/>Authorization: Bearer"| api
  api -->|"TCP 5432 · TLS<br/>SQL parametrizado"| banco
  navegador -->|"HTTPS 443"| osm & nominatim
  navegador --- sensores
  repo -->|"push na main"| ci
  repo -.->|"deploy automático"| estatico
  repo -.->|"deploy automático"| api
```

</details>

## Item #9 — Arquitetura MVC

<a id="09-arquitetura-mvc"></a>

### Arquitetura MVC e ambiente de hospedagem

![Arquitetura MVC e ambiente de hospedagem](../producao-tecnica/figuras/09-arquitetura-mvc.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Distribuição real das pastas de `backend/src` e `frontend/src` entre Model, View e Controller, com o ambiente em que cada camada é publicada. Model: `models/` (esquema e conexão). View: `views/` no servidor (JSON e PDF) e a SPA React no cliente. Controller: `controllers/`, acionados por `routes/index.ts` depois dos `middlewares/`. As regras de negócio ficam em `services/`, entre o Controller e o Model, para que nenhum controller acesse o banco diretamente.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/09-arquitetura-mvc.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  subgraph sg_vercel["VIEW no cliente — SPA React hospedada na Vercel"]
    paginas["<b>pages/</b> — 29 telas<br/>auth (7) · backoffice (4) · cliente (6) · comum (5) · interprete (7)"]
    componentes["<b>components/</b><br/>AppShell · LeitorQr · Mapa · Sala · TelaPublica · ui"]
    clienteHttp["<b>api/cliente.ts</b><br/>fetch + JWT + erros padronizados"]
    paginas --> componentes
    paginas --> clienteHttp
  end
  subgraph sg_render["Backend Express hospedado no Render (viamos-api)"]
    rotas["<b>routes/index.ts</b><br/>65 endpoints sob /api"]
    middlewares["<b>middlewares/</b><br/>auth · erros · validar<br/>JWT + sessão · papel · validação Zod · erros"]
    subgraph sg_c["CONTROLLER"]
      controllers["<b>controllers/</b> — 8 arquivos<br/>atendimento · auth · backoffice · cadastro · demanda · pagamento · perfil · solicitacao<br/>HTTP ⇄ serviço · esquemas Zod · status"]:::hub
    end
    servicos["<b>services/</b> — 14 arquivos<br/>regras de negócio e transações"]
    subgraph sg_v["VIEW no servidor"]
      views["<b>views/</b><br/>comprovante.pdf · presenters<br/>JSON de resposta e PDF do comprovante"]:::hub
    end
    subgraph sg_m["MODEL"]
      models["<b>models/</b><br/>db · schema<br/>27 tabelas (Drizzle ORM)"]:::hub
    end
    rotas --> middlewares --> controllers --> servicos --> models
    controllers --> views
    servicos --> views
  end
  subgraph sg_banco["Banco gerenciado (Render Postgres ou Neon)"]
    banco[("PostgreSQL<br/>2 migrações em backend/drizzle")]
  end
  clienteHttp -->|"HTTPS · REST/JSON"| rotas
  views -.->|"JSON ou PDF"| clienteHttp
  models -->|"SQL parametrizado"| banco
```

</details>

## Item #16 — Macroprocesso

<a id="16-macroprocesso"></a>

### Macroprocesso — cadeia de valor do atendimento presencial

![Macroprocesso — cadeia de valor do atendimento presencial](../producao-tecnica/figuras/16-macroprocesso.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Visão sistêmica em três faixas: os sete processos primários levam da necessidade de mediação até o atendimento comprovado; acima, os processos de gestão que habilitam e auditam a cadeia; abaixo, os processos de apoio, com as etapas que cada um sustenta. Os números (duração mínima, raio, distância do check-in e taxa da plataforma) são lidos de `backend/src/config/regras.ts`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/16-macroprocesso.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef inicio fill:#111,stroke:#111,color:#fff;
  classDef erro fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  subgraph sg_gestao["Processos de gestão"]
    direction LR
    g1["<b>Habilitação de intérpretes</b><br/>análise documental pelo backoffice<br/>RF05, RF06 · condiciona a etapa 3"]
    g2["<b>Auditoria e privacidade</b><br/>trilha imutável e direitos LGPD<br/>RF44, RF45 · todas as etapas"]
  end
  subgraph sg_primarios["Processos primários — cadeia de valor do atendimento presencial"]
    direction LR
    entrada(["Pessoa surda<br/>precisa de mediação<br/>presencial em Libras"]):::inicio
    p1["<b>1. Cadastro<br/>e acesso</b><br/>RF01–RF04<br/>RF07–RF09"]:::destaque
    p2["<b>2. Solicitação<br/>e estimativa</b><br/>RF10–RF16<br/>mínimo de 1 h"]:::destaque
    p3["<b>3. Distribuição<br/>e aceite exclusivo</b><br/>RF17, RF20–RF25<br/>raio até 15 km e agenda"]:::destaque
    p4["<b>4. Encontro<br/>e check-in</b><br/>RF28–RF32<br/>QR + GPS até 200 m"]:::destaque
    p5["<b>5. Atendimento<br/>e encerramento</b><br/>RF33<br/>duração real"]:::destaque
    p6["<b>6. Pagamento<br/>e comprovante</b><br/>RF35–RF38<br/>PDF verificável"]:::destaque
    p7["<b>7. Avaliação<br/>e repasse</b><br/>RF26, RF27<br/>RF40, RF41"]:::destaque
    saida(["Acessibilidade<br/>garantida, comprovada<br/>e auditável"]):::inicio
    entrada --> p1 --> p2 --> p3 --> p4 --> p5 --> p6 --> p7 --> saida
  end
  subgraph sg_apoio["Processos de apoio"]
    direction LR
    a1["<b>Notificações</b><br/>RF42<br/>etapas 3, 4, 5 e 6"]
    a2["<b>Suporte e emergência</b><br/>RF34<br/>etapas 4 e 5"]
    a3["<b>Gateway de pagamento</b><br/>simulado no MVP<br/>etapas 6 e 7 · taxa de 10%"]
    a4["<b>Mapa e geolocalização</b><br/>OpenStreetMap + GPS<br/>etapas 2, 3 e 4"]
    a5["<b>Histórico e perfil</b><br/>RF39, RF43<br/>etapas 1 e 7"]
  end
  sg_gestao -->|"habilita e audita"| sg_primarios
  sg_primarios -.-|"sustentada por"| sg_apoio
```

</details>

## Item #17 — Fluxograma

<a id="17-fluxograma-1-solicitacao-e-estimativa"></a>

### Fluxograma do atendimento — parte 1: solicitação, estimativa e distribuição

![Fluxograma do atendimento — parte 1: solicitação, estimativa e distribuição](../producao-tecnica/figuras/17-fluxograma-1-solicitacao-e-estimativa.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Do início até a distribuição da demanda, na ordem em que `criarSolicitacao` avalia os dados (`solicitacao.service.ts`). A distribuição usa a mesma regra de elegibilidade da lista e do aceite (D-20). As caixas tracejadas são as respostas de erro devolvidas pela API em cada desvio; todos os números vêm de `backend/src/config/regras.ts`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/17-fluxograma-1-solicitacao-e-estimativa.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef inicio fill:#111,stroke:#111,color:#fff;
  classDef erro fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  ini(["Início: cliente autenticado<br/>abre #quot;Nova solicitação#quot;"]):::inicio
  dados[/"Informa tipo de serviço, data e horário,<br/>duração (1 h a 12 h, em blocos de 30 min)<br/>e o local marcado no mapa"/]
  val{"Dados válidos<br/>e horário futuro?"}
  errVal["400 VALIDACAO<br/>422 DURACAO_BLOCO<br/>422 DATA_PASSADA"]:::erro
  est["Sistema calcula a estimativa — RF15<br/>preço/hora do tipo × horas<br/>+ deslocamento R$ 15,00<br/>+ taxa da plataforma 10%"]
  conf{"Cliente<br/>confirma?"}
  grava["Grava a solicitação BUSCANDO<br/>e a cotação (regra v1) — RF16"]:::destaque
  dist["Distribuição — RF17 e D-20<br/>intérpretes APROVADOS e online, com o local<br/>a até min(raio do intérprete, 15 km),<br/>início dentro da grade semanal e agenda livre;<br/>por proximidade e reputação, uma oferta e um aviso para cada"]
  nenhum{"Algum intérprete<br/>elegível?"}
  espera["Continua BUSCANDO: quem ficar elegível<br/>depois (online, novo raio ou nova grade)<br/>recebe a oferta — nova distribuição"]
  cont(["Continua na parte 2:<br/>resposta dos intérpretes"]):::inicio
  ini --> dados --> val
  val -->|"não"| errVal --> dados
  val -->|"sim"| est --> conf
  conf -->|"não, ajusta"| dados
  conf -->|"sim"| grava --> dist --> nenhum
  nenhum -->|"sim"| cont
  nenhum -->|"não"| espera --> cont
```

</details>

<a id="17-fluxograma-2-resposta-e-aceite"></a>

### Fluxograma do atendimento — parte 2: resposta dos intérpretes, cancelamento e aceite

![Fluxograma do atendimento — parte 2: resposta dos intérpretes, cancelamento e aceite](../producao-tecnica/figuras/17-fluxograma-2-resposta-e-aceite.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Os três desfechos de uma demanda aberta: recusa individual, cancelamento pelo cliente (com a regra de taxa, decidida depois de bloquear a solicitação) e aceite exclusivo, com o intérprete bloqueado para que dois aceites dele não ocupem o mesmo horário (`demanda.service.ts` e `cancelarSolicitacao`). As caixas tracejadas são as respostas de erro devolvidas pela API em cada desvio; todos os números vêm de `backend/src/config/regras.ts`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/17-fluxograma-2-resposta-e-aceite.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef inicio fill:#111,stroke:#111,color:#fff;
  classDef erro fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  ini(["Solicitação BUSCANDO<br/>(vem da parte 1)"]):::inicio
  resp{"O que acontece<br/>com a demanda?"}
  rec["Oferta RECUSADA só para<br/>esse intérprete — RF23<br/>segue BUSCANDO para os demais"]
  bloq["Solicitação bloqueada na transação;<br/>vínculo e estado relidos depois do bloqueio"]
  canc{"Já ACEITA e faltam<br/>menos de 24 h?"}
  taxa["Taxa de 20%<br/>do valor estimado"]
  semTaxa["Sem custo"]
  fimCanc(["Fim: solicitação CANCELADA<br/>ofertas pendentes EXPIRADAS — RF19"]):::inicio
  verif["Aceite — RF22: com o intérprete bloqueado,<br/>o serviço confere habilitação, demanda BUSCANDO,<br/>horário futuro, raio, grade semanal e agenda livre"]
  ace{"Tudo<br/>confere?"}
  errAce["403 · 409 DEMANDA_INDISPONIVEL<br/>422 DEMANDA_EXPIRADA · 422 FORA_DO_RAIO<br/>422 FORA_DA_DISPONIBILIDADE<br/>409 AGENDA_CONFLITANTE"]:::erro
  trava["Transação atômica:<br/>UPDATE … WHERE status = 'BUSCANDO'<br/>só o primeiro intérprete altera a linha"]:::destaque
  agendado["Solicitação ACEITA · atendimento AGENDADO<br/>QR Code do check-in gerado<br/>demais ofertas EXPIRADAS · cliente avisado"]
  cont(["Continua na parte 3:<br/>encontro presencial"]):::inicio
  ini --> resp
  resp -->|"um intérprete recusa"| rec --> resp
  resp -->|"o cliente cancela"| bloq --> canc
  canc -->|"sim"| taxa --> fimCanc
  canc -->|"não"| semTaxa --> fimCanc
  resp -->|"um intérprete aceita"| verif --> ace
  ace -->|"não"| errAce --> resp
  ace -->|"sim"| trava --> agendado --> cont
```

</details>

<a id="17-fluxograma-3-encontro-e-checkin"></a>

### Fluxograma do atendimento — parte 3: encontro presencial e check-in

![Fluxograma do atendimento — parte 3: encontro presencial e check-in](../producao-tecnica/figuras/17-fluxograma-3-encontro-e-checkin.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

A tela do intérprete só libera a leitura do QR depois da captura da posição do aparelho; no servidor, as quatro validações do check-in aparecem na mesma ordem de `realizarCheckin` (`atendimento.service.ts`): código do QR, janela de horário, precisão do GPS e distância ao local. As caixas tracejadas são as respostas de erro devolvidas pela API em cada desvio; todos os números vêm de `backend/src/config/regras.ts`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/17-fluxograma-3-encontro-e-checkin.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef inicio fill:#111,stroke:#111,color:#fff;
  classDef erro fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  ini(["Atendimento AGENDADO<br/>(vem da parte 2)"]):::inicio
  sala["Sala de atendimento — RF28 a RF30<br/>mensagens, foto do ponto de encontro<br/>e localização temporária no mapa"]
  gps[/"No local, o intérprete captura a posição do GPS<br/>(obrigatória para liberar a leitura do QR)"/]
  qr[/"O cliente exibe o QR Code — RF31<br/>o intérprete lê o código"/]
  c1{"Código<br/>confere?"}
  c2{"Faltam 30 min<br/>ou menos?"}
  c3{"Precisão do GPS<br/>até 50 m?"}
  c4{"Distância<br/>até 200 m?"}
  e1["422 QR_INVALIDO"]:::erro
  e2["422 FORA_DA_JANELA"]:::erro
  e3["422 PRECISAO_INSUFICIENTE"]:::erro
  e4["422 FORA_DO_LOCAL — RF32"]:::erro
  and["Com a solicitação bloqueada: check-in registrado,<br/>atendimento e solicitação EM_ANDAMENTO,<br/>início real gravado · cliente avisado"]:::destaque
  cont(["Continua na parte 4:<br/>encerramento e pagamento"]):::inicio
  ini --> sala --> gps --> qr --> c1
  c1 -->|"não"| e1 --> gps
  c1 -->|"sim"| c2
  c2 -->|"não"| e2 --> gps
  c2 -->|"sim"| c3
  c3 -->|"não"| e3 --> gps
  c3 -->|"sim"| c4
  c4 -->|"não"| e4 --> gps
  c4 -->|"sim"| and --> cont
```

</details>

<a id="17-fluxograma-4-pagamento-e-avaliacao"></a>

### Fluxograma do atendimento — parte 4: encerramento, pagamento e avaliação

![Fluxograma do atendimento — parte 4: encerramento, pagamento e avaliação](../producao-tecnica/figuras/17-fluxograma-4-pagamento-e-avaliacao.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Fechamento financeiro conforme `encerrarAtendimento` e `processarPagamento`, inclusive a resposta idempotente e a recusa do gateway, até a avaliação e o repasse. As caixas tracejadas são as respostas de erro devolvidas pela API em cada desvio; todos os números vêm de `backend/src/config/regras.ts`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/17-fluxograma-4-pagamento-e-avaliacao.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef inicio fill:#111,stroke:#111,color:#fff;
  classDef erro fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  ini(["Atendimento EM_ANDAMENTO<br/>(vem da parte 3)"]):::inicio
  enc["Cliente ou intérprete encerra — RF33<br/>duração real apurada"]
  valor["Valor final (D-03): cobra o maior entre<br/>a duração contratada e a real arredondada<br/>para cima em blocos de 30 min<br/>pagamento PENDENTE criado"]
  pagar[/"Cliente escolhe Pix ou cartão salvo<br/>e confirma — RF35, RF36"/]
  q1{"Já existe<br/>pagamento PAGO?"}
  rep["200 — devolve o pagamento anterior<br/>sem cobrar de novo (idempotência;<br/>chamadas simultâneas são serializadas)"]
  q2{"Gateway<br/>aprova?"}
  e5["402 PAGAMENTO_RECUSADO<br/>pagamento FALHOU<br/>pode tentar outra forma"]:::erro
  pago["Pagamento PAGO<br/>crédito ao intérprete = valor pago<br/>− taxa de 10% do serviço<br/>comprovante com código público — RF37, RF38"]:::destaque
  aval["Avaliação bilateral de 1 a 5 — RF40<br/>recalcula a reputação do intérprete — RF41"]
  repasse["Intérprete solicita o repasse<br/>do saldo inteiro — RF27<br/>(um por vez; saldo somado no banco)"]
  fim(["Fim: atendimento comprovado<br/>e registrado na trilha de auditoria — RF44"]):::inicio
  ini --> enc --> valor --> pagar --> q1
  q1 -->|"sim"| rep --> aval
  q1 -->|"não"| q2
  q2 -->|"não"| e5 --> pagar
  q2 -->|"sim"| pago --> aval --> repasse --> fim
```

</details>

## Item #22 — Diagrama entidade-relacionamento

<a id="22-der-1-identidade-e-perfis"></a>

### DER — Identidade e perfis (DC1, DC11)

![DER — Identidade e perfis (DC1, DC11)](../producao-tecnica/figuras/22-der-1-identidade-e-perfis.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Tabelas do domínio, com todos os atributos: `usuarios`, `clientes`, `interpretes`, `certificacoes`, `analises_documentais`, `disponibilidades`. Regras de integridade além de PK/FK: `UNIQUE usuarios(lower(email))`; `CHECK interpretes: raio_km BETWEEN 1 AND 15`; `CHECK disponibilidades: dia_semana BETWEEN 0 AND 6`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/22-der-1-identidade-e-perfis.mmd</code>)</summary>

```mermaid
erDiagram
  direction LR
  usuarios ||--o| clientes : "usuario_id"
  usuarios ||--o| interpretes : "usuario_id"
  interpretes ||..o{ certificacoes : "interprete_id"
  certificacoes ||..o{ analises_documentais : "certificacao_id"
  usuarios ||..o{ analises_documentais : "operador_id"
  interpretes ||..o{ disponibilidades : "interprete_id"
  usuarios {
    uuid id PK
    varchar(120) nome
    varchar(160) email
    varchar(100) senha_hash
    varchar(20) telefone
    papel_usuario papel
    text foto_url
    boolean ativo
    integer tentativas_falhas
    timestamptz bloqueado_ate
    boolean dois_fatores_ativo
    timestamptz criado_em
    timestamptz atualizado_em
  }
  clientes {
    uuid usuario_id PK, FK
    varchar(11) cpf UK
    date data_nascimento
    varchar(8) cep
    text endereco
    text preferencias_acessibilidade
  }
  interpretes {
    uuid usuario_id PK, FK
    varchar(14) documento UK
    text endereco_base
    float8 latitude_base
    float8 longitude_base
    text[] especialidades
    numeric preco_hora
    integer raio_km
    boolean disponivel_agora
    status_habilitacao status_habilitacao
    numeric reputacao
    integer total_avaliacoes
  }
  certificacoes {
    uuid id PK
    uuid interprete_id FK
    tipo_certificacao tipo
    varchar(60) numero
    varchar(200) nome_arquivo
    varchar(80) mime_arquivo
    bytea arquivo
    integer tamanho_bytes
    status_certificacao status
    timestamptz enviada_em
  }
  analises_documentais {
    uuid id PK
    uuid certificacao_id FK
    uuid operador_id FK
    resultado_analise resultado
    text justificativa
    timestamptz data
  }
  disponibilidades {
    uuid id PK
    uuid interprete_id FK
    smallint dia_semana
    time inicio
    time fim
  }
```

</details>

<a id="22-der-2-solicitacao-cotacao-distribuicao-e-aceite"></a>

### DER — Solicitação, cotação, distribuição e aceite (DC3, DC4)

![DER — Solicitação, cotação, distribuição e aceite (DC3, DC4)](../producao-tecnica/figuras/22-der-2-solicitacao-cotacao-distribuicao-e-aceite.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Tabelas do domínio, com todos os atributos: `solicitacoes`, `cotacoes`, `ofertas`. Tabelas de outros domínios referenciadas por elas (só com a PK, para contexto): `clientes`, `interpretes`. Regras de integridade além de PK/FK: `CHECK solicitacoes: duracao_prevista_min >= 60`; `UNIQUE ofertas(solicitacao_id, interprete_id)`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/22-der-2-solicitacao-cotacao-distribuicao-e-aceite.mmd</code>)</summary>

```mermaid
erDiagram
  direction LR
  clientes ||..o{ solicitacoes : "cliente_id"
  solicitacoes ||..o| cotacoes : "solicitacao_id"
  solicitacoes ||..o{ ofertas : "solicitacao_id"
  interpretes ||..o{ ofertas : "interprete_id"
  solicitacoes {
    uuid id PK
    uuid cliente_id FK
    tipo_servico tipo_servico
    timestamptz inicio_previsto
    integer duracao_prevista_min
    text endereco
    varchar(120) complemento
    varchar(200) ponto_referencia
    float8 latitude
    float8 longitude
    varchar(300) observacoes
    status_solicitacao status
    timestamptz cancelada_em
    varchar(300) motivo_cancelamento
    numeric taxa_cancelamento
    timestamptz criada_em
    timestamptz atualizada_em
  }
  cotacoes {
    uuid id PK
    uuid solicitacao_id FK, UK
    numeric valor_servico
    numeric valor_deslocamento
    numeric taxa_plataforma
    numeric valor_total
    varchar(20) versao_regra
    timestamptz calculada_em
  }
  ofertas {
    uuid id PK
    uuid solicitacao_id FK
    uuid interprete_id FK
    numeric distancia_km
    status_oferta status
    timestamptz enviada_em
    timestamptz respondida_em
    varchar(300) motivo_recusa
  }
  clientes {
    uuid usuario_id PK, FK
  }
  interpretes {
    uuid usuario_id PK, FK
  }
```

</details>

<a id="22-der-3-atendimento-presencial"></a>

### DER — Atendimento presencial (DC4, DC5, DC6)

![DER — Atendimento presencial (DC4, DC5, DC6)](../producao-tecnica/figuras/22-der-3-atendimento-presencial.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Tabelas do domínio, com todos os atributos: `atendimentos`, `checkins`, `mensagens`, `localizacoes_compartilhadas`, `chamados_suporte`. Tabelas de outros domínios referenciadas por elas (só com a PK, para contexto): `solicitacoes`, `interpretes`, `usuarios`. 

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/22-der-3-atendimento-presencial.mmd</code>)</summary>

```mermaid
erDiagram
  direction TB
  solicitacoes ||..o| atendimentos : "solicitacao_id"
  interpretes ||..o{ atendimentos : "interprete_id"
  atendimentos ||..o| checkins : "atendimento_id"
  atendimentos ||..o{ mensagens : "atendimento_id"
  usuarios |o..o{ mensagens : "autor_id"
  atendimentos ||..o{ localizacoes_compartilhadas : "atendimento_id"
  usuarios ||..o{ localizacoes_compartilhadas : "usuario_id"
  atendimentos |o..o{ chamados_suporte : "atendimento_id"
  usuarios ||..o{ chamados_suporte : "solicitante_id"
  usuarios |o..o{ chamados_suporte : "operador_id"
  atendimentos {
    uuid id PK
    uuid solicitacao_id FK, UK
    uuid interprete_id FK
    timestamptz aceito_em
    timestamptz inicio_real
    timestamptz fim_real
    integer duracao_real_min
    numeric valor_final
    status_atendimento status
  }
  checkins {
    uuid id PK
    uuid atendimento_id FK, UK
    varchar(64) qr_hash UK
    timestamptz emitido_em
    timestamptz lido_em
    float8 latitude
    float8 longitude
    float8 precisao_m
    float8 distancia_m
  }
  mensagens {
    uuid id PK
    uuid atendimento_id FK
    uuid autor_id FK
    tipo_mensagem tipo
    varchar(1000) texto
    text arquivo_uri
    float8 latitude
    float8 longitude
    timestamptz enviada_em
    timestamptz lida_em
  }
  localizacoes_compartilhadas {
    uuid id PK
    uuid atendimento_id FK
    uuid usuario_id FK
    float8 latitude
    float8 longitude
    float8 precisao_m
    timestamptz registrada_em
    timestamptz encerrada_em
  }
  chamados_suporte {
    uuid id PK
    uuid atendimento_id FK
    uuid solicitante_id FK
    uuid operador_id FK
    tipo_chamado tipo
    varchar(500) descricao
    float8 latitude
    float8 longitude
    status_chamado status
    timestamptz aberto_em
    timestamptz encerrado_em
  }
  solicitacoes {
    uuid id PK
  }
  interpretes {
    uuid usuario_id PK, FK
  }
  usuarios {
    uuid id PK
  }
```

</details>

<a id="22-der-4-financeiro"></a>

### DER — Financeiro (DC7, DC8)

![DER — Financeiro (DC7, DC8)](../producao-tecnica/figuras/22-der-4-financeiro.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Tabelas do domínio, com todos os atributos: `formas_pagamento`, `pagamentos`, `contas_bancarias`, `repasses`, `lancamentos_financeiros`. Tabelas de outros domínios referenciadas por elas (só com a PK, para contexto): `clientes`, `atendimentos`, `interpretes`. Regras de integridade além de PK/FK: `UNIQUE pagamentos(atendimento_id) WHERE status = 'PAGO'`; `CHECK lancamentos_financeiros: (pagamento_id IS NOT NULL AND repasse_id IS NULL) OR (pagamento_id IS NULL AND repasse_id IS NOT NULL)`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/22-der-4-financeiro.mmd</code>)</summary>

```mermaid
erDiagram
  direction TB
  clientes ||..o{ formas_pagamento : "cliente_id"
  atendimentos ||..o{ pagamentos : "atendimento_id"
  formas_pagamento |o..o{ pagamentos : "forma_pagamento_id"
  interpretes ||..o{ contas_bancarias : "interprete_id"
  interpretes ||..o{ repasses : "interprete_id"
  contas_bancarias |o..o{ repasses : "conta_bancaria_id"
  interpretes ||..o{ lancamentos_financeiros : "interprete_id"
  pagamentos |o..o{ lancamentos_financeiros : "pagamento_id"
  repasses |o..o{ lancamentos_financeiros : "repasse_id"
  formas_pagamento {
    uuid id PK
    uuid cliente_id FK
    tipo_forma_pagamento tipo
    varchar(120) chave_pix
    varchar(120) token_gateway
    varchar(30) bandeira
    varchar(4) final_cartao
    boolean principal
    boolean ativa
    timestamptz criada_em
  }
  pagamentos {
    uuid id PK
    uuid atendimento_id FK
    uuid forma_pagamento_id FK
    numeric valor
    tipo_forma_pagamento meio
    status_pagamento status
    varchar(80) referencia_gateway UK
    varchar(200) mensagem_gateway
    integer tentativas
    timestamptz criado_em
    timestamptz confirmado_em
  }
  contas_bancarias {
    uuid id PK
    uuid interprete_id FK
    varchar(60) banco
    varchar(10) agencia
    varchar(20) conta
    varchar(120) titular
    varchar(120) chave_pix
    boolean principal
  }
  repasses {
    uuid id PK
    uuid interprete_id FK
    uuid conta_bancaria_id FK
    numeric valor
    status_repasse status
    varchar(80) referencia_gateway
    timestamptz solicitado_em
    timestamptz concluido_em
  }
  lancamentos_financeiros {
    uuid id PK
    uuid interprete_id FK
    uuid pagamento_id FK
    uuid repasse_id FK
    tipo_lancamento tipo
    numeric valor
    varchar(200) descricao
    timestamptz data
  }
  clientes {
    uuid usuario_id PK, FK
  }
  atendimentos {
    uuid id PK
  }
  interpretes {
    uuid usuario_id PK, FK
  }
```

</details>

<a id="22-der-5-pos-atendimento"></a>

### DER — Pós-atendimento (DC9)

![DER — Pós-atendimento (DC9)](../producao-tecnica/figuras/22-der-5-pos-atendimento.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Tabelas do domínio, com todos os atributos: `avaliacoes`, `comprovantes`. Tabelas de outros domínios referenciadas por elas (só com a PK, para contexto): `atendimentos`, `usuarios`. Regras de integridade além de PK/FK: `CHECK avaliacoes: nota BETWEEN 1 AND 5`; `CHECK avaliacoes: autor_id <> avaliado_id`; `UNIQUE avaliacoes(atendimento_id, autor_id)`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/22-der-5-pos-atendimento.mmd</code>)</summary>

```mermaid
erDiagram
  direction TB
  atendimentos ||..o{ avaliacoes : "atendimento_id"
  usuarios ||..o{ avaliacoes : "autor_id"
  usuarios ||..o{ avaliacoes : "avaliado_id"
  atendimentos ||..o| comprovantes : "atendimento_id"
  avaliacoes {
    uuid id PK
    uuid atendimento_id FK
    uuid autor_id FK
    uuid avaliado_id FK
    smallint nota
    varchar(500) comentario
    timestamptz data
  }
  comprovantes {
    uuid id PK
    uuid atendimento_id FK, UK
    uuid codigo_verificacao UK
    timestamptz data_atendimento
    text url_pdf
    timestamptz emitido_em
  }
  atendimentos {
    uuid id PK
  }
  usuarios {
    uuid id PK
  }
```

</details>

<a id="22-der-6-privacidade-notificacoes-sessoes-e-auditoria"></a>

### DER — Privacidade, notificações, sessões e auditoria (DC10, DC11)

![DER — Privacidade, notificações, sessões e auditoria (DC10, DC11)](../producao-tecnica/figuras/22-der-6-privacidade-notificacoes-sessoes-e-auditoria.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Tabelas do domínio, com todos os atributos: `consentimentos`, `solicitacoes_dados`, `notificacoes`, `sessoes`, `tokens_recuperacao`, `eventos_auditoria`. Tabelas de outros domínios referenciadas por elas (só com a PK, para contexto): `usuarios`. 

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/22-der-6-privacidade-notificacoes-sessoes-e-auditoria.mmd</code>)</summary>

```mermaid
erDiagram
  direction TB
  usuarios ||..o{ consentimentos : "usuario_id"
  usuarios ||..o{ solicitacoes_dados : "usuario_id"
  usuarios ||..o{ notificacoes : "usuario_id"
  usuarios ||..o{ sessoes : "usuario_id"
  usuarios ||..o{ tokens_recuperacao : "usuario_id"
  usuarios |o..o{ eventos_auditoria : "usuario_id"
  consentimentos {
    uuid id PK
    uuid usuario_id FK
    finalidade_consentimento finalidade
    varchar(20) versao_termo
    timestamptz concedido_em
    timestamptz revogado_em
  }
  solicitacoes_dados {
    uuid id PK
    uuid usuario_id FK
    tipo_solicitacao_dados tipo
    status_solicitacao_dados status
    timestamptz criada_em
    timestamptz concluida_em
  }
  notificacoes {
    uuid id PK
    uuid usuario_id FK
    tipo_notificacao tipo
    varchar(120) titulo
    varchar(500) conteudo
    varchar(200) referencia_recurso
    boolean lida
    timestamptz criada_em
  }
  sessoes {
    uuid id PK
    uuid usuario_id FK
    varchar(64) token_hash UK
    varchar(200) dispositivo
    timestamptz expira_em
    boolean revogada
    timestamptz criada_em
  }
  tokens_recuperacao {
    uuid id PK
    uuid usuario_id FK
    varchar(64) hash UK
    timestamptz expira_em
    timestamptz usado_em
  }
  eventos_auditoria {
    uuid id PK
    uuid usuario_id FK
    varchar(60) tipo
    varchar(60) entidade
    uuid entidade_id
    jsonb detalhes
    varchar(45) ip
    timestamptz data
  }
  usuarios {
    uuid id PK
  }
```

</details>

<a id="22-der-visao-geral"></a>

### DER — visão geral (27 tabelas e seus relacionamentos)

![DER — visão geral (27 tabelas e seus relacionamentos)](../producao-tecnica/figuras/22-der-visao-geral.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Gerado de `backend/src/models/schema.ts`: 27 tabelas, 230 colunas, 39 chaves estrangeiras e 20 tipos enumerados. Esta visão mostra só as entidades e os relacionamentos; os atributos e o nome de cada chave estrangeira estão nas visões por domínio e no dicionário de dados. Notação pé-de-galinha: linha contínua = relacionamento identificador (a FK compõe a PK da filha); linha tracejada = não identificador; "o" = opcional.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/22-der-visao-geral.mmd</code>)</summary>

```mermaid
erDiagram
  direction LR
  usuarios ||--o| clientes : " "
  usuarios ||--o| interpretes : " "
  interpretes ||..o{ certificacoes : " "
  certificacoes ||..o{ analises_documentais : " "
  usuarios ||..o{ analises_documentais : " "
  interpretes ||..o{ disponibilidades : " "
  clientes ||..o{ solicitacoes : " "
  solicitacoes ||..o| cotacoes : " "
  solicitacoes ||..o{ ofertas : " "
  interpretes ||..o{ ofertas : " "
  solicitacoes ||..o| atendimentos : " "
  interpretes ||..o{ atendimentos : " "
  atendimentos ||..o| checkins : " "
  atendimentos ||..o{ mensagens : " "
  usuarios |o..o{ mensagens : " "
  atendimentos ||..o{ localizacoes_compartilhadas : " "
  usuarios ||..o{ localizacoes_compartilhadas : " "
  atendimentos |o..o{ chamados_suporte : " "
  usuarios ||..o{ chamados_suporte : " "
  usuarios |o..o{ chamados_suporte : " "
  clientes ||..o{ formas_pagamento : " "
  atendimentos ||..o{ pagamentos : " "
  formas_pagamento |o..o{ pagamentos : " "
  interpretes ||..o{ contas_bancarias : " "
  interpretes ||..o{ repasses : " "
  contas_bancarias |o..o{ repasses : " "
  interpretes ||..o{ lancamentos_financeiros : " "
  pagamentos |o..o{ lancamentos_financeiros : " "
  repasses |o..o{ lancamentos_financeiros : " "
  atendimentos ||..o{ avaliacoes : " "
  usuarios ||..o{ avaliacoes : " "
  usuarios ||..o{ avaliacoes : " "
  atendimentos ||..o| comprovantes : " "
  usuarios ||..o{ consentimentos : " "
  usuarios ||..o{ solicitacoes_dados : " "
  usuarios ||..o{ notificacoes : " "
  usuarios ||..o{ sessoes : " "
  usuarios ||..o{ tokens_recuperacao : " "
  usuarios |o..o{ eventos_auditoria : " "
```

</details>

## Item #23 — Diagrama de estado de máquina

<a id="23-estados-1-solicitacao"></a>

### Máquina de estados — solicitação (RF16–RF19, RF22, RF31, RF33)

![Máquina de estados — solicitação (RF16–RF19, RF22, RF31, RF33)](../producao-tecnica/figuras/23-estados-1-solicitacao.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Estados do enum `status_solicitacao` do banco (`backend/src/models/schema.ts`) e as transições executadas pelos serviços, rotuladas com a função que as realiza. Todos os valores do enum aparecem no diagrama.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/23-estados-1-solicitacao.mmd</code>)</summary>

```mermaid
stateDiagram-v2
  direction LR
  [*] --> BUSCANDO : criarSolicitacao<br/>cotação + distribuição
  BUSCANDO --> ACEITA : aceitarDemanda<br/>aceite exclusivo
  BUSCANDO --> CANCELADA : cancelarSolicitacao<br/>sem custo
  ACEITA --> CANCELADA : cancelarSolicitacao<br/>taxa se faltar menos de 24 h
  ACEITA --> EM_ANDAMENTO : realizarCheckin<br/>QR + GPS
  EM_ANDAMENTO --> CONCLUIDA : encerrarAtendimento
  CONCLUIDA --> [*]
  CANCELADA --> [*]
```

</details>

<a id="23-estados-2-atendimento"></a>

### Máquina de estados — atendimento (RF22, RF31–RF33)

![Máquina de estados — atendimento (RF22, RF31–RF33)](../producao-tecnica/figuras/23-estados-2-atendimento.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Estados do enum `status_atendimento` do banco (`backend/src/models/schema.ts`) e as transições executadas pelos serviços, rotuladas com a função que as realiza. Todos os valores do enum aparecem no diagrama.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/23-estados-2-atendimento.mmd</code>)</summary>

```mermaid
stateDiagram-v2
  direction LR
  [*] --> AGENDADO : aceitarDemanda<br/>QR do check-in gerado
  AGENDADO --> EM_ANDAMENTO : realizarCheckin<br/>início real gravado
  AGENDADO --> CANCELADO : cancelarSolicitacao<br/>localização encerrada
  EM_ANDAMENTO --> CONCLUIDO : encerrarAtendimento<br/>duração real e valor final
  CONCLUIDO --> [*]
  CANCELADO --> [*]
```

</details>

<a id="23-estados-3-pagamento"></a>

### Máquina de estados — pagamento (RF36, RF37)

![Máquina de estados — pagamento (RF36, RF37)](../producao-tecnica/figuras/23-estados-3-pagamento.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Estados do enum `status_pagamento` do banco (`backend/src/models/schema.ts`) e as transições executadas pelos serviços, rotuladas com a função que as realiza. Valor do enum sem transição no MVP: `ESTORNADO`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/23-estados-3-pagamento.mmd</code>)</summary>

```mermaid
stateDiagram-v2
  direction LR
  [*] --> PENDENTE : encerrarAtendimento
  PENDENTE --> PAGO : processarPagamento<br/>gateway aprova
  PENDENTE --> FALHOU : processarPagamento<br/>gateway recusa (402)
  FALHOU --> PAGO : nova tentativa aprovada
  FALHOU --> FALHOU : nova tentativa recusada
  PAGO --> [*] : comprovante emitido
```

</details>

<a id="23-estados-4-habilitacao"></a>

### Máquina de estados — habilitação do intérprete (RF04–RF06, RNF36)

![Máquina de estados — habilitação do intérprete (RF04–RF06, RNF36)](../producao-tecnica/figuras/23-estados-4-habilitacao.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Estados do enum `status_habilitacao` do banco (`backend/src/models/schema.ts`) e as transições executadas pelos serviços, rotuladas com a função que as realiza. Valor do enum sem transição no MVP: `PENDENTE`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/23-estados-4-habilitacao.mmd</code>)</summary>

```mermaid
stateDiagram-v2
  direction LR
  [*] --> EM_ANALISE : cadastrarInterprete<br/>certificado enviado
  EM_ANALISE --> APROVADO : registrarParecer<br/>APROVADO
  EM_ANALISE --> CORRECAO_SOLICITADA : registrarParecer<br/>CORRECAO
  EM_ANALISE --> REPROVADO : registrarParecer<br/>REPROVADO
  CORRECAO_SOLICITADA --> EM_ANALISE : reenviarCertificacao
  REPROVADO --> EM_ANALISE : reenviarCertificacao
  APROVADO --> [*] : recebe e aceita demandas
```

</details>

## Item #24 — Diagrama de operação

<a id="24-operacao-a-aceite-exclusivo"></a>

### Diagrama de operação — aceite exclusivo da demanda (RF22)

![Diagrama de operação — aceite exclusivo da demanda (RF22)](../producao-tecnica/figuras/24-operacao-a-aceite-exclusivo.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Sequência das chamadas internas quando dois intérpretes tentam aceitar a mesma demanda. Toda a verificação acontece numa transação que começa bloqueando o registro do intérprete (dois aceites dele não ocupam o mesmo horário) e aplica a mesma regra de elegibilidade da lista (D-20). A exclusividade entre intérpretes é garantida pelo `UPDATE … WHERE status = 'BUSCANDO'` e pelo índice único de `atendimentos.solicitacao_id`; quem chega depois recebe 409.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/24-operacao-a-aceite-exclusivo.mmd</code>)</summary>

```mermaid
sequenceDiagram
  autonumber
  actor IA as Intérprete A
  actor IB as Intérprete B
  participant RT as routes/index.ts<br/>autenticar · exigirPapel
  participant CT as demanda.controller<br/>aceitar
  participant SV as demanda.service<br/>aceitarDemanda
  participant DB as PostgreSQL
  participant AP as notificacao.service<br/>auditoria.service
  IA->>RT: POST /api/demandas/:id/aceitar<br/>Authorization: Bearer JWT
  RT->>RT: autenticar() — JWT e sessão válidos<br/>exigirPapel(INTERPRETE)
  RT->>CT: aceitar(req, res)
  CT->>SV: aceitarDemanda(usuarioId,<br/>solicitacaoId, ip)
  rect rgb(235, 235, 235)
  Note over SV,DB: db.transaction — tudo ou nada
  SV->>DB: SELECT interpretes WHERE usuario_id = :eu<br/>FOR NO KEY UPDATE (serializa meus aceites)
  Note over SV: exigirHabilitado()<br/>não APROVADO → 403
  SV->>DB: SELECT solicitacoes WHERE id = :id
  Note over SV: status ≠ BUSCANDO → 409 DEMANDA_INDISPONIVEL<br/>horário já passou → 422 DEMANDA_EXPIRADA
  SV->>DB: carregarContextoElegibilidade()<br/>grade semanal + atendimentos ativos
  SV->>SV: avaliarElegibilidade() — raio ≤ min(raio_km, 15),<br/>início na grade semanal, agenda livre
  Note over SV: 422 FORA_DO_RAIO · 422 FORA_DA_DISPONIBILIDADE<br/>409 AGENDA_CONFLITANTE
  SV->>DB: UPDATE solicitacoes SET status = 'ACEITA'<br/>WHERE id = :id AND status = 'BUSCANDO'
  DB-->>SV: 1 linha — a trava é deste intérprete
  SV->>DB: INSERT atendimentos (solicitacao_id UNIQUE)<br/>INSERT checkins (qr_hash aleatório)
  SV->>DB: UPDATE ofertas — a minha ACEITA,<br/>as demais EXPIRADA
  SV->>AP: notificar(cliente, ACEITE)<br/>registrarEvento(ACEITE)
  end
  SV-->>CT: { atendimentoId, solicitacaoId, mensagem }
  CT-->>IA: 201 Created
  IB->>RT: POST /api/demandas/:id/aceitar<br/>(mesma demanda, logo depois)
  RT->>CT: aceitar(req, res)
  CT->>SV: aceitarDemanda(...)
  SV->>DB: SELECT solicitacoes WHERE id = :id
  DB-->>SV: status = ACEITA
  SV-->>IB: 409 Conflict — DEMANDA_INDISPONIVEL<br/>(resposta montada por tratarErros)
```

</details>

<a id="24-operacao-b-checkin"></a>

### Diagrama de operação — check-in por QR Code e geolocalização (RF31, RF32)

![Diagrama de operação — check-in por QR Code e geolocalização (RF31, RF32)](../producao-tecnica/figuras/24-operacao-b-checkin.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

O cliente obtém o código do QR; o intérprete o envia com a posição do GPS. O serviço valida, nesta ordem: participante e estado, código, janela de horário, precisão do GPS e distância ao local. Na transação, a solicitação é bloqueada na mesma ordem usada pelo cancelamento (sem disputa invertida de bloqueios) e o estado é conferido de novo antes de iniciar o atendimento.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/24-operacao-b-checkin.mmd</code>)</summary>

```mermaid
sequenceDiagram
  autonumber
  actor CL as Cliente
  actor IN as Intérprete
  participant RT as routes/index.ts<br/>autenticar · exigirPapel · validar
  participant CT as atendimento.controller<br/>qrcode · checkin
  participant SV as atendimento.service<br/>obterQrCode · realizarCheckin
  participant DB as PostgreSQL
  participant AP as notificacao.service<br/>auditoria.service
  CL->>RT: GET /api/atendimentos/:id/qrcode
  RT->>CT: qrcode(req, res) — só CLIENTE
  CT->>SV: obterQrCode(atendimentoId, usuarioId)
  SV->>DB: carregarAtendimento()<br/>SELECT atendimentos + checkin
  SV-->>CL: 200 { codigo, conteudo VIAMOS:id:codigo,<br/>disponivelApartirDe = início − 30 min }
  Note over CL,IN: no local, o intérprete captura a posição do GPS<br/>(a tela só libera a leitura depois disso) e lê o QR do cliente
  IN->>RT: POST /api/atendimentos/:id/checkin<br/>{ codigo, latitude, longitude, precisaoM }
  RT->>RT: validar(esquemaCheckin)<br/>corpo inválido → 400
  RT->>CT: checkin(req, res) — só INTERPRETE
  CT->>SV: realizarCheckin(atendimentoId,<br/>interpreteId, entrada, ip)
  SV->>DB: carregarAtendimento()
  Note over SV: não é o intérprete alocado → 403<br/>já EM_ANDAMENTO → 409 CHECKIN_DUPLICADO<br/>não está AGENDADO → 422 ESTADO_INVALIDO
  Note over SV: código ≠ checkins.qr_hash → 422 QR_INVALIDO
  Note over SV: agora < início − 30 min → 422 FORA_DA_JANELA
  Note over SV: precisaoM > 50 → 422 PRECISAO_INSUFICIENTE
  SV->>SV: distanciaMetros(posição enviada,<br/>local da solicitação)
  Note over SV: distância > 200 m → 422 FORA_DO_LOCAL
  rect rgb(235, 235, 235)
  Note over SV,DB: db.transaction
  SV->>DB: SELECT solicitacoes FOR NO KEY UPDATE<br/>(mesma ordem de bloqueio do cancelamento)
  Note over SV: já EM_ANDAMENTO → 409 · não ACEITA (cancelada) → 422
  SV->>DB: UPDATE atendimentos SET status = 'EM_ANDAMENTO',<br/>inicio_real = agora WHERE status = 'AGENDADO'
  SV->>DB: UPDATE checkins SET lido_em, latitude,<br/>longitude, precisao_m, distancia_m
  SV->>DB: UPDATE solicitacoes<br/>SET status = 'EM_ANDAMENTO'
  SV->>DB: INSERT mensagens (tipo SISTEMA)
  SV->>AP: notificar(cliente, LEMBRETE)<br/>registrarEvento(CHECKIN)
  end
  SV-->>CT: { atendimentoId, status,<br/>inicioReal, distanciaM }
  CT-->>IN: 200 OK
```

</details>

<a id="24-operacao-c-encerramento"></a>

### Diagrama de operação — encerramento do atendimento (RF33)

![Diagrama de operação — encerramento do atendimento (RF33)](../producao-tecnica/figuras/24-operacao-c-encerramento.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Cliente ou intérprete encerra o atendimento em andamento. O serviço apura a duração real, calcula o valor final pela regra D-03 e, em uma única transação, conclui o atendimento e a solicitação, encerra o compartilhamento de localização e cria o pagamento pendente. O `WHERE status = 'EM_ANDAMENTO'` impede o encerramento em duplicidade.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/24-operacao-c-encerramento.mmd</code>)</summary>

```mermaid
sequenceDiagram
  autonumber
  actor US as Intérprete<br/>ou cliente
  participant CT as atendimento.controller<br/>encerrar
  participant AT as atendimento.service<br/>encerrarAtendimento
  participant DB as PostgreSQL
  participant AP as notificacao.service<br/>auditoria.service
  US->>CT: POST /api/atendimentos/:id/encerrar
  CT->>AT: encerrarAtendimento(atendimentoId,<br/>usuarioId, papel, ip)
  AT->>DB: exigirParticipante()<br/>SELECT atendimento completo
  Note over AT: não participa do atendimento → 403<br/>já CONCLUIDO → 409 ENCERRAMENTO_DUPLICADO<br/>não está EM_ANDAMENTO → 422 ESTADO_INVALIDO
  AT->>AT: calcularValorFinal(cotação, previsto, real)<br/>cobra o maior entre o contratado e o real<br/>arredondado em blocos de 30 min (D-03)
  rect rgb(235, 235, 235)
  Note over AT,DB: db.transaction
  AT->>DB: UPDATE atendimentos SET status = 'CONCLUIDO',<br/>fim_real, duracao_real_min, valor_final<br/>WHERE status = 'EM_ANDAMENTO'
  AT->>DB: UPDATE solicitacoes<br/>SET status = 'CONCLUIDA'
  AT->>DB: UPDATE localizacoes_compartilhadas<br/>SET encerrada_em = agora
  AT->>DB: INSERT pagamentos<br/>(status PENDENTE, valor final)
  AT->>DB: INSERT mensagens (tipo SISTEMA)
  AT->>AP: notificar() para cliente e intérprete<br/>registrarEvento(ENCERRAMENTO)
  end
  AT-->>CT: { status, duracaoRealMin,<br/>valorFinal, pagamentoId }
  CT-->>US: 200 OK
```

</details>

<a id="24-operacao-d-pagamento-comprovante"></a>

### Diagrama de operação — pagamento idempotente e comprovante (RF36, RF37)

![Diagrama de operação — pagamento idempotente e comprovante (RF36, RF37)](../producao-tecnica/figuras/24-operacao-d-pagamento-comprovante.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

A cobrança começa bloqueando os pagamentos do atendimento: duas chamadas simultâneas são serializadas e a segunda encontra o pagamento já PAGO, devolvendo o mesmo resultado sem chamar o gateway de novo. Aprovado pelo gateway, a mesma transação credita o intérprete e emite o comprovante, que depois é entregue em PDF; recusado, a API responde 402 e o cliente pode tentar outra forma.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/24-operacao-d-pagamento-comprovante.mmd</code>)</summary>

```mermaid
sequenceDiagram
  autonumber
  actor CL as Cliente
  participant CT as pagamento.controller<br/>atendimento.controller
  participant PG as pagamento.service<br/>processarPagamento
  participant GW as gateway.service<br/>cobrar
  participant CP as comprovante.service<br/>gerarComprovantePdf
  participant DB as PostgreSQL
  CL->>CT: POST /api/pagamentos/:id/processar<br/>{ formaPagamentoId ou meio }
  CT->>PG: processarPagamento(pagamentoId,<br/>clienteId, entrada, ip)
  PG->>DB: SELECT pagamentos + atendimento + solicitacao
  Note over PG: não é o cliente do atendimento → 403<br/>não CONCLUIDO → 422 ATENDIMENTO_NAO_CONCLUIDO
  rect rgb(235, 235, 235)
  Note over PG,DB: db.transaction
  PG->>DB: SELECT pagamentos WHERE atendimento_id = :id<br/>FOR UPDATE (serializa cobranças simultâneas)
  PG->>DB: SELECT pagamentos WHERE atendimento_id = :id AND status = 'PAGO'
  alt já existe pagamento PAGO
  PG-->>CL: 200 { repetido: true } — nada é cobrado de novo
  else ainda não pago
  PG->>GW: cobrar({ valor, meio,<br/>tokenCartao, finalCartao })
  GW-->>PG: { aprovado, referencia, mensagem }
  PG->>DB: UPDATE pagamentos SET status = PAGO ou FALHOU WHERE status IN ('PENDENTE', 'FALHOU')
  PG->>DB: registrarEvento(PAGAMENTO)
  opt gateway aprovou
  PG->>PG: creditoInterprete(valor pago,<br/>deslocamento)
  PG->>DB: INSERT lancamentos_financeiros (CREDITO_ATENDIMENTO)
  PG->>DB: INSERT comprovantes ON CONFLICT DO NOTHING
  PG->>DB: notificar() para cliente e intérprete
  end
  PG-->>CL: 200 OK (PAGO) ou 402 PAGAMENTO_RECUSADO
  end
  end
  CL->>CT: GET /api/atendimentos/:id/comprovante.pdf
  CT->>CP: gerarComprovantePdf(atendimentoId,<br/>usuarioId, papel)
  CP->>DB: exigirParticipante() · SELECT clientes (CPF a mascarar)
  Note over CP: sem comprovante emitido → 422 COMPROVANTE_INDISPONIVEL
  CP->>CP: gerarPdfComprovante(dados)<br/>views/comprovante.pdf.ts
  CP-->>CL: 200 application/pdf
```

</details>

## Item #26 — Diagrama de processos (telas)

<a id="26-telas-backoffice"></a>

### Processos de telas — backoffice

![Processos de telas — backoffice](../producao-tecnica/figuras/26-telas-backoffice.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Transições entre telas extraídas do código de cada tela (`<Link>`, `<Navigate>` e `navigate()`): 7 transições a partir de 6 telas, das quais 2 pares de ida e volta. Seta simples: clique em um link ou botão, rotulada com o texto do elemento. Seta de duas pontas (⇄): ida e volta por cliques entre as mesmas telas. Seta grossa: navegação feita pelo código depois que a ação é concluída, rotulada com a função. Seta tracejada: redirecionamento automático. Caixas tracejadas são telas de outra área. A marca "☰" indica as telas abertas pelo menu principal, a barra de navegação presente em todas as telas da área (lida de `frontend/src/components/AppShell.tsx`). A lista completa, com arquivo e linha de cada transição, está em `docs/producao-tecnica/tabelas/transicoes-de-telas.md`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/26-telas-backoffice.mmd</code>)</summary>

```mermaid
flowchart LR
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  r_backoffice["<b>Fila de certificações</b><br/>/backoffice<br/>☰ Certificações"]
  r_backoffice_certificacoes_id["<b>Parecer da certificação</b><br/>/backoffice/certificacoes/:id"]
  r_backoffice_chamados["<b>Chamados de suporte</b><br/>/backoffice/chamados<br/>☰ Chamados"]
  r_backoffice_auditoria["<b>Trilha de auditoria</b><br/>/backoffice/auditoria<br/>☰ Auditoria"]
  r_notificacoes["<b>Notificações</b><br/>/notificacoes<br/>☰ Notificações"]
  r_suporte["<b>Suporte</b><br/>/suporte"]
  r_login["<b>Login</b><br/>/login<br/>☰ Sair"]:::externo
  nota_1{{"tela indicada pela<br/>notificação"}}:::externo
  r_backoffice <-->|"Chamados / Gerenciar ⇄<br/>Voltar para Fila de…"| r_backoffice_chamados
  r_backoffice <-->|"Auditoria ⇄ Voltar para<br/>Fila de…"| r_backoffice_auditoria
  r_backoffice -->|"Emitir parecer"| r_backoffice_certificacoes_id
  r_backoffice_certificacoes_id ==>|"registrarParecer() /<br/>Voltar para a fila de…"| r_backoffice
  r_notificacoes ==>|"marcarUmaComoLida()"| nota_1
  class r_backoffice hub;
```

</details>

<a id="26-telas-cliente"></a>

### Processos de telas — área do cliente

![Processos de telas — área do cliente](../producao-tecnica/figuras/26-telas-cliente.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Transições entre telas extraídas do código de cada tela (`<Link>`, `<Navigate>` e `navigate()`): 27 transições a partir de 11 telas, das quais 6 pares de ida e volta. Seta simples: clique em um link ou botão, rotulada com o texto do elemento. Seta de duas pontas (⇄): ida e volta por cliques entre as mesmas telas. Seta grossa: navegação feita pelo código depois que a ação é concluída, rotulada com a função. Seta tracejada: redirecionamento automático. Caixas tracejadas são telas de outra área. A marca "☰" indica as telas abertas pelo menu principal, a barra de navegação presente em todas as telas da área (lida de `frontend/src/components/AppShell.tsx`). A lista completa, com arquivo e linha de cada transição, está em `docs/producao-tecnica/tabelas/transicoes-de-telas.md`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/26-telas-cliente.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  r_cliente["<b>Hub do cliente</b><br/>/cliente<br/>☰ Início"]
  r_cliente_solicitacoes_nova["<b>Nova solicitação</b><br/>/cliente/solicitacoes/nova"]
  r_cliente_solicitacoes_id["<b>Acompanhamento da solicitação</b><br/>/cliente/solicitacoes/:id"]
  r_cliente_atendimentos_id["<b>Detalhe do atendimento (cliente)</b><br/>/cliente/atendimentos/:id"]
  r_cliente_atendimentos_id_sala["<b>Sala de atendimento (cliente)</b><br/>/cliente/atendimentos/:id/sala"]
  r_cliente_atendimentos_id_pagamento["<b>Pagamento</b><br/>/cliente/atendimentos/:id/pagamento"]
  r_cliente_atendimentos_id_avaliar["<b>Avaliar intérprete</b><br/>/cliente/atendimentos/:id/avaliar"]
  r_cliente_historico["<b>Histórico (cliente)</b><br/>/cliente/historico<br/>☰ Atendimentos"]
  r_cliente_perfil["<b>Perfil (cliente)</b><br/>/cliente/perfil<br/>☰ Perfil"]
  r_notificacoes["<b>Notificações</b><br/>/notificacoes<br/>☰ Notificações"]
  r_suporte["<b>Suporte</b><br/>/suporte"]
  r_verificar_codigo["<b>Verificar comprovante</b><br/>/verificar/:codigo"]:::externo
  r_login["<b>Login</b><br/>/login<br/>☰ Sair"]:::externo
  nota_1{{"tela indicada pela<br/>notificação"}}:::externo
  r_cliente <-->|"Solicitar intérprete… ⇄<br/>Voltar ao painel"| r_cliente_solicitacoes_nova
  r_cliente -->|"Ver histórico"| r_cliente_historico
  r_cliente -->|"Preciso de ajuda"| r_suporte
  r_cliente <-->|"· ⇄ Voltar ao painel"| r_cliente_solicitacoes_id
  r_cliente_solicitacoes_nova ==>|"confirmarSolicitacao()"| r_cliente_solicitacoes_id
  r_cliente_solicitacoes_id <-->|"Ficha do atendimento ⇄<br/>Voltar para a…"| r_cliente_atendimentos_id
  r_cliente_solicitacoes_id -->|"Sala de Atendimento"| r_cliente_atendimentos_id_sala
  r_cliente_solicitacoes_id -->|"Pagar"| r_cliente_atendimentos_id_pagamento
  r_cliente_solicitacoes_id -->|"Avaliar Intérprete"| r_cliente_atendimentos_id_avaliar
  r_cliente_atendimentos_id <-->|"Abrir Sala ⇄ Voltar aos<br/>detalhes do…"| r_cliente_atendimentos_id_sala
  r_cliente_atendimentos_id -->|"SOS / Suporte"| r_suporte
  r_cliente_atendimentos_id <-->|"Realizar Pagamento Agora ⇄<br/>Voltar ao atendimento"| r_cliente_atendimentos_id_pagamento
  r_cliente_atendimentos_id -->|"Verificar Autenticidade"| r_verificar_codigo
  r_cliente_atendimentos_id <-->|"Avaliar Intérprete ⇄<br/>Voltar ao Atendimento /<br/>Pular"| r_cliente_atendimentos_id_avaliar
  r_cliente_atendimentos_id_sala -->|"SOS"| r_suporte
  r_cliente_atendimentos_id_pagamento -->|"Avaliar Intérprete"| r_cliente_atendimentos_id_avaliar
  r_cliente_atendimentos_id_pagamento -->|"Ir para o Histórico"| r_cliente_historico
  r_cliente_historico -->|"Solicitar Intérprete"| r_cliente_solicitacoes_nova
  r_cliente_historico -->|"Ver Detalhes"| r_cliente_atendimentos_id
  r_cliente_perfil ==>|"confirmarExclusaoConta()"| r_login
  r_notificacoes ==>|"marcarUmaComoLida()"| nota_1
  class r_cliente hub;
```

</details>

<a id="26-telas-interprete"></a>

### Processos de telas — área do intérprete

![Processos de telas — área do intérprete](../producao-tecnica/figuras/26-telas-interprete.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Transições entre telas extraídas do código de cada tela (`<Link>`, `<Navigate>` e `navigate()`): 27 transições a partir de 12 telas, das quais 4 pares de ida e volta. Seta simples: clique em um link ou botão, rotulada com o texto do elemento. Seta de duas pontas (⇄): ida e volta por cliques entre as mesmas telas. Seta grossa: navegação feita pelo código depois que a ação é concluída, rotulada com a função. Seta tracejada: redirecionamento automático. Caixas tracejadas são telas de outra área. A marca "☰" indica as telas abertas pelo menu principal, a barra de navegação presente em todas as telas da área (lida de `frontend/src/components/AppShell.tsx`). A lista completa, com arquivo e linha de cada transição, está em `docs/producao-tecnica/tabelas/transicoes-de-telas.md`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/26-telas-interprete.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  r_interprete["<b>Hub do intérprete</b><br/>/interprete<br/>☰ Início"]
  r_interprete_demandas["<b>Demandas próximas</b><br/>/interprete/demandas<br/>☰ Demandas"]
  r_interprete_demandas_id["<b>Detalhe da demanda</b><br/>/interprete/demandas/:id"]
  r_interprete_agenda["<b>Raio e disponibilidade</b><br/>/interprete/agenda"]
  r_interprete_atendimentos_id["<b>Detalhe do atendimento (intérprete)</b><br/>/interprete/atendimentos/:id"]
  r_interprete_atendimentos_id_sala["<b>Sala de atendimento (intérprete)</b><br/>/interprete/atendimentos/:id/sala"]
  r_interprete_atendimentos_id_avaliar["<b>Avaliar cliente</b><br/>/interprete/atendimentos/:id/avaliar"]
  r_interprete_ganhos["<b>Ganhos e repasse</b><br/>/interprete/ganhos<br/>☰ Ganhos"]
  r_interprete_historico["<b>Histórico (intérprete)</b><br/>/interprete/historico"]
  r_interprete_perfil["<b>Perfil e habilitação</b><br/>/interprete/perfil<br/>☰ Perfil"]
  r_notificacoes["<b>Notificações</b><br/>/notificacoes<br/>☰ Notificações"]
  r_suporte["<b>Suporte</b><br/>/suporte"]
  r_login["<b>Login</b><br/>/login<br/>☰ Sair"]:::externo
  nota_1{{"tela indicada pela<br/>notificação"}}:::externo
  r_interprete ==>|"aceitarDemanda() /<br/>Gerenciar Atendimento"| r_interprete_atendimentos_id
  r_interprete -->|"Ver documentação"| r_interprete_perfil
  r_interprete <-->|"Raio: … km / Configurar… ⇄<br/>Voltar ao painel"| r_interprete_agenda
  r_interprete -->|"Ver todas"| r_interprete_demandas
  r_interprete -->|"Detalhes"| r_interprete_demandas_id
  r_interprete -->|"Ver Extrato Completo"| r_interprete_ganhos
  r_interprete -->|"Abrir Sala de…"| r_interprete_atendimentos_id_sala
  r_interprete_demandas ==>|"aceitar() / Check-in /<br/>Detalhes"| r_interprete_atendimentos_id
  r_interprete_demandas -->|"Ajustar Raio ( km)"| r_interprete_agenda
  r_interprete_demandas -->|"Detalhes"| r_interprete_demandas_id
  r_interprete_demandas -->|"Sala"| r_interprete_atendimentos_id_sala
  r_interprete_demandas_id ==>|"aceitarDemanda() / Ir para<br/>o Atendimento…"| r_interprete_atendimentos_id
  r_interprete_demandas_id ==>|"confirmarRecusa() / Voltar<br/>às demandas"| r_interprete_demandas
  r_interprete_atendimentos_id -->|"Voltar ao painel do…"| r_interprete
  r_interprete_atendimentos_id <-->|"Sala de Atendimento ⇄<br/>Voltar aos detalhes do…"| r_interprete_atendimentos_id_sala
  r_interprete_atendimentos_id -->|"SOS / Suporte"| r_suporte
  r_interprete_atendimentos_id <-->|"Avaliar Cliente ⇄ Voltar<br/>ao Atendimento / Pular"| r_interprete_atendimentos_id_avaliar
  r_interprete_atendimentos_id <-->|"Ver em Ganhos e Repasses ⇄<br/>·"| r_interprete_ganhos
  r_interprete_atendimentos_id_sala -->|"SOS"| r_suporte
  r_interprete_ganhos -->|"Histórico de…"| r_interprete_historico
  r_interprete_historico -->|"Ver Detalhes"| r_interprete_atendimentos_id
  r_interprete_perfil ==>|"excluirConta()"| r_login
  r_notificacoes ==>|"marcarUmaComoLida()"| nota_1
  class r_interprete hub;
```

</details>

<a id="26-telas-publico"></a>

### Processos de telas — área pública (sem login)

![Processos de telas — área pública (sem login)](../producao-tecnica/figuras/26-telas-publico.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Transições entre telas extraídas do código de cada tela (`<Link>`, `<Navigate>` e `navigate()`): 22 transições a partir de 8 telas, das quais 4 pares de ida e volta. Seta simples: clique em um link ou botão, rotulada com o texto do elemento. Seta de duas pontas (⇄): ida e volta por cliques entre as mesmas telas. Seta grossa: navegação feita pelo código depois que a ação é concluída, rotulada com a função. Seta tracejada: redirecionamento automático. Caixas tracejadas são telas de outra área. A lista completa, com arquivo e linha de cada transição, está em `docs/producao-tecnica/tabelas/transicoes-de-telas.md`.

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/26-telas-publico.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  r_raiz["<b>Splash</b><br/>/"]
  r_login["<b>Login</b><br/>/login"]
  r_recuperar_senha["<b>Recuperar senha</b><br/>/recuperar-senha"]
  r_redefinir_senha_token["<b>Redefinir senha</b><br/>/redefinir-senha/:token"]
  r_cadastro["<b>Seleção de perfil</b><br/>/cadastro"]
  r_cadastro_cliente["<b>Cadastro do cliente</b><br/>/cadastro/cliente"]
  r_cadastro_interprete["<b>Cadastro do intérprete</b><br/>/cadastro/interprete"]
  r_verificar_codigo["<b>Verificar comprovante</b><br/>/verificar/:codigo"]
  r_cliente["<b>Hub do cliente</b><br/>/cliente"]:::externo
  r_interprete["<b>Hub do intérprete</b><br/>/interprete"]:::externo
  r_backoffice["<b>Fila de certificações</b><br/>/backoffice"]:::externo
  r_raiz -.->|"sessão ativa"| r_cliente
  r_raiz -.->|"sessão ativa"| r_interprete
  r_raiz -.->|"sessão ativa"| r_backoffice
  r_raiz -.-> r_login
  r_login ==>|"login válido"| r_cliente
  r_login ==>|"login válido"| r_interprete
  r_login ==>|"login válido"| r_backoffice
  r_login <-->|"Esqueci minha senha ⇄<br/>Voltar ao login"| r_recuperar_senha
  r_login <-->|"Cadastre-se ⇄ Entrar"| r_cadastro
  r_recuperar_senha <-->|"Abrir link de… ⇄ Solicitar<br/>um novo link…"| r_redefinir_senha_token
  r_redefinir_senha_token -->|"Ir para o login"| r_login
  r_cadastro -->|"Sou pessoa surda…"| r_cadastro_cliente
  r_cadastro <-->|"Sou intérprete de Libras…<br/>⇄ Voltar"| r_cadastro_interprete
  r_cadastro_cliente ==>|"enviar() / Ir para o<br/>início"| r_cliente
  r_cadastro_cliente -->|"Já tem uma conta? Voltar…"| r_login
  r_cadastro_interprete -->|"Ir para o painel do…"| r_interprete
  r_verificar_codigo ==>|"consultarOutro()"| r_verificar_codigo
  r_verificar_codigo -->|"Voltar ao acesso da…"| r_login
```

</details>

## Item #27 — Ferramenta CASE

<a id="27-ferramenta-case"></a>

### Ferramenta CASE — cadeia de geração dos modelos a partir do código

![Ferramenta CASE — cadeia de geração dos modelos a partir do código](../producao-tecnica/figuras/27-ferramenta-case.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

Os diagramas deste capítulo não são desenhados à mão: uma cadeia de ferramentas lê o código-fonte, extrai o modelo e gera as figuras. O exportador usa a introspecção do Drizzle ORM sobre o `schema.ts`; o extrator usa a árvore sintática do compilador TypeScript; o Mermaid CLI renderiza as fontes `.mmd`. `npm run verificar` falha se alguma fonte versionada estiver diferente do que o código atual gera — é o que mantém o DER alinhado ao banco (item #38). Os diagramas de casos de uso e de classes das entregas anteriores foram modelados no diagrams.net (`Entregas/30_09/Viamos_Diagramas_Editaveis.drawio`).

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/27-ferramenta-case.mmd</code>)</summary>

```mermaid
flowchart TB
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  subgraph sg_fontes["Código-fonte (fonte única da verdade)"]
    schema["backend/src/models/schema.ts<br/>backend/src/config/regras.ts"]
    rotasFront["frontend/src/rotas.tsx<br/>frontend/src/pages/**"]
    rotasBack["backend/src/routes/index.ts<br/>backend/src/services/**"]
    infra["package-lock.json · render.yaml<br/>vercel.json · ci.yml"]
  end
  subgraph sg_extracao["Extração automática"]
    exportador["backend/src/db/exportar-modelo.ts<br/>(introspecção do Drizzle ORM)"]:::hub
    extrator["docs/diagramas/lib/extrair.mjs<br/>(árvore sintática do TypeScript)"]:::hub
  end
  dados[("docs/diagramas/dados/*.json<br/>27 tabelas · 33 rotas<br/>65 endpoints · 91 transições")]
  construtores["docs/diagramas/lib/diagramas-*.mjs<br/>(construtores Mermaid)"]:::hub
  fontesMmd["docs/diagramas/fontes/*.mmd<br/>34 diagramas"]
  mmdc["Mermaid CLI<br/>(renderização em navegador headless)"]:::hub
  figuras["docs/producao-tecnica/figuras/*.png"]
  tabelas["docs/producao-tecnica/tabelas/*.md<br/>dicionário de dados · rotas · API · tecnologias"]
  verificar{"npm run verificar<br/>fontes em dia com o código?"}:::destaque
  schema --> exportador --> dados
  rotasFront & rotasBack & infra --> extrator --> dados
  dados --> construtores --> fontesMmd --> mmdc --> figuras
  dados --> tabelas
  fontesMmd -.-> verificar
  dados -.-> verificar
```

</details>

## Item #28 — Diagrama de contexto

<a id="28-diagrama-de-contexto"></a>

### Diagrama de contexto — o Víamos e suas integrações externas

![Diagrama de contexto — o Víamos e suas integrações externas](../producao-tecnica/figuras/28-diagrama-de-contexto.png)

Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).

O sistema aparece como caixa-preta: à esquerda, as pessoas que interagem com ele; à direita, os serviços e recursos externos. Dos 65 endpoints da API (`backend/src/routes/index.ts`), 11 são exclusivos do cliente, 15 do intérprete, 6 do operador, 26 servem a qualquer papel autenticado e 7 são públicos (login, cadastro, recuperação de senha, verificação do comprovante e health check). A publicação usa o frontend na Vercel e a API viamos-api no Render (arquitetura técnica, item #8).

<details>
<summary>Fonte Mermaid (<code>docs/diagramas/fontes/28-diagrama-de-contexto.mmd</code>)</summary>

```mermaid
flowchart LR
  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;
  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;
  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;
  subgraph sg_atores["Pessoas"]
    cliente(["<b>Cliente surdo</b>"])
    interprete(["<b>Intérprete de Libras</b>"])
    operador(["<b>Operador</b><br/>backoffice e suporte"])
    publico(["<b>Qualquer pessoa</b><br/>com o código do comprovante"])
  end
  viamos["<b>Plataforma Víamos</b><br/>SPA + API REST + PostgreSQL<br/>65 endpoints"]:::hub
  subgraph sg_externos["Serviços e recursos externos"]
    gateway["<b>Gateway de pagamento</b><br/>simulado no MVP (D-08)"]:::externo
    email["<b>Provedor de e-mail</b><br/>console no MVP"]:::externo
    mapa["<b>OpenStreetMap e Nominatim</b><br/>mapa e busca de endereço"]:::externo
    aparelho["<b>Aparelho do usuário</b><br/>GPS e câmera"]:::externo
  end
  cliente -->|"cadastro, solicitação, QR do check-in,<br/>sala, pagamento e avaliação"| viamos
  viamos -->|"estimativa, andamento, avisos<br/>e comprovante em PDF"| cliente
  interprete -->|"cadastro e certificado, aceite ou recusa,<br/>check-in com GPS, encerramento, repasse"| viamos
  viamos -->|"demandas no raio e na agenda,<br/>avisos e ganhos"| interprete
  operador -->|"parecer da certificação,<br/>atendimento de chamados"| viamos
  viamos -->|"fila de certificações, emergências,<br/>indicadores e trilha de auditoria"| operador
  publico -->|"código de verificação"| viamos
  viamos -->|"dados essenciais do atendimento (RF38)"| publico
  viamos -->|"cobrança Pix ou cartão,<br/>transferência do repasse"| gateway
  gateway -->|"aprovação ou recusa"| viamos
  viamos -->|"link de recuperação de senha"| email
  viamos -->|"blocos do mapa e<br/>busca de endereço"| mapa
  aparelho -->|"posição (check-in, sala)<br/>e leitura do QR"| viamos
```

</details>
