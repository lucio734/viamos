<!-- ARQUIVO GERADO por docs/diagramas/gerar.mjs — não edite à mão; altere o código-fonte e rode `npm run gerar`. -->

# Endpoints da API

Gerado de `backend/src/routes/index.ts`: 65 endpoints. A especificação completa está em `docs/api/openapi.yaml`.

## Público

| Método | Caminho | Acesso | Controller | Validação (Zod) | Requisitos |
|---|---|---|---|---|---|
| GET | `/api/health` | público | (inline) |  |  |
| GET | `/api/comprovantes/:codigo/verificar` | público | `atendimento.verificarComprovante` |  | RF38 |

## Autenticação e cadastro

| Método | Caminho | Acesso | Controller | Validação (Zod) | Requisitos |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | público | `auth.login` | `auth.esquemaLogin` | RF01 |
| POST | `/api/auth/logout` | autenticado | `auth.logout` |  | RF08 |
| GET | `/api/auth/me` | autenticado | `auth.sessaoAtual` |  | RF09 |
| POST | `/api/auth/recuperar-senha` | público | `auth.recuperarSenha` | `auth.esquemaRecuperar` | RF07 |
| POST | `/api/auth/redefinir-senha` | público | `auth.redefinirSenha` | `auth.esquemaRedefinir` | RF07 |
| POST | `/api/auth/alterar-senha` | autenticado | `auth.alterarSenha` | `auth.esquemaAlterarSenha` |  |
| POST | `/api/cadastro/cliente` | público | `cadastro.cadastrarCliente` | `cadastro.esquemaCadastroCliente` | RF02, RF03 |
| POST | `/api/cadastro/interprete` | público | `cadastro.cadastrarInterprete` | `cadastro.esquemaCadastroInterprete` | RF02, RF04, RF05 |

## Perfil, consentimentos, LGPD e notificações (todos os papéis)

| Método | Caminho | Acesso | Controller | Validação (Zod) | Requisitos |
|---|---|---|---|---|---|
| GET | `/api/perfil` | autenticado | `perfil.obter` |  | RF43 |
| PUT | `/api/perfil` | autenticado | `perfil.atualizar` | `perfil.esquemaAtualizarPerfil` | RF43 |
| GET | `/api/perfil/consentimentos` | autenticado | `perfil.listarConsentimentos` |  | RF45 |
| PUT | `/api/perfil/consentimentos` | autenticado | `perfil.alterarConsentimento` | `perfil.esquemaConsentimento` | RF45 |
| GET | `/api/perfil/dados/exportar` | autenticado | `perfil.exportarDados` |  | RF45 |
| POST | `/api/perfil/dados/excluir` | autenticado | `perfil.solicitarExclusao` |  | RF45 |
| GET | `/api/notificacoes` | autenticado | `perfil.listarNotificacoes` |  | RF42 |
| POST | `/api/notificacoes/ler-todas` | autenticado | `perfil.marcarTodasLidas` |  |  |
| POST | `/api/notificacoes/:id/lida` | autenticado | `perfil.marcarLida` |  |  |

## Cliente: hub, solicitações, formas de pagamento, pagamentos

| Método | Caminho | Acesso | Controller | Validação (Zod) | Requisitos |
|---|---|---|---|---|---|
| GET | `/api/cliente/hub` | CLIENTE | `solicitacao.hub` |  |  |
| POST | `/api/solicitacoes/estimativa` | CLIENTE | `solicitacao.estimar` | `solicitacao.esquemaEstimativa` | RF15 |
| POST | `/api/solicitacoes` | CLIENTE | `solicitacao.criar` | `solicitacao.esquemaSolicitacao` | RF10–RF16 |
| GET | `/api/solicitacoes` | CLIENTE | `solicitacao.listar` | `solicitacao.esquemaListar` | RF18 |
| GET | `/api/solicitacoes/:id` | autenticado | `solicitacao.obter` |  | RF18 |
| POST | `/api/solicitacoes/:id/cancelar` | CLIENTE | `solicitacao.cancelar` | `solicitacao.esquemaCancelar` | RF19 |
| GET | `/api/formas-pagamento` | CLIENTE | `pagamento.listarFormas` |  | RF35 |
| POST | `/api/formas-pagamento` | CLIENTE | `pagamento.adicionarForma` | `pagamento.esquemaFormaPagamento` | RF35 |
| DELETE | `/api/formas-pagamento/:id` | CLIENTE | `pagamento.removerForma` |  | RF35 |
| GET | `/api/pagamentos/pendentes` | CLIENTE | `pagamento.pendentes` |  |  |
| GET | `/api/pagamentos/:id` | autenticado | `pagamento.obter` |  |  |
| POST | `/api/pagamentos/:id/processar` | CLIENTE | `pagamento.processar` | `pagamento.esquemaProcessar` | RF36 |

## Intérprete: hub, demandas, configuração, disponibilidade, certificações, ganhos, repasses

