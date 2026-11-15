<!-- ARQUIVO GERADO por docs/diagramas/gerar.mjs — não edite à mão; altere o código-fonte e rode `npm run gerar`. -->

# Rotas e telas (sitemap em tabela)

Gerado de `frontend/src/rotas.tsx`: 33 rotas e 30 telas distintas (componentes compartilhados entre papéis contam uma vez).

| Área | Rota | Tela | Componente | Arquivo | Acesso |
|---|---|---|---|---|---|
| Área pública (sem login) | `/` | Splash | `Splash` | `frontend/src/pages/auth/Splash.tsx` | público |
| Área pública (sem login) | `/login` | Login | `Login` | `frontend/src/pages/auth/Login.tsx` | público |
| Área pública (sem login) | `/recuperar-senha` | Recuperar senha | `RecuperarSenha` | `frontend/src/pages/auth/RecuperarSenha.tsx` | público |
| Área pública (sem login) | `/redefinir-senha/:token` | Redefinir senha | `RedefinirSenha` | `frontend/src/pages/auth/RedefinirSenha.tsx` | público |
| Área pública (sem login) | `/cadastro` | Seleção de perfil | `SelecaoPerfil` | `frontend/src/pages/auth/SelecaoPerfil.tsx` | público |
| Área pública (sem login) | `/cadastro/cliente` | Cadastro do cliente | `CadastroCliente` | `frontend/src/pages/auth/CadastroCliente.tsx` | público |
| Área pública (sem login) | `/cadastro/interprete` | Cadastro do intérprete | `CadastroInterprete` | `frontend/src/pages/auth/CadastroInterprete.tsx` | público |
| Área pública (sem login) | `/verificar/:codigo` | Verificar comprovante | `VerificarComprovante` | `frontend/src/pages/comum/VerificarComprovante.tsx` | público |
| Área do cliente | `/cliente` | Hub do cliente | `HubCliente` | `frontend/src/pages/cliente/Hub.tsx` | CLIENTE |
| Área do cliente | `/cliente/solicitacoes/nova` | Nova solicitação | `NovaSolicitacao` | `frontend/src/pages/cliente/NovaSolicitacao.tsx` | CLIENTE |
| Área do cliente | `/cliente/solicitacoes/:id` | Acompanhamento da solicitação | `DetalheSolicitacao` | `frontend/src/pages/cliente/DetalheSolicitacao.tsx` | CLIENTE |
| Área do cliente | `/cliente/atendimentos/:id` | Detalhe do atendimento (cliente) | `DetalheAtendimentoCliente` | `frontend/src/pages/cliente/DetalheAtendimentoCliente.tsx` | CLIENTE |
| Área do cliente | `/cliente/atendimentos/:id/sala` | Sala de atendimento (cliente) | `Sala` | `frontend/src/components/Sala.tsx` | CLIENTE |
| Área do cliente | `/cliente/atendimentos/:id/pagamento` | Pagamento | `PagamentoAtendimento` | `frontend/src/pages/cliente/PagamentoAtendimento.tsx` | CLIENTE |
| Área do cliente | `/cliente/atendimentos/:id/avaliar` | Avaliar intérprete | `AvaliarAtendimento` | `frontend/src/pages/comum/AvaliarAtendimento.tsx` | CLIENTE |
| Área do cliente | `/cliente/historico` | Histórico (cliente) | `HistoricoAtendimentos` | `frontend/src/pages/comum/HistoricoAtendimentos.tsx` | CLIENTE |
| Área do cliente | `/cliente/perfil` | Perfil (cliente) | `PerfilCliente` | `frontend/src/pages/cliente/PerfilCliente.tsx` | CLIENTE |
| Área do intérprete | `/interprete` | Hub do intérprete | `HubInterprete` | `frontend/src/pages/interprete/HubInterprete.tsx` | INTERPRETE |
| Área do intérprete | `/interprete/demandas` | Demandas próximas | `DemandasInterprete` | `frontend/src/pages/interprete/DemandasInterprete.tsx` | INTERPRETE |
| Área do intérprete | `/interprete/demandas/:id` | Detalhe da demanda | `DetalheDemanda` | `frontend/src/pages/interprete/DetalheDemanda.tsx` | INTERPRETE |
| Área do intérprete | `/interprete/agenda` | Raio e disponibilidade | `AgendaInterprete` | `frontend/src/pages/interprete/AgendaInterprete.tsx` | INTERPRETE |
| Área do intérprete | `/interprete/atendimentos/:id` | Detalhe do atendimento (intérprete) | `DetalheAtendimentoInterprete` | `frontend/src/pages/interprete/DetalheAtendimentoInterprete.tsx` | INTERPRETE |
| Área do intérprete | `/interprete/atendimentos/:id/sala` | Sala de atendimento (intérprete) | `Sala` | `frontend/src/components/Sala.tsx` | INTERPRETE |
| Área do intérprete | `/interprete/atendimentos/:id/avaliar` | Avaliar cliente | `AvaliarAtendimento` | `frontend/src/pages/comum/AvaliarAtendimento.tsx` | INTERPRETE |
| Área do intérprete | `/interprete/ganhos` | Ganhos e repasse | `GanhosInterprete` | `frontend/src/pages/interprete/GanhosInterprete.tsx` | INTERPRETE |
| Área do intérprete | `/interprete/historico` | Histórico (intérprete) | `HistoricoAtendimentos` | `frontend/src/pages/comum/HistoricoAtendimentos.tsx` | INTERPRETE |
| Área do intérprete | `/interprete/perfil` | Perfil e habilitação | `PerfilInterprete` | `frontend/src/pages/interprete/PerfilInterprete.tsx` | INTERPRETE |
| Backoffice | `/backoffice` | Fila de certificações | `FilaCertificacoes` | `frontend/src/pages/backoffice/FilaCertificacoes.tsx` | BACKOFFICE, SUPORTE |
| Backoffice | `/backoffice/certificacoes/:id` | Parecer da certificação | `ParecerCertificacao` | `frontend/src/pages/backoffice/ParecerCertificacao.tsx` | BACKOFFICE, SUPORTE |
| Backoffice | `/backoffice/chamados` | Chamados de suporte | `ChamadosSuporte` | `frontend/src/pages/backoffice/ChamadosSuporte.tsx` | BACKOFFICE, SUPORTE |
| Backoffice | `/backoffice/auditoria` | Trilha de auditoria | `TrilhaAuditoria` | `frontend/src/pages/backoffice/TrilhaAuditoria.tsx` | BACKOFFICE, SUPORTE |
| Telas comuns | `/notificacoes` | Notificações | `Notificacoes` | `frontend/src/pages/comum/Notificacoes.tsx` | CLIENTE, INTERPRETE, BACKOFFICE, SUPORTE |
| Telas comuns | `/suporte` | Suporte | `Suporte` | `frontend/src/pages/comum/Suporte.tsx` | CLIENTE, INTERPRETE, BACKOFFICE, SUPORTE |
