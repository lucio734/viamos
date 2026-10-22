# Análise integral do Projeto Víamos

## Cobertura e preservação

O ZIP fornecido contém **34 arquivos**, todos importados sem alterar seus bytes. O [inventário](inventario-importacao.json) registra caminho original, destino, tamanho e SHA-256. Foram analisados os cinco Markdown, os textos e estruturas dos 12 HTMLs, as 12 imagens, todas as abas das duas planilhas, o documento DOCX, as 23 páginas do PDF de arquitetura e as 23 vistas do Draw.io. Os dois PDFs da atividade também foram consultados: guia de 2 páginas e material didático de 22 slides.

A distribuição é: documentação e protótipos em `projeto/`; entregas antigas em `entregas/anteriores/`; nova atividade em `entregas/modelagem-sistemas/`; referências da disciplina em `referencias/modelagem-sistemas/`. Nomes de arquivos antigos e conteúdo foram preservados, inclusive duplicatas e divergências.

## Produto e limites

O Víamos conecta pessoas surdas a intérpretes de Libras para serviços **presenciais** em saúde, jurídico, educação, eventos e demais contextos previstos. O aplicativo organiza contratação, encontro, registro do serviço e pós-atendimento. Não fornece interpretação por videochamada no MVP; vídeos gravados de orientação em Libras continuam previstos.

Atores humanos: cliente surdo, intérprete, Backoffice de validação documental e Suporte. A entrega UML anterior explicita os dois papéis operacionais. Integrações: mapas/geocodificação, gateway financeiro, notificações push, e-mail para recuperação e localização do dispositivo. Não há evidência de sistema legado ou base externa compartilhada. Não foram escolhidos fornecedores específicos.

## Requisitos e histórias

A planilha consolidada tem seis abas: Requisitos Funcionais, Requisitos Não Funcionais, Associação RF x RNF, Projeto Linear, Mapa User Story e Backlog (Resumo). Há **45 RF, 45 RNF, 24 histórias e 113 pontos**. Pontos são estimativas do backlog, não horas ou comprovação de execução.

Os registros RF/RNF da planilha separada são idênticos aos do consolidado após remover a coluna adicional “Versão”. A aba de associações também é idêntica. A aba Projeto Linear é um mapa funcional; não comprova criação de tarefas no serviço Linear. O DOCX contém o título/link da entrega de requisitos e não acrescenta regras de negócio.

A nova [matriz de rastreabilidade](../entregas/modelagem-sistemas/rastreabilidade.md) preserva os 45 identificadores RF. RNFs restringem os modelos, mas diagramas não comprovam desempenho, acessibilidade, segurança ou conformidade legal implementados.

## Regras consolidadas

| Tema | Evidência | Aplicação nos modelos |
| --- | --- | --- |
| Acesso | RF01–RF09; RNF05–08, RNF34–36 | Identidade e sessão em P1; habilitação profissional em B1. |
| Certificação | RF05–06 | Prolibras ou equivalente, arquivo e número; aprovação, reprovação ou correção. |
| Solicitação | RF10–RF16 | Serviço presencial, data/hora não passadas, mínimo contratado de 60 min, endereço e estimativa antes da confirmação. |
| Busca | RF17, RF24–25; RNF27/36/43 | Profissional aprovado, disponível, no raio configurado até 15 km; proximidade e reputação. |
| Aceite | RF22; US16 | Operação exclusiva, vínculo à agenda e remoção da oferta para os demais. |
| Recusa | RF23; US17 | Individual, motivo opcional, sem cancelar a busca e sem penalidade imediata. |
| Cancelamento | RF19; US09 | Antes de iniciar, sujeito à política de prazo e eventual taxa. Valores não definidos. |
| Comunicação | RF28–RF30; RNF44 | Mensagens, fotos e localização temporária entre participantes; finalidade logística. |
| Check-in | RF31–RF32; RNF26 | Cliente exibe QR, intérprete lê; distância até 200 m e erro de posição até 50 m. |
| Encerramento | RF33; US21 | Intérprete encerra; registrar fim e duração real; liberar pagamento e avaliação. |
| Financeiro | RF26–27, RF35–36; RNF23/37 | Pix/cartão tokenizado; registrar tentativa/resultado, ganhos, reserva de saldo e repasse. |
| Comprovante | RF37–RF39; US12; RNF41 | Após conclusão; PDF com dados reais e identificador verificável. Não depende de pagamento aprovado. |
| Avaliação | RF40–RF41; UML DC9 | Bilateral; uma por autor/atendimento; reputação usa avaliações recebidas pelo intérprete. |
| Governança | RF42–45; RNF09/25/29/33 | Notificação e entrega, perfil, consentimento, pedido de dados, auditoria e retenção. |

## O que os protótipos mostram

Os 12 HTMLs são páginas independentes com Tailwind por CDN, fontes externas e dados demonstrativos. Não compõem uma aplicação integrada; os arquivos não trazem backend, banco, migrações, testes, build ou deploy. Interações locais e campos HTML não comprovam regras de negócio funcionando.

