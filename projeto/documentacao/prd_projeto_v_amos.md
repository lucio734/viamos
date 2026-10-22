# PRD - Projeto Víamos: Conectando o Ciclo da Acessibilidade

## 1. Visão Geral
O **Víamos** é uma plataforma desenhada para democratizar o acesso à comunicação para a comunidade surda, conectando usuários a intérpretes de Libras para atendimentos presenciais sob demanda. O foco inicial do projeto é a prestação de serviços presenciais em diversas áreas como saúde, educação, jurídico e eventos.

## 2. Objetivos
- Facilitar a contratação de intérpretes de Libras qualificados.
- Garantir a autonomia do usuário surdo em ambientes presenciais.
- Proporcionar uma ferramenta de gestão e ganhos para intérpretes profissionais.
- Gerar comprovantes de acessibilidade para conformidade legal e feedback de qualidade.

## 3. Público-Alvo
- **Usuários Surdos:** Pessoas que buscam acessibilidade comunicacional em atividades do cotidiano.
- **Intérpretes de Libras:** Profissionais certificados (ex: Prolibras) que buscam flexibilidade e novas oportunidades de trabalho.

## 4. Arquitetura de Informação (Telas Principais)

### 4.1. Fluxo Comum
- **Splash Screen:** Identidade visual e carregamento.
- **Login:** Acesso seguro para ambos os perfis.
- **Cadastro:** Fluxos distintos para Surdos (dados pessoais) e Intérpretes (certificações, especialidades e preço base).

### 4.2. Perfil do Usuário Surdo (Cliente)
- **Hub do Cliente:** Visão geral e atalhos rápidos.
- **Nova Solicitação:** Agendamento de atendimento presencial com definição de tipo, data, hora, duração e local.
- **Meus Atendimentos:** Histórico de serviços, detalhes de intérpretes e acesso a comprovantes.
- **Sala de Atendimento (Chat):** Comunicação estilo "Uber" com o intérprete alocado para coordenação do encontro presencial.
- **Minha Conta:** Gestão de perfil, pagamentos e segurança.
- **Avaliação:** Feedback pós-atendimento com estrelas e comentários.

### 4.3. Perfil do Intérprete (Profissional)
- **Hub do Intérprete:** Painel de operações com mapa de disponibilidade.
- **Gestão de Solicitações:** Visualização de demandas próximas via geolocalização, com opção de aceitar ou recusar.
- **Financeiro:** Extrato de atendimentos e repasses.

## 5. Requisitos Funcionais
- **Geolocalização:** Cálculo de distância entre intérprete e local do evento.
- **Validação de Credenciais:** Sistema de upload e verificação de certificados para intérpretes.
- **Sistema de Chat:** Troca de mensagens em tempo real para alinhamento logístico.
- **Emissão de Comprovantes:** Documento digital gerado após o checkout do atendimento.

## 6. Identidade Visual (Víamos Design System)
- **Paleta de Cores:** Foco em tons de azul escuro (#1a2e44) para confiança e seriedade, com superfícies limpas e alto contraste.
- **Tipografia:** Inter, priorizando legibilidade em dispositivos móveis.
- **Componentes:** Navegação inferior, botões de ação proeminentes (chips e CTAs fixos) e cartões de informação estruturados.

## 7. Roadmap de Design (Status Atual)
- [x] Splash Screen e Login
- [x] Fluxos de Cadastro (Surdo e Intérprete)
- [x] Hubs de Usuário e Intérprete
- [x] Fluxo de Nova Solicitação (Foco Presencial)
- [x] Sala de Atendimento (Estilo Chat)
- [x] Histórico de Atendimentos e Avaliação
- [x] Gestão de Perfil e Pagamentos
- [x] Gestão de Solicitações para Intérpretes
