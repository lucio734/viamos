# Plano e Relatório de Testes — Víamos (Checklist 2026 — Fase 4 & Dossiê #48)

## 1. Objetivo e Escopo
Validar de forma automatizada e reproduzível os **45 Requisitos Funcionais (RF01–RF45)**, **45 Requisitos Não Funcionais (RNF01–RNF45)** e as **18 Decisões de Regra de Negócio (D-01 a D-18)** da plataforma **Víamos**, abrangendo:
- **Testes de Unidade (Backend & Frontend):** cálculo de distância geodésica (Haversine), validação de CPF/CNPJ, estimativa financeira, apuração de valor final, máscaras de entrada pt-BR e validadores de formulário sem *rollover* de calendário.
- **Testes de Integração — Fluxo Principal Ponta a Ponta (`backend/tests/fluxo-principal.test.ts`):** jornada completa desde cadastro, habilitação no backoffice, abertura de solicitação presencial com estimativa, distribuição por raio, aceite exclusivo, sala de atendimento, check-in por QR Code + GPS, encerramento, pagamento idempotente, emissão e verificação pública de comprovante PDF, avaliação bilateral, repasse financeiro, notificações, trilha de auditoria e direitos LGPD.
- **Testes de Exceção, Concorrência e Segurança (`backend/tests/excecoes.test.ts`):** mais de 23 cenários de fronteira e ataque (datas passadas, durações inválidas, intérprete não aprovado, fora do raio de 15 km, conflito de agenda, aceites concorrentes simultâneos `Promise.all` garantindo HTTP 409 ao segundo intérprete, QR Code forjado, GPS impreciso > 50 m ou distante > 200 m, acesso não autorizado à sala/comprovante, encerramento duplicado, pagamento recusado HTTP 402 e idempotência, bloqueio de conta após 5 falhas de login HTTP 423, imutabilidade da trilha de auditoria via gatilho PostgreSQL, rejeição de PDF falso por *magic bytes*, limite de 72 bytes do bcrypt e exigência de descrição em chamados de suporte).

---

## 2. Como Executar as Suítes de Teste

### 2.1. Backend (Vitest + Supertest + PostgreSQL real)
```bash
cd backend
npm test
```
- **Resultado verificado em 12/11/2026:** **3 arquivos / 50 testes passando (100%)** em ~8,6 s contra PostgreSQL 18.6.

### 2.2. Frontend (Node Test Runner + TypeScript)
```bash
cd frontend
npm test
npm run typecheck
npm run lint
npm run build
```
- **Resultado verificado em 12/11/2026:** **6 suítes de unidade passando (100%)** em ~200 ms; `typecheck` com **0 erros**; `lint` com **0 erros**; `build` gerando bundle de produção em `dist/` (130 módulos transformados).

---

## 3. Matriz Resumida de Casos de Teste Automatizados

| Suíte / Arquivo | Casos | Requisitos Cobertos | Status |
|---|---|---|---|
| `backend/tests/unidades.test.ts` | 9 | RF03, RF04, RF15, RF17, RF19, RF33 (Haversine, CPF/CNPJ, estimativa, cobrança, taxa de cancelamento) | ✅ 9/9 Passando |
| `backend/tests/fluxo-principal.test.ts` | 18 | RF01–RF45 ponta a ponta (cadastro → backoffice → solicitação → aceite → sala → check-in QR/GPS → encerramento → pagamento → PDF → verificação → avaliação → repasse → LGPD) | ✅ 18/18 Passando |
| `backend/tests/excecoes.test.ts` | 23 | RNF26, RNF27, RNF33, RNF35, RNF08, OWASP ASVS (concorrência no aceite 409, bloqueio de login 423, QR/GPS inválidos 422, cartão recusado 402, gatilho imutável de auditoria, *magic bytes* de upload, rollover de data) | ✅ 23/23 Passando |
| `frontend/tests/validacao-formato.test.ts` | 6 | Item #33 do Dossiê (máscaras CPF/CNPJ/telefone/CEP/cartão/validade, formatadores pt-BR, validação de CPF/CNPJ/idade/senha/certificado) | ✅ 6/6 Passando |
