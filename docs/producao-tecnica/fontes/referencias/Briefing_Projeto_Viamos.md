# Projeto Víamos — briefing de continuidade

Análise em 11/09/2026. Base: leitura da árvore completa da pasta do projeto no Google Drive, documentos, planilhas, 12 HTMLs e inspeção visual das 12 imagens exportadas. Nenhum arquivo do Drive foi modificado.

## Diagnóstico executivo

O Víamos conecta pessoas surdas a intérpretes de Libras qualificados para atendimento **exclusivamente presencial**, em saúde, jurídico, educação, eventos e outros compromissos. O aplicativo coordena contratação, encontro, registro do serviço e pós-atendimento.

A pasta oferece uma base consistente de produto e requisitos, acompanhada de protótipos visuais. Contém **45 requisitos funcionais, 45 não funcionais e 24 histórias de usuário, estimadas em 113 pontos**. Esses pontos são estimativas do backlog; não representam horas, progresso ou prazo de entrega.

O estado comprovado é **documentação e prototipação com interações locais limitadas**. Não foi encontrado nesta árvore um projeto de aplicação integrado, backend, esquema de banco, migrações, testes, configuração de build ou deploy. Isso não prova que não exista código em outro local; delimita o que pode ser afirmado a partir desta análise.

O próximo objetivo recomendado é fechar um fluxo persistente de ponta a ponta: cliente cria solicitação → intérprete aprovado aceita → ambos conversam → check-in inicia → encerramento registra duração → pagamento e comprovante têm estado rastreável. Antes disso, é necessário resolver as divergências entre requisitos e telas.

## Fontes e cobertura

