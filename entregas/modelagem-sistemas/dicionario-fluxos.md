# Dicionário de processos, depósitos e fluxos

## Processos

| Processo | Responsabilidade |
| --- | --- |
| P1 | Identidade, acesso, cadastro e certificação |
| P2 | Solicitação, estimativa, distribuição, aceite, cancelamento e agenda |
| P3 | Comunicação, QR, localização, início/fim e suporte |
| P4 | Forma de pagamento, cobrança, ganhos, reserva e repasse |
| P5 | Histórico, comprovante, avaliação e reputação |
| P6 | Perfil, privacidade, auditoria e notificações |

## Depósitos persistentes

| Depósito | Conteúdo |
| --- | --- |
| D1 | Pessoas, papéis, sessão, hash de senha, certificados, análises, perfil e consentimentos |
| D2 | Solicitação, cotação, local/data, estado, raio, disponibilidade, aceite/recusa e agenda |
| D3 | Atendimento, mensagens/fotos, QR, check-in, início/fim, duração e chamados de suporte |
| D4 | Token/Pix, conta de destino, tentativas de cobrança, lançamentos, saldo reservado e repasses |
| D5 | Comprovante, código de verificação, avaliação e reputação derivada |
| D6 | Pedidos LGPD, eventos de auditoria, notificações e resultados de entrega |

São depósitos lógicos, não tabelas físicas. Repetições nas vistas representam o mesmo depósito. P1–P5 respondem a pedidos de exportação/tratamento LGPD coordenados por P6; não há acesso direto do usuário aos depósitos. A localização compartilhada é transitória; o registro do check-in não implica armazenar todo o trajeto.

## Fluxos e balanceamento

As vistas C1/C2 representam um único processo 0. Os mesmos atores e integrações aparecem nas vistas P1–P6. A subdivisão agrega/desagrega os dados das setas de contexto, sem acrescentar um ator externo. Nomes repetidos de cliente/intérprete em C1 são a mesma entidade, agrupada por assunto.

### Contexto | pessoas e operação

| Origem | Destino | Dados |
| --- | --- | --- |
| Cliente surdo — contratação | 0 Sistema Víamos  Atendimento presencial | Cadastro/acesso; solicitação; cancelamento |
| 0 Sistema Víamos  Atendimento presencial | Cliente surdo — contratação | Sessão/perfil; estimativa; status e intérprete |
| Cliente surdo — atendimento | 0 Sistema Víamos  Atendimento presencial | Mensagens/fotos; QR; avaliação; suporte |
| 0 Sistema Víamos  Atendimento presencial | Cliente surdo — atendimento | Conversa/localização; QR; histórico; PDF |
| Intérprete — contratação | 0 Sistema Víamos  Atendimento presencial | Cadastro/certificado; agenda; aceite/recusa |
| 0 Sistema Víamos  Atendimento presencial | Intérprete — contratação | Conta/sessão; análise; demandas e agenda |
| Intérprete — atendimento | 0 Sistema Víamos  Atendimento presencial | Mensagens/fotos; QR; fim; avaliação; suporte |
| 0 Sistema Víamos  Atendimento presencial | Intérprete — atendimento | Conversa/localização; check-in; histórico/PDF |
| 0 Sistema Víamos  Atendimento presencial | Backoffice | Documentação para análise; resultado registrado |
| Backoffice | 0 Sistema Víamos  Atendimento presencial | Parecer: aprovar, reprovar ou corrigir |
| 0 Sistema Víamos  Atendimento presencial | Cliente — financeiro e dados | Resultado financeiro; dados/status; avisos |
| Cliente — financeiro e dados | 0 Sistema Víamos  Atendimento presencial | Pagamento; perfil; consentimento; pedido LGPD |
| 0 Sistema Víamos  Atendimento presencial | Intérprete — financeiro e dados | Extrato/repasse; dados/status; avisos |
| Intérprete — financeiro e dados | 0 Sistema Víamos  Atendimento presencial | Ganhos/repasse; perfil; consentimento; pedido LGPD |
| 0 Sistema Víamos  Atendimento presencial | Suporte | Chamado; data, hora e localização permitida |
| Suporte | 0 Sistema Víamos  Atendimento presencial | Resposta e andamento do chamado |

### Contexto | integrações externas

