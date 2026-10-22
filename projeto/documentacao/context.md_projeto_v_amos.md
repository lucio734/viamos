# CONTEXT.MD - Projeto Víamos

## 1. Visão Geral do Projeto
O **Víamos** é uma plataforma de impacto social focada em democratizar o acesso à comunicação para a comunidade surda através da conexão direta e sob demanda com intérpretes de Libras para atendimentos **exclusivamente presenciais**.

### Propósito Central
Eliminar barreiras comunicacionais em contextos críticos do cotidiano (saúde, jurídico, educação, eventos) garantindo autonomia ao usuário surdo e profissionalismo ao intérprete.

---

## 2. Ecossistema de Usuários

### A. Usuário Surdo (Cliente)
- **Necessidade:** Contratação rápida de intérpretes qualificados para compromissos físicos.
- **Dores:** Dificuldade de encontrar profissionais disponíveis em cima da hora, falta de transparência em preços e incerteza sobre a qualificação.

### B. Intérprete de Libras (Profissional)
- **Necessidade:** Gestão de agenda, geolocalização de demandas próximas e garantia de recebimento.
- **Dores:** Ociosidade em horários específicos, dificuldade de prospecção e falta de formalização dos serviços prestados.

---

## 3. Arquitetura de Informação e Telas

O projeto conta com um fluxo completo mapeado para ambos os perfis:

### Fluxos Comuns
- **Splash Screen ({{DATA:SCREEN:SCREEN_18}}):** Identidade visual e carregamento.
- **Login ({{DATA:SCREEN:SCREEN_17}}):** Acesso simplificado.
- **Cadastro ({{DATA:SCREEN:SCREEN_13}}, {{DATA:SCREEN:SCREEN_14}}):** Fluxos segmentados com coleta de dados pessoais e profissionais (Prolibras).

### Experiência do Cliente
- **Hub do Cliente ({{DATA:SCREEN:SCREEN_15}}):** Visão geral de atendimentos e botão de ação rápida para nova solicitação.
- **Nova Solicitação ({{DATA:SCREEN:SCREEN_9}}):** Fluxo para definir tipo de serviço, data, hora, duração e local via mapa.
- **Sala de Atendimento ({{DATA:SCREEN:SCREEN_8}}):** Chat estilo Uber focado em logística e comunicação pré-encontro presencial.
- **Histórico ({{DATA:SCREEN:SCREEN_5}}):** Gestão de serviços passados e acesso a comprovantes.
- **Perfil ({{DATA:SCREEN:SCREEN_7}}):** Gestão de pagamentos (Pix/Cartão) e segurança.
- **Avaliação ({{DATA:SCREEN:SCREEN_3}}):** Feedback qualitativo pós-serviço.

### Experiência do Intérprete
- **Hub do Intérprete ({{DATA:SCREEN:SCREEN_16}}):** Painel operacional com mapa de demandas, ganhos da semana e check-in digital.
- **Gestão de Demandas ({{DATA:SCREEN:SCREEN_6}}):** Lista de solicitações próximas com raio de alcance e aceite/recusa em tempo real.

---

## 4. Identidade Visual (Víamos Design System)
Baseado no {{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}}.

- **Cor Primária:** `#1a2e44` (Azul Profundo) - Transmite confiança, seriedade e acessibilidade.
- **Tipografia:** Inter (Sans-serif) - Foco total em legibilidade em telas móveis.
- **Princípios de UI:** Alto contraste, botões de toque generosos (mínimo 44px), cartões com bordas arredondadas e hierarquia clara.
- **Shell:** Navegação inferior persistente para facilitar o uso com uma mão.

---

## 5. Regras de Negócio e Restrições Atuais
- **Foco Presencial:** Decisão estratégica de remover chamadas de vídeo em tempo real no app, priorizando o encontro físico.
- **Geolocalização:** O sistema prioriza intérpretes em um raio de até 15km da solicitação.
- **Comprovantes:** Todo atendimento gera um documento digital de "Acessibilidade Garantida" para fins legais ou corporativos.

---

## 6. Histórico de Decisões
1. **Chat Estilo Uber:** Implementado para facilitar o encontro em locais públicos/complexos.
2. **Eliminação de Vídeo:** Simplificação do MVP para focar na logística do atendimento presencial.
3. **Check-in Digital:** Uso de geolocalização e QR Code para validar o início do serviço no local.

---

Este documento serve como a "Fonte Única da Verdade" (SSOT) para o desenvolvimento e evolução do produto Víamos.