| Fonte | Conteúdo e uso |
|---|---|
| [Pasta Projeto Víamos](https://drive.google.com/drive/folders/1WtUo6w4rrxNY6-q8Ny2Yuw_Qzodq2LMu) | Raiz inspecionada; três subpastas: ARQUIVOS .MD, Arquivos Stitch e Entregas. |
| [Contexto](https://drive.google.com/file/d/1AOmueTxsFiXxhNMFn4rG2Shivy9xHG5E/view) | Propósito, perfis, decisões e restrições. Atualizado em 02/09. |
| [PRD](https://drive.google.com/file/d/1-FeC0lQECjEIdXku8yD9MVgTsNMiYb-D/view) | Visão do produto, arquitetura de informação e checklist de design. Atualizado em 02/09. |
| [Design system original](https://drive.google.com/file/d/1hT8fM78b92BBqfrDBhb2IYhYB8LB2uaX/view) | Tokens e orientações visuais. |
| [Arquivos Stitch](https://drive.google.com/drive/folders/14wVLlBXz38Dlvnd_9qA0fKZzBFhu1JQ0) | 12 HTMLs, 12 PNGs e DESIGN.md; atualizados em 09/09. A cópia do DESIGN.md tem conteúdo idêntico ao original. |
| [ENTREGA VIAMOS COMPLETA](https://drive.google.com/file/d/1SQ793hsEwlvhpOjgB7GLBTpO1nbrVOXA/view) | XLSX com seis conjuntos: RF, RNF, associações RF/RNF, Projeto Linear, mapa de histórias e backlog. Atualizado em 03/09. |
| [Entrega separada de requisitos](https://docs.google.com/spreadsheets/d/1XOk7KBoStGsLgdH37yHABDA5FuoDa3LVa5XkXwDLuCw/edit) | RF, RNF e associações. Os 90 registros coincidem com o consolidado após desconsiderar a coluna adicional Versão; associações também coincidem. |
| [Link Entrega 02/09](https://docs.google.com/document/d/1LVDhZl2iYEjYMTNVbGT47P562bJ5AYd1KVSVQtY2bQU/edit) | Documento com chip/link para a planilha separada, sem especificação adicional. |

Foram examinados 31 arquivos em 7 pastas, contando a raiz. A aba “Projeto Linear” é um mapa hierárquico de áreas e requisitos; não é evidência de tarefas cadastradas no serviço Linear. Os identificadores de tela do contexto, como `{{DATA:SCREEN:SCREEN_18}}`, são referências internas do ambiente de design e não rotas executáveis.

## Propósito, públicos e limites

**Cliente surdo:** encontrar intérprete disponível e qualificado, conhecer o custo antes de contratar, coordenar o encontro e consultar histórico e comprovantes. As dores registradas são dificuldade de contratação urgente, preço pouco transparente e dúvida sobre qualificação.

**Intérprete:** encontrar demandas próximas, organizar disponibilidade, demonstrar certificação e acompanhar recebimentos. As dores registradas incluem ociosidade, prospecção e falta de formalização.

**Backoffice:** embora não apareça como um terceiro fluxo principal no PRD, é necessário pelo RF06: aprovar, reprovar ou solicitar correções na documentação profissional. Também há auditoria, privacidade e suporte a operacionalizar. Não há tela administrativa exportada.

O encontro é presencial. Chat, fotos e localização servem à logística; videochamada não pertence ao MVP. Vídeos gravados explicativos em Libras continuam previstos em RNF15/RNF40 e não contradizem essa exclusão.

## Regras e decisões documentadas

| Tema | Regra existente | Consequência para implementação |
|---|---|---|
| Perfis | Cliente e intérprete; aprovação profissional antes de receber/aceitar demandas | Autorizar no servidor, além de separar menus. |
| Certificação | Prolibras **ou equivalente**, com número e arquivo | Cadastro deve permitir equivalência e fluxo de análise/correção. |
| Serviço | Presencial, data/hora não passadas, duração contratada mínima de 1 hora | Validar no formulário e no servidor. |
| Preço | Estimativa depende de tipo, duração e deslocamento | Fórmula, taxas e arredondamentos ainda precisam ser definidos. |
| Distribuição | Disponibilidade, proximidade e reputação; raio ajustável até 15 km | Não confundir raio de busca com tolerância de check-in. |
| Aceite | Vincula à agenda e retira a demanda dos demais intérpretes | Operação atômica para impedir dois aceites concorrentes. |
| Recusa | Motivo opcional no RF23, sem penalidade imediata | Registrar recusa individual sem cancelar a demanda global. |
| Check-in | Intérprete lê QR do cliente a até 200 m do local; leitura com erro máximo de 50 m | Validar QR, vínculo, estado e localização; definir tratamento de precisão insuficiente. |
| Encerramento | Registrar fim e duração real; liberar pagamento e avaliação | Duração contratada e realizada são campos distintos. |
| Pagamento | Pix/cartão por gateway; cartão tokenizado | Cobrança e repasse exigem estados e confirmação de transação. |
| Comprovante | PDF com data, local, duração, profissional/certificação e identificador verificável | Gerar a partir dos registros do atendimento. |
| Avaliação | RF40 permite nota 1–5 e comentário de cliente e intérprete | A UI atual cobre apenas avaliação do intérprete pelo cliente. |
| Privacidade | Consentimento, exportação/exclusão, localização temporária e anonimato público das avaliações | Definir permissões, retenção e apresentação dos dados. |

As referências legais e a expressão “Acessibilidade Garantida” são requisitos e linguagem dos documentos do projeto; esta análise não valida suficiência jurídica do comprovante nem conformidade legal do sistema.

## Inventário de telas e comportamento observado

As correspondências abaixo foram verificadas pelo conteúdo de cada HTML e pela imagem, não pelo número interno SCREEN do contexto. Na tabela, “local” significa interação de interface sem persistência ou serviço conectado.

| Tela | HTML / imagem em Arquivos Stitch | Cobertura e estado observado |
|---|---|---|
| Login | code.html / screen.png | Campos de e-mail/senha e atalhos. Sem autenticação, recuperação ou navegação conectadas. |
| Hub do intérprete | code (1).html / screen (2).png | Demandas, mapa ilustrativo, ganhos, próximo evento e botão de check-in. Toggle online/offline altera aparência e `aria-checked` localmente. |
| Avaliação | code (3).html / screen (4).png | Estrelas com hover/clique, nota e mensagem local. Finalizar não salva avaliação. |
| Gestão de solicitações | code (5).html / screen (6).png | Três demandas demonstrativas e abas. Clique altera estilo da aba, não filtra dados nem aceita/recusa serviços. |
| Cadastro do cliente | code (7).html / screen (8).png | Nome, CPF, nascimento, CEP, complemento, e-mail e senha. Faltam telefone e consentimento previstos; não há criação de conta. |
| Hub do cliente | code (9).html / screen (10).png | Nova solicitação, atendimento, histórico e indicadores fictícios. Há registro “Online”. Imagem exportada tem fundo escuro/preto com texto pouco legível. |
| Perfil | code (11).html / screen (12).png | Dados de cliente, Pix/cartão e segurança; sidebar de intérprete no desktop. Ações sem integração. |
| Histórico | code (13).html / screen (14).png | Serviços de exemplo, filtros e comprovantes. Sidebar de intérprete misturada a conteúdo de cliente; não gera PDF. |
| Nova solicitação | code (15).html / screen (16).png | Tipo, data/hora, duração, endereço e observações. Radios têm comportamento nativo; mapa ilustrativo. Não há estimativa/resumo nem envio real. |
| Cadastro profissional | code (17).html / screen (18).png | Nome, CPF/CNPJ, e-mail, especialidade, valor/hora e seleção de arquivos. Clique abre seletor; não envia documentação para servidor. |
| Splash | code (19).html / screen (20).png | Animação e temporizador de 3 s que apenas escreve no console. Não verifica sessão nem redireciona. PNG mostra somente fundo. |
| Sala/chat | code (21).html / screen (22).png | Conversa demonstrativa e compositor. Não envia mensagens; não implementa localização, fotos, QR ou encerramento. |

Os campos nativos permitem digitação e algumas validações HTML. Isso não comprova um fluxo de negócio funcionando. Os links internos encontrados são `href="#"`; não há navegação conectando esses arquivos. Não foram encontradas chamadas `fetch`, XMLHttpRequest, WebSocket ou uso de localStorage/sessionStorage nesses HTMLs.

**Telas/estados ainda sem exportação dedicada:** seleção de perfil; recuperação de senha e confirmação; consentimento; status de certificação e backoffice; resumo de valor; busca sem intérprete; detalhe/cancelamento; agenda e raio; check-in/QR do cliente; encerramento; checkout/erro de pagamento; extrato/repasse; comprovante verificável; notificações; exportação/exclusão de dados; estados vazios, falhas e reconexão.

## Arquitetura: o que existe e o que falta definir

**Encontrado:** páginas HTML independentes, Tailwind CSS carregado por CDN, fontes Inter e Material Symbols externas, imagens remotas e JavaScript de manipulação do DOM. Tokens e estruturas são repetidos entre arquivos. Mapas são representações visuais; não foi encontrada integração de mapas/geocodificação.

**Não estabelecido pelas fontes:** framework do aplicativo, linguagem/framework de backend, banco, provedor de autenticação, gateway, serviço de mapas/push, hospedagem, repositório oficial e processo de entrega. Android 9+/iOS 14+ aparecem como requisitos; os HTMLs não demonstram atendimento a eles.

**Estrutura lógica proposta para orientar a implementação — ainda não uma decisão do grupo:**

| Camada/módulo | Responsabilidade |
|---|---|
| Aplicativo por perfil | Rotas, formulários, componentes acessíveis, estados de carregamento/erro e histórico local permitido. |
| API de identidade e permissões | Sessões, papéis, recuperação e bloqueio de tentativas. |
| Cadastro e certificações | Perfil profissional, anexos privados e análise pelo backoffice. |
| Solicitações e agenda | Cotação, disponibilidade, seleção de elegíveis, aceite exclusivo e cancelamento. |
| Atendimento | Conversa vinculada ao serviço, localização temporária, check-in e encerramento. |
| Financeiro | Estado do pagamento, confirmação do gateway, saldo e repasse sem duplicação. |
| Histórico e comprovantes | Consulta autorizada e geração/verificação de PDF. |
| Serviços transversais | Notificações, auditoria, consentimentos, retenção, backup e monitoramento. |

Entidades propostas: Usuário, PerfilCliente, PerfilIntérprete, Certificação, AnáliseDocumental, Disponibilidade, Solicitação, Cotação, Aceite/Recusa, Atendimento, Mensagem, Anexo, CheckIn, Pagamento, Repasse, Avaliação, Comprovante, Consentimento e EventoAuditoria. Uma solicitação pertence ao cliente; o aceite vincula o intérprete; mensagens e eventos pertencem ao atendimento. Chaves de acesso e dados financeiros sensíveis não pertencem ao HTML.

Estados de solicitação documentados: **buscando intérprete, aceita, em andamento, concluída e cancelada**. Recomenda-se controlar pagamento e certificação em estados próprios para não confundir “concluído” com “pago”. Falta definir expiração da busca, falta ao encontro, cancelamento pelo profissional, disputa e reatribuição. “Dupla” aparece no hub do intérprete, mas o modelo principal descreve aceite por um profissional: não implementar alocação múltipla sem fechar a regra.

## Inconsistências e decisões pendentes

| Prioridade | Evidência | Correção ou decisão necessária |
|---|---|---|
| Alta | RNF28/contexto excluem vídeo; hub do cliente tem “Online”, formulário mantém campo oculto de link e DESIGN.md menciona gatilhos de videochat | Remover resíduos de atendimento remoto; preservar vídeos explicativos em Libras. |
| Alta | RF13 exige mínimo de 1 h; solicitação oferece 30 min | Retirar opção incompatível ou aprovar mudança formal. Os 45 min da avaliação podem ser duração real, não necessariamente violação do mínimo contratado. |
| Alta | RF15/US07 exigem preço antes de confirmar; formulário vai direto a “Buscar Intérprete” | Criar resumo/cotação e confirmar explicitamente antes de distribuir. |
| Alta | RF03 exige telefone; RF04 exige endereço-base, foto e senha; RF05 exige número de certificado | Completar campos e consentimento. Cadastro profissional atual não cobre esses dados. |
| Alta | RF06 exige validação antes de liberar demandas | Criar análise administrativa e estados em análise/aprovado/reprovado/correção. Não usar selo estático como verificação. |
| Alta | Contexto chama chat de “implementado”; exportação não envia mensagens | Marcar como prototipado até comprovar execução entre dois usuários. Checklist do PRD é de design. |
| Alta | Perfil/histórico mostram navegação profissional com conteúdo de cliente | Separar contexto, permissões e navegação por perfil. |
| Alta | Imagem do hub tem texto sobre fundo preto; botões de aceite mostram texto de baixo contraste | Definir fundo explícito e revisar tokens/contraste em execução. A inspeção visual não substitui medição de contraste. |
| Média | Token `primary` é #03192e; PRD/contexto/RNF45 chamam #1a2e44 de primária | Oficializar semântica: hoje #1a2e44 é `primary-container` no YAML. Evitar substituições indiscriminadas. |
| Média | Raios de borda no HTML divergem do DESIGN.md; `full` chega a 0.75rem em vez de 9999px | Consolidar tokens e componentes reutilizáveis. |
| Média | Toggle h-6/w-11 tem 24×44 px; há textos pequenos de conteúdo | Corrigir área clicável para o requisito 44×44 e revisar textos de leitura de 16sp. Não confundir tamanho do ícone com área interativa. |
| Média | Splash PNG mostra apenas fundo; HTML inicia conteúdo com opacity:0 e animação atrasada | Capturar depois da animação e garantir fallback visível; causa da captura vazia não foi testada em runtime. |
| Média | `toggleLocationField()` consulta `loc_online`, que não existe | Remover função obsoleta. Ela falharia se chamada, mas não foi encontrada ligação que a invoque. |
| Média | Upload anuncia arrastar/soltar e máximo de 5 MB; script só abre seletor | Implementar ou corrigir promessa; validar tipo/tamanho também no servidor. |
| Média | Hub cita check-in 15 min antes e alocação em dupla | São detalhes apenas do mockup; decidir janela e cardinalidade do atendimento. |
| Média | RF23 diz motivo de recusa opcional; US17 o inclui no cenário | Deixar aceitação explícita também sem motivo, se mantido RF23. |
| Média | US09 deseja não ser cobrado, mas aceita aplicação de taxa | Definir janela, valores e comunicação antes do cancelamento. |
| Média | RF40 prevê avaliação bilateral; US13/UI apenas cliente → intérprete | Definir fluxo profissional e destino/privacidade da avaliação do cliente. |
| Média | Preço estimado, preço/hora profissional e cobrança por duração real coexistem sem fórmula | Definir mínimo cobrado, excedentes, deslocamento, taxa de plataforma e arredondamento. |
| Média | Retenção de 5 anos e exclusão de dados estão previstas simultaneamente | Especificar o que é eliminado, anonimizado ou retido e como responder à solicitação. |
| Baixa | Dados de 2023, cartão 12/25, “Home”, “ProProlibras” e nomes de exemplo | Padronizar português e dados de demonstração; não tratá-los como registros reais. |

Também é necessário revisar rastreabilidade: RNF03 (distribuição em 10 s) está associado ao encerramento, RNF39 (criar solicitação em 4 telas/90 s) aparece em avaliação e histórico, e RNF27 (raio de 15 km) aparece no check-in. Essas associações não substituem RF32 (200 m) nem definem critérios adequados para todos esses fluxos.

## Requisitos não funcionais que precisam de evidência

As metas abaixo são transcritas/sintetizadas da entrega, não resultados medidos:

| Área | Meta registrada |
|---|---|
| Desempenho | Tela em até 2 s em 4G; distribuição em até 10 s; 500 solicitações simultâneas com degradação de até 20%. |
| Disponibilidade e recuperação | 99,5% mensal; backup diário, RPO de até 24 h e recuperação em até 4 h. |
| Acessibilidade | WCAG 2.2 AA; contraste mínimo 4,5:1; alvos 44×44; Inter e leitura em 16sp; TalkBack/VoiceOver. |
| Dispositivos | Android 9+; iOS 14+; larguras de 320–480 pontos. |
| Usabilidade | Nova solicitação em até 4 telas e 90 s; português validado com a comunidade surda. |
| Segurança | Hash com sal, HTTPS/TLS 1.2+, 5 tentativas inválidas → bloqueio por 15 min; 2FA desejável. |
| Dados e localização | Sessão típica até 5 MB; parar rastreamento ao terminar; consentimento explícito; histórico offline desejável. |
| Retenção | Atendimento/comprovante por 5 anos; auditoria imutável por pelo menos 6 meses. |

Nenhum teste de aplicativo, carga, dispositivo, pagamento ou acessibilidade assistiva foi executado: não existe projeto integrado na pasta que permita validar esses critérios.

## Trabalho restante em ordem de dependência

Esta é uma proposta de execução. Não foram criadas tarefas externas nem alteradas prioridades dos documentos originais.

| Ordem | Entrega concreta | Referências | Critério de conclusão |
|---|---|---|---|
| A | Fechar escopo e regras contraditórias | RF13, RF15, RF19, RF23, RF40, RNF28 | Registro único com decisões sobre preço, duração, cancelamento, dupla e janela de check-in; mapa das telas reconciliado. |
| B | Definir projeto executável e arquitetura técnica | RNF17–19, RNF23–25 | Repositório oficial, stack/plataforma, comando de execução, modelo de dados e contratos de API documentados. |
| C | Componentes, navegação e identidade | RF01–09, RF43, RF45 | Login e cadastro persistem; sessões abrem o hub correto; terceiro não acessa dados de outro usuário; intérprete pendente não aceita demanda. |
| D | Cadastro e aprovação profissional | RF04–06, RNF36 | Anexos enviados, análise registrada, correção/reenvio funcionando e bloqueios aplicados na API. |
| E | Solicitação, cotação, busca e aceite | RF10–25; US05–09, US14–19 | Cliente confirma preço/local; intérprete elegível aceita; dois aceites simultâneos não geram duplicidade; ausência de profissional e cancelamento têm resposta definida. |
| F | Chat e execução presencial | RF28–34; US10, US20–21 | Dois usuários trocam mensagens; QR válido e posição elegível iniciam uma vez; finalizar registra duração uma vez; localização para ao término. |
| G | Pagamento, ganhos e repasse | RF26–27, RF35–36; US11, US22–23 | Integração inicialmente em sandbox; sucesso, falha e repetição de confirmação não duplicam cobrança/repasse. |
| H | Histórico, PDF e avaliação | RF37–41; US12–13 | Serviço correto aparece no histórico; PDF verificável corresponde ao registro; só participantes avaliam após encerramento. |
| I | Operação e validação final | RF42, RF44–45, RNFs | Notificações, privacidade, auditoria e restauração testadas; acessibilidade e metas de desempenho medidas no ambiente definido. |

**Primeiro incremento sugerido:** uma demonstração persistente de cadastro/login → solicitação com resumo → aceite exclusivo → histórico atualizado entre cliente e intérprete. Usar contas e endereços de teste conhecidos. Integrações ainda simuladas devem ser identificadas na documentação; esse incremento não significa que o MVP inteiro foi entregue.

**Casos críticos para a próxima implementação:** data passada e duração inválida; certificado pendente; demanda fora do raio; agenda conflitante; dois aceites simultâneos; QR de outro atendimento/reutilizado; localização negada ou imprecisa; mensagem de usuário não participante; encerramento repetido; confirmação de pagamento repetida; tentativa de baixar comprovante alheio.

## Contexto pronto para retomar desenvolvimento

Trabalhar sobre o Víamos como plataforma presencial de intérpretes de Libras, com cliente, intérprete e operação administrativa de certificações. Preservar RF01–RF45, RNF01–RNF45 e US01–US24 como identificadores de rastreabilidade. Usar os HTMLs como referência visual, com correções explícitas; não inferir que telas significam funcionalidades entregues. Stack, repositório e integrações não estão definidos no material inspecionado. Priorizar um fluxo persistente e testável entre os dois perfis, mantendo preço antes da confirmação, raio máximo de 15 km, mínimo contratado de 1 h e check-in por QR a até 200 m. Não incluir videochamada no MVP.


## Apêndice A — catálogo completo de requisitos

Fonte: ENTREGA VIAMOS COMPLETA. Prioridades e descrições preservadas; não são indicadores de implementação. RF: 24 essenciais, 18 importantes, 3 desejáveis. RNF: 25 essenciais, 16 importantes, 4 desejáveis.

### Requisitos funcionais

| ID | Nome | Prioridade | Descrição da fonte |
|---|---|---|---|
| RF01 | Efetuar Login | Essencial | Permitir que o usuário surdo ou o intérprete se conecte à plataforma informando e-mail e senha, sendo direcionado ao hub correspondente ao seu perfil. |
| RF02 | Selecionar Tipo de Perfil | Essencial | Permitir que o visitante escolha entre o fluxo de cadastro de cliente surdo e o de intérprete de Libras antes de informar seus dados. |
| RF03 | Cadastrar Cliente Surdo | Essencial | Registrar nome completo, CPF, data de nascimento, e-mail, telefone e senha do usuário surdo, criando sua conta na plataforma. |
| RF04 | Cadastrar Intérprete | Essencial | Registrar dados pessoais, endereço-base de atuação, foto e senha do intérprete de Libras, criando sua conta na plataforma. |
| RF05 | Registrar Certificação Prolibras | Essencial | Permitir que o intérprete informe o número e anexe o arquivo digitalizado do certificado Prolibras ou equivalente durante o cadastro profissional. |
| RF06 | Validar Documentação do Intérprete | Essencial | Permitir que a equipe de backoffice aprove, reprove ou solicite correção da documentação enviada, liberando o perfil somente após a aprovação. |
| RF07 | Recuperar Senha | Importante | Permitir que o usuário solicite a redefinição de senha por meio de link temporário enviado ao e-mail cadastrado. |
| RF08 | Encerrar Sessão | Importante | Permitir que o usuário realize logout, encerrando a sessão e limpando os dados sensíveis armazenados no dispositivo. |
| RF09 | Exibir Splash Screen | Desejável | Apresentar a identidade visual do Víamos e verificar a existência de sessão ativa enquanto os dados iniciais são carregados. |
| RF10 | Criar Nova Solicitação | Essencial | Permitir que o cliente inicie uma solicitação de atendimento presencial de interpretação em Libras a partir do seu hub. |
| RF11 | Selecionar Tipo de Serviço | Essencial | Permitir que o cliente classifique a solicitação entre saúde, jurídico, educação, eventos e demais contextos previstos. |
| RF12 | Definir Data e Horário | Essencial | Permitir que o cliente informe a data e o horário de início do compromisso presencial, bloqueando datas e horários já passados. |
| RF13 | Definir Duração Estimada | Essencial | Permitir que o cliente informe a duração prevista do atendimento em horas, respeitando a contratação mínima de 1 hora. |
| RF14 | Informar Local no Mapa | Essencial | Permitir que o cliente selecione o endereço do atendimento por busca ou por marcação direta no mapa, com complemento e ponto de referência. |
| RF15 | Calcular Valor Estimado | Essencial | Calcular e exibir o valor estimado do atendimento a partir do tipo de serviço, da duração e do deslocamento, antes da confirmação. |
| RF16 | Confirmar Solicitação | Essencial | Registrar a solicitação e iniciar a busca por intérpretes após a confirmação do resumo pelo cliente. |
| RF17 | Distribuir Solicitação por Proximidade | Essencial | Enviar a solicitação aos intérpretes disponíveis situados em um raio de até 15 km do local informado, ordenados por proximidade e reputação. |
| RF18 | Acompanhar Status da Solicitação | Importante | Exibir ao cliente o estado atual da solicitação: buscando intérprete, aceita, em andamento, concluída ou cancelada. |
| RF19 | Cancelar Solicitação | Importante | Permitir que o cliente cancele a solicitação, aplicando as regras de prazo e de eventual taxa de cancelamento. |
| RF20 | Listar Demandas Próximas | Essencial | Exibir ao intérprete a lista de solicitações abertas dentro do seu raio de atuação, com distância, tipo de serviço, data, duração e valor. |
| RF21 | Visualizar Mapa de Demandas | Importante | Exibir as demandas abertas em mapa, com marcadores posicionados no local de cada atendimento e a posição atual do intérprete. |
| RF22 | Aceitar Demanda | Essencial | Permitir que o intérprete aceite uma demanda, vinculando-a à sua agenda e retirando-a da lista dos demais intérpretes. |
| RF23 | Recusar Demanda | Importante | Permitir que o intérprete recuse uma demanda, opcionalmente informando o motivo, sem penalidade imediata. |
| RF24 | Configurar Raio de Atuação | Importante | Permitir que o intérprete ajuste o raio em que deseja receber demandas, limitado ao máximo de 15 km definido pela regra de negócio. |
| RF25 | Gerenciar Disponibilidade | Importante | Permitir que o intérprete informe os dias e as faixas de horário em que está disponível para receber demandas. |
| RF26 | Consultar Ganhos da Semana | Importante | Exibir ao intérprete o total recebido e o total a receber na semana corrente, detalhados por atendimento. |
| RF27 | Solicitar Repasse de Valores | Importante | Permitir que o intérprete solicite a transferência do saldo disponível para a conta bancária cadastrada. |
| RF28 | Trocar Mensagens na Sala de Atendimento | Essencial | Permitir a troca de mensagens de texto entre cliente e intérprete para o alinhamento logístico do encontro presencial. |
| RF29 | Compartilhar Localização em Tempo Real | Importante | Permitir o compartilhamento temporário da localização entre cliente e intérprete no dia e horário do atendimento. |
| RF30 | Enviar Imagem de Ponto de Referência | Desejável | Permitir o envio de fotos do ponto de encontro na sala de atendimento, facilitando a localização em locais públicos ou complexos. |
| RF31 | Realizar Check-in Digital | Essencial | Permitir que o intérprete registre o início do atendimento pela leitura do QR Code exibido no aplicativo do cliente. |
| RF32 | Validar Geolocalização do Check-in | Essencial | Confirmar o check-in somente quando o dispositivo do intérprete estiver a até 200 metros do endereço informado na solicitação. |
| RF33 | Registrar Encerramento do Atendimento | Essencial | Registrar o horário de término, calcular a duração real e encerrar o atendimento, liberando as etapas de pagamento e avaliação. |
| RF34 | Acionar Suporte ou Emergência | Desejável | Disponibilizar acionamento rápido de suporte durante o atendimento presencial, registrando data, hora e localização do chamado. |
| RF35 | Cadastrar Forma de Pagamento | Essencial | Permitir que o cliente cadastre e mantenha cartões de crédito e chave Pix para o pagamento dos atendimentos. |
| RF36 | Processar Pagamento do Atendimento | Essencial | Efetuar a cobrança do valor final por meio do gateway de pagamento integrado, registrando o resultado da transação. |
| RF37 | Emitir Comprovante de Acessibilidade Garantida | Essencial | Gerar o documento digital do atendimento com data, local, duração, dados e certificação do intérprete, para fins legais ou corporativos. |
| RF38 | Compartilhar Comprovante | Importante | Permitir o download e o compartilhamento do comprovante em PDF a partir do histórico de atendimentos. |
| RF39 | Consultar Histórico de Atendimentos | Essencial | Exibir a relação de atendimentos passados do usuário, com filtros por período, tipo de serviço e situação. |
| RF40 | Avaliar Atendimento | Importante | Permitir que cliente e intérprete registrem nota de 1 a 5 e comentário qualitativo após o encerramento do atendimento. |
| RF41 | Calcular Reputação do Intérprete | Importante | Calcular a média das avaliações recebidas e exibi-la no perfil do intérprete e na ordenação das demandas. |
| RF42 | Enviar Notificações | Importante | Notificar os usuários sobre aceite da demanda, lembrete de atendimento, novas mensagens e conclusão do pagamento. |
| RF43 | Gerenciar Dados do Perfil | Importante | Permitir que o usuário consulte e atualize seus dados cadastrais, foto e preferências de acessibilidade. |
| RF44 | Registrar Trilha de Auditoria | Importante | Registrar em log os eventos críticos de cadastro, aceite, check-in, pagamento e cancelamento, com usuário, data e hora. |
| RF45 | Gerenciar Consentimento e Exclusão de Dados | Importante | Permitir que o titular consulte, exporte e solicite a exclusão de seus dados pessoais, conforme a LGPD. |

### Requisitos não funcionais

| ID | Nome | Prioridade | Descrição da fonte |
|---|---|---|---|
| RNF01 | Conectividade | Essencial | É necessária conexão com a internet (mínimo 3G) para autenticação, solicitação e acompanhamento de atendimentos. |
| RNF02 | Tempo de Resposta | Essencial | As telas devem ser carregadas em até 2 segundos em conexão 4G estável. |
| RNF03 | Tempo de Distribuição | Essencial | A solicitação confirmada deve chegar aos intérpretes elegíveis em até 10 segundos. |
| RNF04 | Disponibilidade do Serviço | Essencial | A plataforma deve permanecer disponível 99,5% do tempo, apurado em base mensal. |
| RNF05 | Cadastro Prévio | Essencial | Para acessar as funcionalidades o usuário precisa estar previamente cadastrado e autenticado. |
| RNF06 | Mecanismo de Recuperação de Senha | Importante | A tela de login deve apresentar acesso visível ao mecanismo de recuperação de senha. |
| RNF07 | Armazenamento de Senhas | Essencial | As senhas devem ser armazenadas com hash e sal (bcrypt ou Argon2), nunca em texto puro. |
| RNF08 | Criptografia em Trânsito | Essencial | Toda a comunicação entre aplicativo e servidor deve utilizar HTTPS com TLS 1.2 ou superior. |
| RNF09 | Conformidade com a LGPD | Essencial | O tratamento de dados pessoais deve seguir a Lei 13.709/2018, com base legal e consentimento registrados. |
| RNF10 | Conformidade com a Legislação de Libras | Essencial | A plataforma deve observar a Lei 10.436/2002, o Decreto 5.626/2005 e a Lei 13.146/2015 quanto à atuação do intérprete. |
| RNF11 | Acessibilidade Digital | Essencial | As telas devem atender à WCAG 2.2 no nível AA e às diretrizes de acessibilidade das lojas de aplicativos. |
| RNF12 | Contraste Visual | Essencial | A relação de contraste entre texto e fundo deve ser de no mínimo 4,5:1, conforme o Víamos Design System. |
| RNF13 | Área de Toque | Essencial | Os elementos interativos devem possuir área mínima de toque de 44 x 44 pixels. |
| RNF14 | Tipografia | Importante | Deve ser utilizada a fonte Inter, com corpo mínimo de 16sp para textos de leitura. |
| RNF15 | Comunicação Visual | Essencial | A interface deve priorizar ícones, imagens e vídeos em Libras, evitando blocos densos de texto em português. |
| RNF16 | Suporte a Leitores de Tela | Importante | Todos os elementos devem possuir rótulos acessíveis compatíveis com TalkBack e VoiceOver. |
| RNF17 | Compatibilidade Android | Essencial | O aplicativo deve funcionar em dispositivos com Android 9.0 ou superior. |
| RNF18 | Compatibilidade iOS | Essencial | O aplicativo deve funcionar em dispositivos com iOS 14 ou superior. |
| RNF19 | Responsividade | Importante | O layout deve se adaptar a telas de 320 a 480 pontos de largura sem perda de conteúdo ou de área de toque. |
| RNF20 | Consumo de Dados | Importante | Uma sessão típica de solicitação e acompanhamento não deve consumir mais que 5 MB de dados móveis. |
| RNF21 | Consumo de Bateria | Importante | O rastreamento de localização deve usar precisão balanceada e ser encerrado ao término do atendimento. |
| RNF22 | Operação com Conectividade Instável | Desejável | Histórico e comprovantes já sincronizados devem permanecer disponíveis para consulta sem conexão. |
| RNF23 | Integração com Gateway de Pagamento | Essencial | O sistema deve integrar-se a gateway que suporte Pix e cartão de crédito por meio de API REST. |
| RNF24 | Integração com Serviço de Mapas | Essencial | O sistema deve integrar-se a serviço de mapas e geocodificação para endereços, rotas e cálculo de distância. |
| RNF25 | Integração com Serviço de Notificações | Importante | O envio de notificações deve utilizar serviço de push com confirmação de entrega. |
| RNF26 | Precisão da Geolocalização | Essencial | A leitura de posição utilizada no check-in deve ter erro máximo de 50 metros. |
| RNF27 | Raio Máximo de Atendimento | Essencial | A distribuição de demandas é limitada ao raio de 15 km entre o intérprete e o local do atendimento. |
| RNF28 | Atendimento Exclusivamente Presencial | Essencial | O MVP não oferece chamadas de vídeo em tempo real; toda a interpretação ocorre presencialmente. |
| RNF29 | Retenção de Histórico | Importante | Os registros de atendimento e os comprovantes devem ser mantidos por no mínimo 5 anos. |
| RNF30 | Rotina de Backup | Essencial | Deve haver backup diário automatizado da base de dados, com ponto de recuperação máximo de 24 horas. |
| RNF31 | Recuperação de Desastre | Importante | O tempo máximo de restabelecimento do serviço após falha grave é de 4 horas. |
| RNF32 | Escalabilidade | Importante | A plataforma deve suportar 500 solicitações simultâneas sem degradação superior a 20% no tempo de resposta. |
| RNF33 | Trilha de Auditoria | Importante | Os logs de eventos críticos devem ser imutáveis e mantidos por no mínimo 6 meses. |
| RNF34 | Verificação em Duas Etapas | Desejável | A conta deve poder ser protegida por código enviado ao telefone ou e-mail no acesso a partir de novo dispositivo. |
| RNF35 | Bloqueio por Tentativas | Importante | Após 5 tentativas de login malsucedidas, o acesso deve ser bloqueado temporariamente por 15 minutos. |
| RNF36 | Habilitação Profissional | Essencial | Somente intérpretes com certificação Prolibras ou equivalente validada podem receber e aceitar demandas. |
| RNF37 | Dados de Cartão | Essencial | Dados de cartão não podem ser armazenados na base do Víamos, devendo ser tokenizados pelo gateway conforme o PCI-DSS. |
| RNF38 | Idioma da Interface | Essencial | A interface deve estar em português do Brasil, com terminologia validada junto à comunidade surda. |
| RNF39 | Facilidade de Uso | Importante | Um usuário novo deve concluir uma solicitação em no máximo 4 telas e 90 segundos. |
| RNF40 | Orientação em Libras | Desejável | As telas de cadastro e de primeira solicitação devem oferecer vídeo explicativo em Libras. |
| RNF41 | Formato do Comprovante | Importante | O comprovante de Acessibilidade Garantida deve ser gerado em PDF com identificador único de verificação. |
| RNF42 | Privacidade nas Avaliações | Importante | Comentários de avaliação exibidos publicamente não podem identificar o autor. |
| RNF43 | Isonomia na Distribuição | Importante | O algoritmo de distribuição deve considerar apenas proximidade, disponibilidade e reputação, sem critérios discriminatórios. |
| RNF44 | Consentimento de Localização | Essencial | O acesso à localização deve ser solicitado de forma explícita e utilizado somente durante a solicitação e o atendimento. |
| RNF45 | Padrão de Interface | Desejável | Todas as telas devem utilizar os componentes e tokens do Víamos Design System, incluindo a cor primária #1a2e44 e a navegação inferior persistente. |

## Apêndice B — backlog existente

Estimativas originais, sem evidência de conclusão e sem equivalência automática a horas.

| ID | Perfil | História | Pontos | RF associados |
|---|---|---|---|---|
| US01 | Cliente | Cadastro do usuário surdo | 5 | RF02, RF03, RF45 |
| US02 | Intérprete | Cadastro com certificação Prolibras | 8 | RF04, RF05, RF06 |
| US03 | Comum | Acesso à plataforma | 3 | RF01, RF08, RF09 |
| US04 | Comum | Recuperação de senha | 3 | RF07 |
| US05 | Cliente | Solicitação de intérprete presencial | 8 | RF10, RF11, RF12, RF13, RF14, RF16 |
| US06 | Cliente | Definição do local no mapa | 5 | RF14 |
| US07 | Cliente | Transparência do valor do serviço | 5 | RF15 |
| US08 | Cliente | Acompanhamento da solicitação | 3 | RF17, RF18, RF42 |
| US09 | Cliente | Cancelamento de solicitação | 3 | RF19, RF42 |
| US10 | Cliente | Alinhamento do ponto de encontro | 5 | RF28, RF29, RF30 |
| US11 | Cliente | Pagamento por Pix ou cartão | 5 | RF35, RF36 |
| US12 | Cliente | Comprovante de Acessibilidade Garantida | 5 | RF37, RF38, RF39 |
| US13 | Cliente | Avaliação do atendimento | 3 | RF40, RF41 |
| US14 | Intérprete | Visualização de demandas próximas | 8 | RF17, RF20, RF24 |
| US15 | Intérprete | Mapa de demandas | 5 | RF21 |
| US16 | Intérprete | Aceite de demanda | 5 | RF22, RF42 |
| US17 | Intérprete | Recusa de demanda | 2 | RF23 |
| US18 | Intérprete | Definição do raio de atuação | 3 | RF24 |
| US19 | Intérprete | Gestão de disponibilidade | 5 | RF25 |
| US20 | Intérprete | Check-in digital no local | 8 | RF31, RF32 |
| US21 | Intérprete | Encerramento do atendimento | 5 | RF33, RF34, RF36, RF40 |
| US22 | Intérprete | Acompanhamento de ganhos | 5 | RF26 |
| US23 | Intérprete | Solicitação de repasse | 3 | RF27 |
| US24 | Comum | Controle de dados pessoais (LGPD) | 3 | RF43, RF44, RF45 |

Total verificado: **113 pontos**. Não foram atribuídos responsáveis de desenvolvimento nem datas que não constam das fontes. Os autores dos requisitos não foram tratados automaticamente como responsáveis por tarefas.