| Origem | Destino | Dados |
| --- | --- | --- |
| Serviço de mapas | 0 Sistema Víamos  Mesma fronteira da vista C1 | Endereço normalizado, coordenadas e distância |
| 0 Sistema Víamos  Mesma fronteira da vista C1 | Serviço de mapas | Endereço, rota e consulta de distância |
| Gateway financeiro | 0 Sistema Víamos  Mesma fronteira da vista C1 | Token; resultado da cobrança e do repasse |
| 0 Sistema Víamos  Mesma fronteira da vista C1 | Gateway financeiro | Tokenização; cobrança Pix/cartão; repasse |
| 0 Sistema Víamos  Mesma fronteira da vista C1 | Serviço de notificações | Destinatário e conteúdo da notificação |
| Serviço de notificações | 0 Sistema Víamos  Mesma fronteira da vista C1 | Confirmação de entrega ou falha |
| 0 Sistema Víamos  Mesma fronteira da vista C1 | Serviço de e-mail | E-mail e link temporário de recuperação |
| Serviço de e-mail | 0 Sistema Víamos  Mesma fronteira da vista C1 | Resultado do envio |
| 0 Sistema Víamos  Mesma fronteira da vista C1 | Localização do dispositivo | Pedido autorizado de posição; parada |
| Localização do dispositivo | 0 Sistema Víamos  Mesma fronteira da vista C1 | Posição, precisão e instante da leitura |

### DFD | P1 — identidade, acesso e certificação

| Origem | Destino | Dados |
| --- | --- | --- |
| Cliente surdo | P1 Gerir identidade, acesso e certificação | Dados cadastrais; credenciais; recuperação |
| P1 Gerir identidade, acesso e certificação | Cliente surdo | Conta/sessão; validação; resultado do acesso |
| Intérprete de Libras | P1 Gerir identidade, acesso e certificação | Perfil, credenciais e certificado; correção |
| P1 Gerir identidade, acesso e certificação | Intérprete de Libras | Conta/sessão; resultado documental |
| Backoffice | P1 Gerir identidade, acesso e certificação | Parecer e justificativa de análise |
| P1 Gerir identidade, acesso e certificação | Backoffice | Documentação e fila para análise |
| P1 Gerir identidade, acesso e certificação | Serviço de e-mail | Endereço e link de recuperação |
| Serviço de e-mail | P1 Gerir identidade, acesso e certificação | Resultado do envio |
| P1 Gerir identidade, acesso e certificação | D1 — Pessoas, acesso e certificações | Perfil, sessão, certificado e análise atualizados |
| D1 — Pessoas, acesso e certificações | P1 Gerir identidade, acesso e certificação | Cadastro, hash de senha, sessão e parecer |
| P1 Gerir identidade, acesso e certificação | P6 — Governança e notificações | Eventos de cadastro/acesso/análise; avisos; dados exportáveis |
| P6 — Governança e notificações | P1 Gerir identidade, acesso e certificação | Pedido autorizado de dados/tratamento LGPD |

### DFD | P2 — solicitação, distribuição e agenda

| Origem | Destino | Dados |
| --- | --- | --- |
| Cliente surdo | P2 Gerir solicitações, busca e agenda | Serviço, data, duração, local; confirmação/cancelamento |
| P2 Gerir solicitações, busca e agenda | Cliente surdo | Estimativa; status; intérprete; resultado do cancelamento |
| Intérprete de Libras | P2 Gerir solicitações, busca e agenda | Raio, disponibilidade; aceite/recusa |
| P2 Gerir solicitações, busca e agenda | Intérprete de Libras | Demandas, mapa e agenda atualizada |
| Serviço de mapas | P2 Gerir solicitações, busca e agenda | Endereço, coordenadas, rotas e distâncias |
| P2 Gerir solicitações, busca e agenda | Serviço de mapas | Consulta de endereço, rota e distância |
| P6 — Governança e notificações | P2 Gerir solicitações, busca e agenda | Pedido autorizado de dados/tratamento LGPD |
| P2 Gerir solicitações, busca e agenda | P6 — Governança e notificações | Eventos de aceite/cancelamento; avisos; dados exportáveis |
| D1 — Pessoas, acesso e certificações | P2 Gerir solicitações, busca e agenda | Perfil aprovado e endereço-base |
| P2 Gerir solicitações, busca e agenda | D2 — Solicitações e agenda | Cotação; solicitação; aceite/recusa; agenda |
| D2 — Solicitações e agenda | P2 Gerir solicitações, busca e agenda | Solicitação, agenda, raio e disponibilidade |
| D5 — Comprovantes e avaliações | P2 Gerir solicitações, busca e agenda | Reputação calculada do intérprete |