| HTML / PNG | Tela e observação |
| --- | --- |
| code.html / screen.png | Login; campos de acesso e recuperação sem autenticação conectada. |
| code (1).html / screen (2).png | Hub do intérprete; toggle local; demandas e ganhos ilustrativos; menciona dupla e janela de check-in sem regra consolidada. |
| code (3).html / screen (4).png | Avaliação; estrelas interativas locais, sem persistência. 45 min pode ser duração realizada. |
| code (5).html / screen (6).png | Gestão de solicitações; ofertas demonstrativas e abas locais. |
| code (7).html / screen (8).png | Cadastro do cliente; faltam telefone e consentimento previstos. |
| code (9).html / screen (10).png | Hub do cliente; resíduo de atendimento online e captura com fundo escuro de baixa legibilidade. |
| code (11).html / screen (12).png | Perfil de cliente com navegação profissional; Pix/cartão são demonstrações. |
| code (13).html / screen (14).png | Histórico com dados fictícios e navegação misturada entre perfis. |
| code (15).html / screen (16).png | Nova solicitação; oferece 30 min, mantém resíduo de link remoto e não mostra confirmação com estimativa. |
| code (17).html / screen (18).png | Cadastro profissional; seletor local de arquivos, sem validação documental real; faltam campos dos requisitos. |
| code (19).html / screen (20).png | Splash; temporizador local; PNG mostra fundo sem conteúdo visível. |
| code (21).html / screen (22).png | Chat demonstrativo; sem envio real, QR, geolocalização ou encerramento integrados. |

Os dois DESIGN.md têm o mesmo conteúdo. A semântica da cor principal e os resíduos de videochat nos exemplos visuais não modificam o escopo presencial definido pelos requisitos.

## Entrega UML anterior

O PDF e o Draw.io contêm 23 vistas: duas visões gerais, nove de casos de uso, onze de classes e uma de orientações de leitura. Foram usados para manter o vocabulário e os vínculos entre Solicitação, Atendimento, Certificação, Pagamento, Repasse, Comprovante e Avaliação.

A entrega distingue estado financeiro do operacional, permite tentativas de pagamento, limita o aceite a um vínculo e modela a avaliação bilateral. Repasses pelo gateway são apresentados nela como proposta arquitetural, não como fornecedor contratado. A nova entrega conserva essa distinção.

O PDF anterior menciona um “catálogo de apoio”/“memória de modelagem” que não está entre os arquivos do ZIP; seu conteúdo não foi presumido. O briefing de setembro é histórico: descreve 31 arquivos, enquanto o ZIP atual contém 34, incluindo o próprio briefing e a entrega de arquitetura.

## Divergências resolvidas para esta modelagem

1. **Online versus presencial:** contexto e RNF28 prevalecem sobre o protótipo; não há videochamada.
2. **30 min versus 1 h:** RF13 prevalece na duração contratada. Duração realizada permanece separada.
3. **Certificação:** selo visual não equivale a aprovação; B1 exige análise documental.
4. **Preço:** RF15/US07 exigem estimativa e confirmação antes da busca, mesmo que a tela antiga pule essa etapa.
5. **Raio:** 15 km é distribuição; 200 m é check-in; 50 m é precisão. São três restrições distintas.
6. **Recusa:** motivo opcional segundo RF23; recusar uma oferta não cancela a solicitação.
7. **Avaliação:** RF40 é bilateral, embora a tela e US13 mostrem apenas cliente avaliando intérprete.
8. **Pagamento:** “concluída” é estado do serviço; “pago” é informação financeira adicional do histórico.
9. **Rastreabilidade antiga:** associações como RNF03 no encerramento e RNF27 no check-in não substituem os requisitos específicos. A matriz nova usa o texto normativo de cada requisito.

## Pontos ainda não especificados

Fórmula de preço, mínimo cobrado versus duração real, excedentes, taxa/prazo de cancelamento, expiração da busca, falta ao encontro, cancelamento pelo intérprete, reatribuição, disputas, alocação em dupla, janela de check-in e política detalhada de retenção/exclusão não têm definição suficiente. Os diagramas não atribuem números ou regras a essas lacunas.

A espera por disponibilidade em B3 mantém a busca aberta, sem prazo inventado. P6 coordena solicitações LGPD, mas não determina apagamento automático de registros sujeitos a retenção. A escolha de fornecedor financeiro, mapas e push continua em aberto.

## Nova entrega

O guia exige contexto, BPMN, DFD e máquina de estados, justificativas, consistência entre os modelos e um único PDF. O resultado tem **20 páginas**, incluindo capa, orientação de leitura, 2 vistas de contexto, 6 de BPMN, 6 de DFD, 1 máquina de estados, matriz de cobertura, decisões e referências. Fontes editáveis, SVGs e gerador acompanham o PDF.

Equipe e instituição foram confirmadas pelo usuário: FECAP, Ciência da Computação, 4º semestre; Lúcio Vecchio, Gustavo Pires e Felipe Mathey. Matrículas não foram fornecidas; precisam ser incluídas antes da submissão. Não foi encontrado um modelo oficial de cabeçalho nos arquivos, portanto a capa usa identificação institucional textual.
