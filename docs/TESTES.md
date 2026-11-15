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
- **Resultado em 15/11/2026:** **53 de 53 casos**, em 3 arquivos, com PostgreSQL 18.6 isolado. `DATABASE_URL_TEST` é obrigatória e a preparação da suíte limpa a base apontada. As verificações em integração incluem duas ofertas sobrepostas para o mesmo intérprete, cancelamento simultâneo ao check-in e localização antes e depois do encerramento.

### 2.2. Frontend (Node Test Runner + TypeScript)
```bash
cd frontend
npm test
npm run typecheck
npm run lint
npm run build
```
- **Resultado em 15/11/2026:** **6 de 6 casos em 2 suítes**, compilação TypeScript e build Vite concluídos. O lint emitiu avisos sobre efeitos e Fast Refresh. O build avisou sobre o tamanho do bundle principal.

### 2.3. Verificação no navegador

Em 15/11/2026, duas sessões isoladas do Chrome com Playwright usaram o build de produção do frontend em preview local e a API com um banco de demonstração separado. O teste verificou login, cotação e solicitação, aceite observado sem recarga, QR manual habilitado após captura de GPS emulado, aviso da posição à contraparte e desaparecimento no encerramento, Pix simulado e resposta PDF. O login funcionou com o frontend compilado com a URL da API terminada em `/api/`. A rota de pagamento recarregou sem rolagem horizontal a 320, 768 e 1280 px.

Para repetir, prepare um banco de demonstração local e siga o [roteiro de demonstração](ROTEIRO_DEMONSTRACAO.md). Use um dispositivo no ponto escolhido para verificar câmera e GPS físicos. A validação de 15/11 usou o código alfanumérico do QR e emulação do navegador. HTTPS e comportamento nos domínios hospedados dependem do deploy.

---

## 3. Matriz Resumida de Casos de Teste Automatizados

| Suíte / Arquivo | Casos | Requisitos Cobertos | Status |
|---|---|---|---|
| `backend/tests/unidades.test.ts` | 9 | RF03, RF04, RF15, RF17, RF19, RF33 (Haversine, CPF/CNPJ, estimativa, cobrança, taxa de cancelamento) | ✅ 9/9 Passando |
| `backend/tests/fluxo-principal.test.ts` | 18 | Cadastros, backoffice, solicitação, aceite, sala, check-in QR/GPS, encerramento, pagamento, PDF, verificação pública, avaliação, repasse e LGPD | ✅ 18/18 Passando |
| `backend/tests/excecoes.test.ts` | 26 | Aceite e agenda concorrentes (RF22), cancelamento e check-in concorrentes (RF19/RF31), localização temporária (RF29/RNF44) e demais exceções da seção 1 | ✅ 26/26 Passando |
| `frontend/tests/validacao-formato.test.ts` | 6 | Item #33 do Dossiê (máscaras CPF/CNPJ/telefone/CEP/cartão/validade, formatadores pt-BR, validação de CPF/CNPJ/idade/senha/certificado) | ✅ 6/6 Passando |