### DFD | P3 — execução presencial e suporte

| Origem | Destino | Dados |
| --- | --- | --- |
| Cliente surdo | P3 Coordenar encontro e registrar atendimento | Mensagens/fotos; solicitação de QR e suporte |
| P3 Coordenar encontro e registrar atendimento | Cliente surdo | Conversa/localização; QR; status e suporte |
| Intérprete de Libras | P3 Coordenar encontro e registrar atendimento | Mensagens/fotos; leitura QR; encerramento; suporte |
| P3 Coordenar encontro e registrar atendimento | Intérprete de Libras | Conversa/localização; validação; duração real |
| Localização do dispositivo | P3 Coordenar encontro e registrar atendimento | Posição, precisão e instante da leitura |
| P3 Coordenar encontro e registrar atendimento | Localização do dispositivo | Pedido autorizado de posição; parada |
| Suporte | P3 Coordenar encontro e registrar atendimento | Resposta e situação do chamado |
| P3 Coordenar encontro e registrar atendimento | Suporte | Chamado; data, hora e localização permitida |
| D1 — Pessoas, acesso e certificações | P3 Coordenar encontro e registrar atendimento | Participantes e consentimento de localização |
| P3 Coordenar encontro e registrar atendimento | D2 — Solicitações e agenda | Estado em andamento ou concluída |
| D2 — Solicitações e agenda | P3 Coordenar encontro e registrar atendimento | Vínculo, estado, local e horário previsto |
| P3 Coordenar encontro e registrar atendimento | D3 — Atendimento e comunicação | Mensagens/fotos; QR; início/fim; duração; chamado |
| D3 — Atendimento e comunicação | P3 Coordenar encontro e registrar atendimento | Conversa; check-in; início e chamados |
| P3 Coordenar encontro e registrar atendimento | P6 — Governança e notificações | Eventos de check-in/fim; avisos de mensagens; dados exportáveis |
| P6 — Governança e notificações | P3 Coordenar encontro e registrar atendimento | Pedido autorizado de dados/tratamento LGPD |

### DFD | P4 — pagamento, ganhos e repasse

| Origem | Destino | Dados |
| --- | --- | --- |
| Cliente surdo | P4 Processar cobrança, ganhos e repasse | Meio de pagamento; autorização de cobrança |
| P4 Processar cobrança, ganhos e repasse | Cliente surdo | Token/meio cadastrado; valor e resultado |
| Intérprete de Libras | P4 Processar cobrança, ganhos e repasse | Consulta de ganhos; pedido de repasse e conta |
| P4 Processar cobrança, ganhos e repasse | Intérprete de Libras | Extrato; saldo; resultado e previsão do repasse |
| Gateway financeiro | P4 Processar cobrança, ganhos e repasse | Token; resultado de cobrança e repasse |
| P4 Processar cobrança, ganhos e repasse | Gateway financeiro | Tokenização; cobrança Pix/cartão; repasse |
| P6 — Governança e notificações | P4 Processar cobrança, ganhos e repasse | Pedido autorizado de dados/tratamento LGPD |
| P4 Processar cobrança, ganhos e repasse | P6 — Governança e notificações | Eventos financeiros e aviso de pagamento; dados exportáveis |
| D2 — Solicitações e agenda | P4 Processar cobrança, ganhos e repasse | Cotação, participantes e eventual taxa |
| D3 — Atendimento e comunicação | P4 Processar cobrança, ganhos e repasse | Início/fim, duração real e conclusão |
| P4 Processar cobrança, ganhos e repasse | D4 — Financeiro | Resultado; crédito/débito; reserva e repasse |
| D4 — Financeiro | P4 Processar cobrança, ganhos e repasse | Token/Pix; tentativas; lançamentos; conta e saldo |

### DFD | P5 — histórico, comprovante e avaliação

