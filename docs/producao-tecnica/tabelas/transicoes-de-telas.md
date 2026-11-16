<!-- ARQUIVO GERADO por docs/diagramas/gerar.mjs — não edite à mão; altere o código-fonte e rode `npm run gerar`. -->

# Transições entre telas

Extraídas de `<Link>`, `<NavLink>`, `<Navigate>` e `navigate()` nos componentes de cada rota: 91 transições. A coluna "Evento" traz o texto do link ou botão, ou a função que navega depois da ação.

| Tela de origem | Rota de origem | Gatilho | Evento | Destino | Onde no código |
|---|---|---|---|---|---|
| Splash | `/` | automático |  | (hub do papel) | `pages/auth/Splash.tsx:15` |
| Splash | `/` | automático |  | `/login` | `pages/auth/Splash.tsx:15` |
| Login | `/login` | ação concluída | enviar() | calculado em tempo de execução: `sessao.destino` | `pages/auth/Login.tsx:33` |
| Login | `/login` | clique | Esqueci minha senha | `/recuperar-senha` | `pages/auth/Login.tsx:61` |
| Login | `/login` | clique | Cadastre-se | `/cadastro` | `pages/auth/Login.tsx:73` |
| Recuperar senha | `/recuperar-senha` | clique | Abrir link de redefinição | `/redefinir-senha/:token` | `pages/auth/RecuperarSenha.tsx:63` |
| Recuperar senha | `/recuperar-senha` | clique | Voltar ao login | `/login` | `pages/auth/RecuperarSenha.tsx:70` |
| Recuperar senha | `/recuperar-senha` | clique | Voltar ao login | `/login` | `pages/auth/RecuperarSenha.tsx:97` |
| Redefinir senha | `/redefinir-senha/:token` | clique | Ir para o login | `/login` | `pages/auth/RedefinirSenha.tsx:59` |
| Redefinir senha | `/redefinir-senha/:token` | clique | Solicitar um novo link de recuperação | `/recuperar-senha` | `pages/auth/RedefinirSenha.tsx:70` |
| Seleção de perfil | `/cadastro` | clique | Sou pessoa surda (cliente) Quero solicitar in… | `/cadastro/cliente` | `pages/auth/SelecaoPerfil.tsx:17` |
| Seleção de perfil | `/cadastro` | clique | Sou intérprete de Libras Possuo certificação… | `/cadastro/interprete` | `pages/auth/SelecaoPerfil.tsx:40` |
| Seleção de perfil | `/cadastro` | clique | Entrar | `/login` | `pages/auth/SelecaoPerfil.tsx:66` |
| Cadastro do cliente | `/cadastro/cliente` | ação concluída | enviar() | `/cliente` | `pages/auth/CadastroCliente.tsx:78` |
| Cadastro do cliente | `/cadastro/cliente` | clique | Ir para o início | `/cliente` | `pages/auth/CadastroCliente.tsx:100` |
| Cadastro do cliente | `/cadastro/cliente` | clique | Já tem uma conta? Voltar ao login | `/login` | `pages/auth/CadastroCliente.tsx:255` |
| Cadastro do intérprete | `/cadastro/interprete` | clique | Ir para o painel do intérprete | `/interprete` | `pages/auth/CadastroInterprete.tsx:199` |
| Cadastro do intérprete | `/cadastro/interprete` | clique | Voltar | `/cadastro` | `pages/auth/CadastroInterprete.tsx:501` |
| Verificar comprovante | `/verificar/:codigo` | ação concluída | consultarOutro() | `/verificar/:codigo` | `pages/comum/VerificarComprovante.tsx:55` |
| Verificar comprovante | `/verificar/:codigo` | clique | Voltar ao acesso da plataforma | `/login` | `pages/comum/VerificarComprovante.tsx:187` |
| Hub do cliente | `/cliente` | clique | Solicitar intérprete agora Atendimento presen… | `/cliente/solicitacoes/nova` | `pages/cliente/Hub.tsx:39` |
| Hub do cliente | `/cliente` | clique | Ver histórico | `/cliente/historico` | `pages/cliente/Hub.tsx:82` |
| Hub do cliente | `/cliente` | clique | Preciso de ajuda | `/suporte` | `pages/cliente/Hub.tsx:96` |
| Hub do cliente | `/cliente` | clique |  | `/cliente/solicitacoes/:id` | `pages/cliente/Hub.tsx:107` |
| Nova solicitação | `/cliente/solicitacoes/nova` | ação concluída | confirmarSolicitacao() | `/cliente/solicitacoes/:id` | `pages/cliente/NovaSolicitacao.tsx:159` |
| Nova solicitação | `/cliente/solicitacoes/nova` | clique | Voltar ao painel | `/cliente` | `pages/cliente/NovaSolicitacao.tsx:176` |
| Acompanhamento da solicitação | `/cliente/solicitacoes/:id` | clique | Voltar ao painel | `/cliente` | `pages/cliente/DetalheSolicitacao.tsx:149` |
| Acompanhamento da solicitação | `/cliente/solicitacoes/:id` | clique | Ficha do atendimento | `/cliente/atendimentos/:id` | `pages/cliente/DetalheSolicitacao.tsx:221` |
| Acompanhamento da solicitação | `/cliente/solicitacoes/:id` | clique | Sala de Atendimento | `/cliente/atendimentos/:id/sala` | `pages/cliente/DetalheSolicitacao.tsx:260` |
| Acompanhamento da solicitação | `/cliente/solicitacoes/:id` | clique | Pagar | `/cliente/atendimentos/:id/pagamento` | `pages/cliente/DetalheSolicitacao.tsx:264` |
| Acompanhamento da solicitação | `/cliente/solicitacoes/:id` | clique | Avaliar Intérprete | `/cliente/atendimentos/:id/avaliar` | `pages/cliente/DetalheSolicitacao.tsx:274` |
| Detalhe do atendimento (cliente) | `/cliente/atendimentos/:id` | clique | Voltar para a solicitação | `/cliente/solicitacoes/:id` | `pages/cliente/DetalheAtendimentoCliente.tsx:76` |
| Detalhe do atendimento (cliente) | `/cliente/atendimentos/:id` | clique | Abrir Sala | `/cliente/atendimentos/:id/sala` | `pages/cliente/DetalheAtendimentoCliente.tsx:94` |
| Detalhe do atendimento (cliente) | `/cliente/atendimentos/:id` | clique | SOS / Suporte | `/suporte` | `pages/cliente/DetalheAtendimentoCliente.tsx:97` |
| Detalhe do atendimento (cliente) | `/cliente/atendimentos/:id` | clique | Realizar Pagamento Agora | `/cliente/atendimentos/:id/pagamento` | `pages/cliente/DetalheAtendimentoCliente.tsx:187` |
| Detalhe do atendimento (cliente) | `/cliente/atendimentos/:id` | clique | Verificar Autenticidade | `/verificar/:codigo` | `pages/cliente/DetalheAtendimentoCliente.tsx:197` |
| Detalhe do atendimento (cliente) | `/cliente/atendimentos/:id` | clique | Avaliar Intérprete | `/cliente/atendimentos/:id/avaliar` | `pages/cliente/DetalheAtendimentoCliente.tsx:205` |
| Sala de atendimento (cliente) | `/cliente/atendimentos/:id/sala` | clique | Voltar aos detalhes do atendimento | `/cliente/atendimentos/:id` | `components/Sala.tsx:234` |
| Sala de atendimento (cliente) | `/cliente/atendimentos/:id/sala` | clique | SOS | `/suporte` | `components/Sala.tsx:276` |
| Pagamento | `/cliente/atendimentos/:id/pagamento` | clique | Voltar ao atendimento | `/cliente/atendimentos/:id` | `pages/cliente/PagamentoAtendimento.tsx:150` |
| Pagamento | `/cliente/atendimentos/:id/pagamento` | clique | Voltar ao Atendimento | `/cliente/atendimentos/:id` | `pages/cliente/PagamentoAtendimento.tsx:200` |
| Pagamento | `/cliente/atendimentos/:id/pagamento` | clique | Avaliar Intérprete | `/cliente/atendimentos/:id/avaliar` | `pages/cliente/PagamentoAtendimento.tsx:218` |
| Pagamento | `/cliente/atendimentos/:id/pagamento` | clique | Ir para o Histórico | `/cliente/historico` | `pages/cliente/PagamentoAtendimento.tsx:224` |
| Avaliar intérprete | `/cliente/atendimentos/:id/avaliar` | clique | Voltar ao Atendimento | `/cliente/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:125` |
| Avaliar intérprete | `/cliente/atendimentos/:id/avaliar` | clique | Voltar ao Atendimento | `/cliente/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:136` |
| Avaliar intérprete | `/cliente/atendimentos/:id/avaliar` | clique | Pular | `/cliente/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:188` |
| Histórico (cliente) | `/cliente/historico` | clique | Solicitar Intérprete | `/cliente/solicitacoes/nova` | `pages/comum/HistoricoAtendimentos.tsx:176` |
| Histórico (cliente) | `/cliente/historico` | clique | Ver Detalhes | `/cliente/atendimentos/:id` | `pages/comum/HistoricoAtendimentos.tsx:230` |
| Perfil (cliente) | `/cliente/perfil` | ação concluída | confirmarExclusaoConta() | `/login` | `pages/cliente/PerfilCliente.tsx:254` |
| Hub do intérprete | `/interprete` | ação concluída | aceitarDemanda() | `/interprete/atendimentos/:id` | `pages/interprete/HubInterprete.tsx:73` |
| Hub do intérprete | `/interprete` | clique | Ver documentação | `/interprete/perfil` | `pages/interprete/HubInterprete.tsx:167` |
| Hub do intérprete | `/interprete` | clique | Raio: … km | `/interprete/agenda` | `pages/interprete/HubInterprete.tsx:184` |
| Hub do intérprete | `/interprete` | clique | Ver todas | `/interprete/demandas` | `pages/interprete/HubInterprete.tsx:206` |
| Hub do intérprete | `/interprete` | clique | Detalhes | `/interprete/demandas/:id` | `pages/interprete/HubInterprete.tsx:247` |
| Hub do intérprete | `/interprete` | clique | Ver Extrato Completo | `/interprete/ganhos` | `pages/interprete/HubInterprete.tsx:296` |
| Hub do intérprete | `/interprete` | clique | Configurar Disponibilidade | `/interprete/agenda` | `pages/interprete/HubInterprete.tsx:314` |
| Hub do intérprete | `/interprete` | clique | Gerenciar Atendimento | `/interprete/atendimentos/:id` | `pages/interprete/HubInterprete.tsx:339` |
| Hub do intérprete | `/interprete` | clique | Abrir Sala de Atendimento | `/interprete/atendimentos/:id/sala` | `pages/interprete/HubInterprete.tsx:344` |
| Demandas próximas | `/interprete/demandas` | ação concluída | aceitar() | `/interprete/atendimentos/:id` | `pages/interprete/DemandasInterprete.tsx:61` |
| Demandas próximas | `/interprete/demandas` | clique | Ajustar Raio ( km) | `/interprete/agenda` | `pages/interprete/DemandasInterprete.tsx:165` |
| Demandas próximas | `/interprete/demandas` | clique | Detalhes | `/interprete/demandas/:id` | `pages/interprete/DemandasInterprete.tsx:243` |
| Demandas próximas | `/interprete/demandas` | clique | Check-in / Detalhes | `/interprete/atendimentos/:id` | `pages/interprete/DemandasInterprete.tsx:308` |
| Demandas próximas | `/interprete/demandas` | clique | Sala | `/interprete/atendimentos/:id/sala` | `pages/interprete/DemandasInterprete.tsx:313` |
| Detalhe da demanda | `/interprete/demandas/:id` | ação concluída | aceitarDemanda() | `/interprete/atendimentos/:id` | `pages/interprete/DetalheDemanda.tsx:49` |
| Detalhe da demanda | `/interprete/demandas/:id` | ação concluída | confirmarRecusa() | `/interprete/demandas` | `pages/interprete/DetalheDemanda.tsx:64` |
| Detalhe da demanda | `/interprete/demandas/:id` | clique | Voltar às demandas | `/interprete/demandas` | `pages/interprete/DetalheDemanda.tsx:77` |
| Detalhe da demanda | `/interprete/demandas/:id` | clique | Ir para o Atendimento Confirmado | `/interprete/atendimentos/:id` | `pages/interprete/DetalheDemanda.tsx:199` |
| Raio e disponibilidade | `/interprete/agenda` | clique | Voltar ao painel | `/interprete` | `pages/interprete/AgendaInterprete.tsx:138` |
| Detalhe do atendimento (intérprete) | `/interprete/atendimentos/:id` | clique | Voltar ao painel do intérprete | `/interprete` | `pages/interprete/DetalheAtendimentoInterprete.tsx:152` |
| Detalhe do atendimento (intérprete) | `/interprete/atendimentos/:id` | clique | Sala de Atendimento | `/interprete/atendimentos/:id/sala` | `pages/interprete/DetalheAtendimentoInterprete.tsx:170` |
| Detalhe do atendimento (intérprete) | `/interprete/atendimentos/:id` | clique | SOS / Suporte | `/suporte` | `pages/interprete/DetalheAtendimentoInterprete.tsx:173` |
| Detalhe do atendimento (intérprete) | `/interprete/atendimentos/:id` | clique | Avaliar Cliente | `/interprete/atendimentos/:id/avaliar` | `pages/interprete/DetalheAtendimentoInterprete.tsx:272` |
| Detalhe do atendimento (intérprete) | `/interprete/atendimentos/:id` | clique | Ver em Ganhos e Repasses | `/interprete/ganhos` | `pages/interprete/DetalheAtendimentoInterprete.tsx:281` |
| Sala de atendimento (intérprete) | `/interprete/atendimentos/:id/sala` | clique | Voltar aos detalhes do atendimento | `/interprete/atendimentos/:id` | `components/Sala.tsx:234` |
| Sala de atendimento (intérprete) | `/interprete/atendimentos/:id/sala` | clique | SOS | `/suporte` | `components/Sala.tsx:276` |
| Avaliar cliente | `/interprete/atendimentos/:id/avaliar` | clique | Voltar ao Atendimento | `/interprete/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:125` |
| Avaliar cliente | `/interprete/atendimentos/:id/avaliar` | clique | Voltar ao Atendimento | `/interprete/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:136` |
| Avaliar cliente | `/interprete/atendimentos/:id/avaliar` | clique | Pular | `/interprete/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:188` |
| Ganhos e repasse | `/interprete/ganhos` | clique | Histórico de Atendimentos | `/interprete/historico` | `pages/interprete/GanhosInterprete.tsx:111` |
| Ganhos e repasse | `/interprete/ganhos` | clique |  | `/interprete/atendimentos/:id` | `pages/interprete/GanhosInterprete.tsx:172` |
| Histórico (intérprete) | `/interprete/historico` | clique | Ver Detalhes | `/interprete/atendimentos/:id` | `pages/comum/HistoricoAtendimentos.tsx:230` |
| Perfil e habilitação | `/interprete/perfil` | ação concluída | excluirConta() | `/login` | `pages/interprete/PerfilInterprete.tsx:273` |
| Fila de certificações | `/backoffice` | clique | Chamados | `/backoffice/chamados` | `pages/backoffice/FilaCertificacoes.tsx:61` |
| Fila de certificações | `/backoffice` | clique | Auditoria | `/backoffice/auditoria` | `pages/backoffice/FilaCertificacoes.tsx:66` |
| Fila de certificações | `/backoffice` | clique | Gerenciar | `/backoffice/chamados` | `pages/backoffice/FilaCertificacoes.tsx:114` |
| Fila de certificações | `/backoffice` | clique | Emitir parecer | `/backoffice/certificacoes/:id` | `pages/backoffice/FilaCertificacoes.tsx:215` |
| Parecer da certificação | `/backoffice/certificacoes/:id` | ação concluída | registrarParecer() | `/backoffice` | `pages/backoffice/ParecerCertificacao.tsx:73` |
| Parecer da certificação | `/backoffice/certificacoes/:id` | clique | Voltar para a fila de certificações | `/backoffice` | `pages/backoffice/ParecerCertificacao.tsx:89` |
| Chamados de suporte | `/backoffice/chamados` | clique | Voltar para Fila de Certificações | `/backoffice` | `pages/backoffice/ChamadosSuporte.tsx:54` |
| Trilha de auditoria | `/backoffice/auditoria` | clique | Voltar para Fila de Certificações | `/backoffice` | `pages/backoffice/TrilhaAuditoria.tsx:51` |
| Notificações | `/notificacoes` | ação concluída | marcarUmaComoLida() | calculado em tempo de execução: `n.referenciaRecurso` | `pages/comum/Notificacoes.tsx:59` |

