# Rastreabilidade dos requisitos funcionais

Fonte: planilha consolidada, aba Requisitos Funcionais. Os nomes e identificadores originais foram preservados. O detalhamento operacional está nos BPMNs; o DFD cobre também funções de apoio.

| ID | Requisito original | Processo DFD | BPMN / estados | Contexto |
| --- | --- | --- | --- | --- |
| RF01 | Efetuar Login | P1 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF02 | Selecionar Tipo de Perfil | P1 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF03 | Cadastrar Cliente Surdo | P1 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF04 | Cadastrar Intérprete | P1 | B1 | C1 / C2, conforme integração |
| RF05 | Registrar Certificação Prolibras | P1 | B1 | C1 / C2, conforme integração |
| RF06 | Validar Documentação do Intérprete | P1 | B1 | C1 / C2, conforme integração |
| RF07 | Recuperar Senha | P1 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF08 | Encerrar Sessão | P1 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF09 | Exibir Splash Screen | P1 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF10 | Criar Nova Solicitação | P2 | B2 | C1 / C2, conforme integração |
| RF11 | Selecionar Tipo de Serviço | P2 | B2 | C1 / C2, conforme integração |
| RF12 | Definir Data e Horário | P2 | B2 | C1 / C2, conforme integração |
| RF13 | Definir Duração Estimada | P2 | B2 | C1 / C2, conforme integração |
| RF14 | Informar Local no Mapa | P2 | B2 | C1 / C2, conforme integração |
| RF15 | Calcular Valor Estimado | P2 | B2 | C1 / C2, conforme integração |
| RF16 | Confirmar Solicitação | P2 | B2 | C1 / C2, conforme integração |
| RF17 | Distribuir Solicitação por Proximidade | P2 | B3 / E1 | C1 / C2, conforme integração |
| RF18 | Acompanhar Status da Solicitação | P2 | B3 / E1 | C1 / C2, conforme integração |
| RF19 | Cancelar Solicitação | P2 | B6 / E1 | C1 / C2, conforme integração |
| RF20 | Listar Demandas Próximas | P2 | B3 / E1 | C1 / C2, conforme integração |
| RF21 | Visualizar Mapa de Demandas | P2 | B3 / E1 | C1 / C2, conforme integração |
| RF22 | Aceitar Demanda | P2 | B3 / E1 | C1 / C2, conforme integração |
| RF23 | Recusar Demanda | P2 | B3 / E1 | C1 / C2, conforme integração |
| RF24 | Configurar Raio de Atuação | P2 | B3 / E1 | C1 / C2, conforme integração |
| RF25 | Gerenciar Disponibilidade | P2 | B3 / E1 | C1 / C2, conforme integração |
| RF26 | Consultar Ganhos da Semana | P4 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF27 | Solicitar Repasse de Valores | P4 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF28 | Trocar Mensagens na Sala de Atendimento | P3 | B4 / E1 | C1 / C2, conforme integração |
| RF29 | Compartilhar Localização em Tempo Real | P3 | B4 / E1 | C1 / C2, conforme integração |
| RF30 | Enviar Imagem de Ponto de Referência | P3 | B4 / E1 | C1 / C2, conforme integração |
| RF31 | Realizar Check-in Digital | P3 | B4 / E1 | C1 / C2, conforme integração |
| RF32 | Validar Geolocalização do Check-in | P3 | B4 / E1 | C1 / C2, conforme integração |
| RF33 | Registrar Encerramento do Atendimento | P3 | B4 / E1 | C1 / C2, conforme integração |
| RF34 | Acionar Suporte ou Emergência | P3 | B4 / E1 | C1 / C2, conforme integração |
| RF35 | Cadastrar Forma de Pagamento | P4 | B5 | C1 / C2, conforme integração |
| RF36 | Processar Pagamento do Atendimento | P4 | B5 | C1 / C2, conforme integração |
| RF37 | Emitir Comprovante de Acessibilidade Garantida | P5 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF38 | Compartilhar Comprovante | P5 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF39 | Consultar Histórico de Atendimentos | P5 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF40 | Avaliar Atendimento | P5 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF41 | Calcular Reputação do Intérprete | P5 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF42 | Enviar Notificações | P6 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF43 | Gerenciar Dados do Perfil | P6 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF44 | Registrar Trilha de Auditoria | P6 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |
| RF45 | Gerenciar Consentimento e Exclusão de Dados | P6 | Função de apoio detalhada no DFD | C1 / C2, conforme integração |

## Restrições que alteram o comportamento dos modelos

- RNF03: meta de distribuição de até 10 s, não prazo de expiração da busca.
- RNF26: erro de posição de até 50 m no check-in; RF32: distância de até 200 m.
- RNF27: raio de distribuição de até 15 km; RNF36: habilitação antes de receber/aceitar.
- RNF28: serviço presencial; RF13: mínimo contratado de 60 min.
- RNF21/RNF44: localização temporária e consentida.
- RNF23/RNF37: gateway com Pix/cartão e tokenização.
- RNF29/RNF33: retenção de histórico/comprovante por ao menos 5 anos; auditoria por ao menos 6 meses.
- RNF41/RNF42: PDF verificável; privacidade do autor em avaliações públicas.

As demais metas dos 45 RNF permanecem na fonte original. Diagramas de análise não representam validação de desempenho, implementação ou conformidade.