| Origem | Destino | Dados |
| --- | --- | --- |
| Cliente surdo | P5 Produzir histórico, comprovante e reputação | Filtros; pedido de PDF; nota 1–5 e comentário |
| P5 Produzir histórico, comprovante e reputação | Cliente surdo | Histórico, PDF verificável; avaliação registrada |
| Intérprete de Libras | P5 Produzir histórico, comprovante e reputação | Filtros; pedido de PDF; nota 1–5 e comentário |
| P5 Produzir histórico, comprovante e reputação | Intérprete de Libras | Histórico, PDF; avaliação e reputação |
| P6 — Governança e notificações | P5 Produzir histórico, comprovante e reputação | Pedido autorizado de dados/tratamento LGPD |
| P5 Produzir histórico, comprovante e reputação | P6 — Governança e notificações | Eventos de avaliação e emissão de documento; dados exportáveis |
| D4 — Financeiro | P5 Produzir histórico, comprovante e reputação | Situação financeira do atendimento |
| D1 — Pessoas, acesso e certificações | P5 Produzir histórico, comprovante e reputação | Dados e certificação do intérprete |
| D2 — Solicitações e agenda | P5 Produzir histórico, comprovante e reputação | Participantes, local, tipo e estado |
| D3 — Atendimento e comunicação | P5 Produzir histórico, comprovante e reputação | Data, início/fim e duração real |
| P5 Produzir histórico, comprovante e reputação | D5 — Comprovantes e avaliações | Comprovante; avaliação; reputação recalculada |
| D5 — Comprovantes e avaliações | P5 Produzir histórico, comprovante e reputação | PDF, código verificável, notas e reputação |

### DFD | P6 — privacidade, auditoria e notificações

| Origem | Destino | Dados |
| --- | --- | --- |
| Cliente surdo | P6 Gerir perfil, privacidade, auditoria e notificações | Perfil/preferências; consentimento; exportação/exclusão |
| P6 Gerir perfil, privacidade, auditoria e notificações | Cliente surdo | Perfil; exportação; protocolo/status; notificações |
| Intérprete de Libras | P6 Gerir perfil, privacidade, auditoria e notificações | Perfil/preferências; consentimento; exportação/exclusão |
| P6 Gerir perfil, privacidade, auditoria e notificações | Intérprete de Libras | Perfil; exportação; protocolo/status; notificações |
| P1, P2, P3, P4 e P5 Referências aos processos | P6 Gerir perfil, privacidade, auditoria e notificações | Eventos críticos; dados para aviso; dados exportáveis |
| P6 Gerir perfil, privacidade, auditoria e notificações | P1, P2, P3, P4 e P5 Referências aos processos | Pedido autorizado de dados ou tratamento LGPD |
| P6 Gerir perfil, privacidade, auditoria e notificações | Serviço de notificações | Destinatário e conteúdo da notificação |
| Serviço de notificações | P6 Gerir perfil, privacidade, auditoria e notificações | Confirmação de entrega ou falha |
| P6 Gerir perfil, privacidade, auditoria e notificações | D1 — Pessoas, acesso e certificações | Perfil e consentimentos atualizados |
| D1 — Pessoas, acesso e certificações | P6 Gerir perfil, privacidade, auditoria e notificações | Perfil, consentimentos e preferências |
| P6 Gerir perfil, privacidade, auditoria e notificações | D6 — Governança | Protocolo LGPD; eventos; notificação/status |
| D6 — Governança | P6 Gerir perfil, privacidade, auditoria e notificações | Pedidos LGPD; logs; avisos e entrega |

## Regras de consistência entre perspectivas

1. Confirmar resumo em B2 cria a solicitação em D2 e o estado Buscando intérprete em E1.
2. Aceite exclusivo em B3 vincula a agenda em D2 e produz Aceita em E1. Recusa individual permanece na busca.
3. Check-in válido em B4 grava início em D3 e Em andamento em D2/E1; erro mantém Aceita.
4. Encerramento em B4 grava fim/duração em D3 e Concluída em D2/E1; P4 pode então cobrar e P5 emitir PDF/receber avaliação.
5. Falha de cobrança em B5 altera D4, não o estado Concluída. Histórico pode mostrar estado operacional e situação financeira distintos.
6. Cancelamento permitido em B6 altera D2 e produz Cancelada em E1, gerando auditoria/notificação em P6.
7. Pagamento confirmado pode gerar crédito em D4; repasse reserva saldo e registra resultado, conforme a proposta UML anterior.
8. P5 recalcula reputação em D5; P2 lê esse valor na ordenação das próximas demandas.