| Método | Caminho | Acesso | Controller | Validação (Zod) | Requisitos |
|---|---|---|---|---|---|
| GET | `/api/interprete/hub` | INTERPRETE | `demanda.hub` |  |  |
| GET | `/api/demandas` | INTERPRETE | `demanda.listar` |  | RF20, RF21 |
| POST | `/api/demandas/:id/aceitar` | INTERPRETE | `demanda.aceitar` |  | RF22 |
| POST | `/api/demandas/:id/recusar` | INTERPRETE | `demanda.recusar` | `demanda.esquemaRecusa` | RF23 |
| PUT | `/api/interprete/configuracao` | INTERPRETE | `demanda.configuracao` | `demanda.esquemaConfiguracao` | RF24 |
| GET | `/api/interprete/disponibilidades` | INTERPRETE | `demanda.listarDisponibilidades` |  | RF25 |
| PUT | `/api/interprete/disponibilidades` | INTERPRETE | `demanda.salvarDisponibilidades` | `demanda.esquemaDisponibilidades` | RF25 |
| GET | `/api/interprete/certificacoes` | INTERPRETE | `demanda.minhasCertificacoes` |  | RF05 |
| POST | `/api/interprete/certificacoes` | INTERPRETE | `demanda.reenviarCertificacao` | `demanda.esquemaReenvioCertificacao` | RF05 |
| GET | `/api/interprete/ganhos` | INTERPRETE | `pagamento.ganhos` |  | RF26 |
| GET | `/api/interprete/contas-bancarias` | INTERPRETE | `pagamento.listarContas` |  |  |
| POST | `/api/interprete/contas-bancarias` | INTERPRETE | `pagamento.salvarConta` | `pagamento.esquemaContaBancaria` |  |
| GET | `/api/interprete/repasses` | INTERPRETE | `pagamento.listarRepasses` |  | RF27 |
| POST | `/api/interprete/repasses` | INTERPRETE | `pagamento.solicitarRepasse` |  | RF27 |

## Atendimentos (participantes: cliente e intérprete)

| Método | Caminho | Acesso | Controller | Validação (Zod) | Requisitos |
|---|---|---|---|---|---|
| GET | `/api/atendimentos` | autenticado | `atendimento.historico` | `atendimento.esquemaHistorico` | RF39 |
| GET | `/api/atendimentos/:id` | autenticado | `atendimento.obter` |  |  |
| GET | `/api/atendimentos/:id/mensagens` | autenticado | `atendimento.listarMensagens` | `atendimento.esquemaMensagensQuery` | RF28 |
| POST | `/api/atendimentos/:id/mensagens` | autenticado | `atendimento.enviarMensagem` | `atendimento.esquemaMensagem` | RF28, RF30 |
| GET | `/api/atendimentos/:id/localizacoes` | autenticado | `atendimento.localizacoes` |  | RF29 |
| POST | `/api/atendimentos/:id/localizacoes` | autenticado | `atendimento.compartilharLocalizacao` | `atendimento.esquemaLocalizacao` | RF29 |
| GET | `/api/atendimentos/:id/qrcode` | CLIENTE | `atendimento.qrcode` |  | RF31 |
| POST | `/api/atendimentos/:id/checkin` | INTERPRETE | `atendimento.checkin` | `atendimento.esquemaCheckin` | RF31, RF32 |
| POST | `/api/atendimentos/:id/encerrar` | autenticado | `atendimento.encerrar` |  | RF33 |
| POST | `/api/atendimentos/:id/suporte` | autenticado | `atendimento.suporte` | `atendimento.esquemaSuporte` | RF34 |
| POST | `/api/suporte` | autenticado | `atendimento.suporte` | `atendimento.esquemaSuporte` | RF34 |
| GET | `/api/atendimentos/:id/comprovante.pdf` | autenticado | `atendimento.comprovantePdf` |  | RF37, RF38 |
| POST | `/api/atendimentos/:id/avaliacoes` | autenticado | `atendimento.avaliar` | `atendimento.esquemaAvaliacao` | RF40 |

## Backoffice / Suporte

| Método | Caminho | Acesso | Controller | Validação (Zod) | Requisitos |
|---|---|---|---|---|---|
| GET | `/api/backoffice/indicadores` | BACKOFFICE/SUPORTE | `backoffice.indicadores` |  |  |
| GET | `/api/backoffice/certificacoes` | BACKOFFICE/SUPORTE | `backoffice.listarCertificacoes` |  | RF06 |
| GET | `/api/backoffice/certificacoes/:id/arquivo` | autenticado | `backoffice.arquivoCertificacao` |  | RF06 |
| POST | `/api/backoffice/certificacoes/:id/parecer` | BACKOFFICE/SUPORTE | `backoffice.parecer` | `backoffice.esquemaParecer` | RF06 |
| GET | `/api/backoffice/chamados` | BACKOFFICE/SUPORTE | `backoffice.listarChamados` |  | RF34 |
| POST | `/api/backoffice/chamados/:id/status` | BACKOFFICE/SUPORTE | `backoffice.atualizarChamado` | `backoffice.esquemaChamadoStatus` |  |
| GET | `/api/backoffice/auditoria` | BACKOFFICE/SUPORTE | `backoffice.auditoria` |  | RF44 |