## Menu principal (em todas as telas autenticadas)

| Papel | Item | Destino |
|---|---|---|
| CLIENTE | Início | `/cliente` |
| CLIENTE | Atendimentos | `/cliente/historico` |
| CLIENTE | Perfil | `/cliente/perfil` |
| INTERPRETE | Início | `/interprete` |
| INTERPRETE | Demandas | `/interprete/demandas` |
| INTERPRETE | Ganhos | `/interprete/ganhos` |
| INTERPRETE | Perfil | `/interprete/perfil` |
| BACKOFFICE | Certificações | `/backoffice` |
| BACKOFFICE | Chamados | `/backoffice/chamados` |
| BACKOFFICE | Auditoria | `/backoffice/auditoria` |
| todos | Notificações | `/notificacoes` |
| todos | Sair | `/login` |

## Ramos que não se aplicam à tela de origem

Componentes compartilhados entre papéis montam o caminho do outro papel em um ramo condicional; esses destinos não são alcançados a partir da tela indicada e ficam fora dos diagramas.

| Rota de origem | Destino descartado | Onde no código |
|---|---|---|
| `/cliente/atendimentos/:id/sala` | `/interprete/atendimentos/:id` | `components/Sala.tsx:234` |
| `/cliente/atendimentos/:id/avaliar` | `/interprete/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:125` |
| `/cliente/atendimentos/:id/avaliar` | `/interprete/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:136` |
| `/cliente/atendimentos/:id/avaliar` | `/interprete/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:188` |
| `/cliente/historico` | `/interprete/atendimentos/:id` | `pages/comum/HistoricoAtendimentos.tsx:230` |
| `/interprete/atendimentos/:id/sala` | `/cliente/atendimentos/:id` | `components/Sala.tsx:234` |
| `/interprete/atendimentos/:id/avaliar` | `/cliente/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:125` |
| `/interprete/atendimentos/:id/avaliar` | `/cliente/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:136` |
| `/interprete/atendimentos/:id/avaliar` | `/cliente/atendimentos/:id` | `pages/comum/AvaliarAtendimento.tsx:188` |
| `/interprete/historico` | `/cliente/solicitacoes/nova` | `pages/comum/HistoricoAtendimentos.tsx:176` |
| `/interprete/historico` | `/cliente/atendimentos/:id` | `pages/comum/HistoricoAtendimentos.tsx:230` |
