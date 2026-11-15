# Acordo de Nível de Serviço (SLA) e Operação — Víamos (Checklist 2026 — Fase 5)

## 1. Escopo do Serviço
Este documento estabelece a meta de disponibilidade (RNF04), os tempos de resposta (RNF02–RNF03) e o plano de contingência do Víamos na avaliação acadêmica.

## 2. Indicadores de Desempenho e Disponibilidade (SLIs / SLOs)

| Indicador | Requisito Relacionado | Meta (SLO) | Medição / Verificação |
|---|---|---|---|
| **Disponibilidade da Plataforma** | RNF04 | **≥ 99,5%** no mês (medição pendente) | `GET /api/health` para a API e consulta autenticada ao hub para disponibilidade do banco |
| **Latência de Consultas e Listagens** | RNF01 | **p95 < 500 ms** (com instância aquecida) | Consultas indexadas no PostgreSQL (`solicitacoes`, `ofertas`, `atendimentos`) |
| **Processamento de Aceite Exclusivo** | RF22 / RNF33 | **Transação atômica < 300 ms** | `UPDATE ... WHERE status = 'BUSCANDO'` + índice único no PostgreSQL |
| **Emissão de Comprovante PDF** | RF37 / RNF02 | **< 1.500 ms** | Geração em memória via `PDFKit` e entrega via stream/Blob |

## 3. Janela de Suporte e Atendimento a Incidentes

| Severidade | Descrição | Tempo de Resposta | Ação de Mitigação |
|---|---|---|---|
| **Crítica (S1)** | API ou Banco indisponíveis durante a banca/avaliação | Imediato (< 2 min) | Acionamento do ambiente local de contingência (`docker compose up -d` ou PostgreSQL embutido) pronto na máquina da equipe |
| **Alta (S2)** | Cold start da instância gratuita do Render (~50 s) | Preventivo (3 min antes da apresentação) | Aquecimento prévio via chamada a `/api/health` antes do início da demonstração |
| **Média (S3)** | Imprecisão de GPS indoor (> 50 m) no momento do check-in | Imediato (na própria tela) | Repetir a captura em um local com melhor sinal. Para o ensaio com dados fictícios, usar a simulação do servidor local de desenvolvimento |

## 4. Política de Backup e Retenção (LGPD — RF45)
- **Migrações e Seed Reproduzíveis:** o esquema completo (27 tabelas + gatilho de auditoria) é recriado deterministicamente por `npm run db:migrate` e `npm run db:seed`.
- **Trilha de Auditoria Imutável (RNF08):** registros em `eventos_auditoria` são protegidos contra alteração ou exclusão por gatilho no banco de dados.
