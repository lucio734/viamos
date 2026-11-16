"""
Gera o documento "Produção Técnica" do Víamos (itens #1 a #28 do checklist) no formato de Entregas/modelo_entrega.docx.

Fontes de conteúdo (todas no repositório):
  - figuras geradas do código ............ docs/producao-tecnica/figuras/        (docs/diagramas, npm run figuras)
  - diagramas das entregas anteriores .... docs/producao-tecnica/figuras-entregas/ (extrair_figuras_entregas.py)
  - capturas das telas ................... docs/producao-tecnica/telas/           (capturar_telas.mjs)
  - protótipos Stitch .................... docs/producao-tecnica/fontes/stitch/            (somente leitura)
  - link e capturas do Figma ............. docs/producao-tecnica/prototipo-figma/
  - requisitos ........................... Entregas/Engenharia de Requisitos/ENTREGA VIAMOS COMPLETA.xlsx (somente leitura)
  - dados extraídos do código ............ docs/diagramas/dados/{modelo,extracao}.json

Uso (na raiz do repositório):  python docs/producao-tecnica/build/gerar_docx.py
Saída: Entregas/Produção Técnica/Viamos_Producao_Tecnica.docx
"""
import json
import os
import sys
from pathlib import Path

import openpyxl

sys.path.insert(0, str(Path(__file__).resolve().parent))
from motor import Documento  # noqa: E402
from telas import telas  # noqa: E402

RAIZ = Path(__file__).resolve().parents[3]
PT = RAIZ / 'docs' / 'producao-tecnica'
ENTREGA = RAIZ / 'Entregas' / 'Produção Técnica'
FIG = PT / 'figuras'
FIG_ENT = PT / 'figuras-entregas'
TELAS = PT / 'telas'
STITCH = PT / 'fontes' / 'stitch'
FIGMA = PT / 'prototipo-figma'
PLANILHA = RAIZ / 'Entregas' / 'Engenharia de Requisitos' / 'ENTREGA VIAMOS COMPLETA.xlsx'
REPO = 'https://github.com/lucio734/viamos'
FIGMA_URL = os.environ.get('VIAMOS_FIGMA_URL', '').strip() or (FIGMA / 'url.txt').read_text(encoding='utf8').strip()

FONTE_IA = 'Fonte: Autoria própria apoiado por IA generativa (Claude e ChatGPT).'
FONTE_CODIGO = 'Fonte: Autoria própria apoiado por IA generativa (Claude), gerado a partir do código-fonte do Víamos.'
FONTE_TELA = 'Fonte: Autoria própria (aplicativo Víamos em execução, dados fictícios do seed).'
FONTE_STITCH = 'Fonte: Autoria própria apoiado por IA generativa (Google Stitch).'
FONTE_FIGMA = 'Fonte: Autoria própria (captura do protótipo em modo de apresentação no Figma).'
FONTE_UML = 'Fonte: Autoria própria apoiado por IA generativa (entrega de Arquitetura e UML, revisão de 07/10/2026).'
FONTE_MODELAGEM = 'Fonte: Autoria própria apoiado por IA generativa (entrega de Modelagem de Sistemas, 11/11/2026).'
FONTE_REQ = 'Fonte: Autoria própria (planilha de Engenharia de Requisitos, entrega de 02/09/2026).'


# ------------------------------------------------------------------------------------------------ dados
def carregar_json(nome):
    return json.loads((RAIZ / 'docs' / 'diagramas' / 'dados' / nome).read_text(encoding='utf8'))


def carregar_requisitos():
    wb = openpyxl.load_workbook(PLANILHA, read_only=True, data_only=True)

    def linhas(aba):
        return [[('' if c is None else str(c).strip()) for c in l] for l in wb[aba].iter_rows(values_only=True)]

    def tabela_requisitos(aba):
        saida = []
        for l in linhas(aba):
            valores = [v for v in l if v]
            if valores and valores[0][:2] in ('RF', 'RN') and valores[0][2:3].isdigit() or (valores and valores[0].startswith('RNF') and valores[0][3:4].isdigit()):
                ident, nome, categoria, _data, autor, prioridade, *descricao = valores + [''] * 7
                saida.append(dict(id=ident, nome=nome, categoria=categoria, autor=autor, prioridade=prioridade, descricao=' '.join(d for d in descricao if d)))
        return saida

    associacao, atual = {}, None
    for l in linhas('Associação RF x RNF'):
        valores = [v for v in l if v]
        if not valores:
            continue
        if valores[0].startswith('RF') and valores[0][2:].isdigit():
            atual = valores[0]
            associacao[atual] = []
        elif atual and valores[0].startswith('RNF') and ' - ' in valores[0]:
            associacao[atual].append(valores[0].split(' - ')[0])

    linear = []
    for l in linhas('Projeto Linear'):
        valores = [v for v in l if v]
        if len(valores) >= 3 and valores[0][:1].isdigit():
            linear.append(valores[:3])
    return dict(rf=tabela_requisitos('Requisitos Funcionais'), rnf=tabela_requisitos('Requisitos Não Funcionais'), associacao=associacao, linear=linear)


def contar_por(lista, chave):
    saida = {}
    for item in lista:
        saida[item[chave]] = saida.get(item[chave], 0) + 1
    return saida


# ------------------------------------------------------------------------------------------------ conteúdo
def introducao(d, ctx):
    e = ctx['extracao']['totais']
    d.capitulo('Produção Técnica')
    d.paragrafo(
        'Este capítulo apresenta a produção técnica do Víamos, plataforma web mobile-first que conecta pessoas surdas a '
        'intérpretes de Libras certificados para atendimentos presenciais: a pessoa solicita o serviço, recebe uma estimativa, '
        f'a demanda é distribuída aos intérpretes habilitados em até {ctx["R"]["RAIO_MAXIMO_KM"]} km, um deles aceita com exclusividade, os dois combinam o '
        'encontro na sala de atendimento, o intérprete faz o check-in por QR Code e GPS no local e, ao final, vêm o pagamento, o '
        'comprovante verificável e a avaliação.'
    )
    d.paragrafo(
        'Os artefatos estão organizados em cinco partes: modelagem do produto (sitemap, wireframes e prototipação), arquitetura '
        'de software (funcional, técnica e MVC), engenharia de requisitos (requisitos funcionais, não funcionais, associados e '
        'projeto linear), modelagem de processos e fluxos (macroprocesso, fluxograma e BPMN) e diagramas de software (casos de '
        'uso, classes, entidade-relacionamento, estados, operação, fluxo de dados, processos de telas, ferramenta CASE e contexto).'
    )
    d.paragrafo(
        f'Sempre que possível, as figuras foram geradas automaticamente a partir do código-fonte da aplicação ({e["rotas"]} rotas, '
        f'{e["endpoints"]} endpoints e {e["tabelas"]} tabelas lidos diretamente do repositório), o que garante que a documentação '
        'descreva o sistema que de fato roda. Os diagramas de casos de uso, classes, BPMN e fluxo de dados vêm das entregas '
        'anteriores da disciplina e são confrontados, em cada seção, com a implementação. O repositório completo está em:'
    )
    d.link('', REPO)


def modelagem_produto(d, ctx):
    R, ext = ctx['R'], ctx['extracao']
    rotas = ext['rotas']
    lista_telas = telas(R)
    d.secao('1 Modelagem do Produto')
    d.paragrafo(
        'A modelagem do produto descreve como a pessoa usuária percorre o Víamos: quais telas existem e como se ligam (sitemap), '
        'como cada tela organiza seus componentes (wireframes) e como o fluxo foi validado visualmente antes e durante a '
        'implementação (prototipação). A interface segue o design system do projeto (tokens de cor, tipografia Inter e alvos de '
        'toque de 44 px) e foi pensada primeiro para o celular, com a navegação lateral aparecendo nas telas maiores.'
    )

    # 1.1 Sitemap ----------------------------------------------------------------------------------------
    d.subsecao('1.1 Sitemap.')
    por_area = contar_por(rotas, 'area')
    d.paragrafo(
        f'O sitemap reúne as {len(rotas)} rotas da aplicação ({len({r["componente"] for r in rotas})} telas distintas, já que a sala, a '
        'avaliação e o histórico atendem tanto o cliente quanto o intérprete). Ele foi gerado a partir do arquivo '
        '`frontend/src/rotas.tsx`, o mesmo que o React Router usa para montar a navegação, e por isso espelha exatamente o que o '
        'aplicativo oferece. O mapa completo, navegável, está publicado no repositório:'
    )
    d.link('', f'{REPO}/blob/main/docs/diagramas/DIAGRAMAS_PRODUCAO_TECNICA.md#03-sitemap-completo')
    d.figura(FIG / '03-sitemap-completo.png', 'Sitemap completo do Víamos', FONTE_CODIGO)
    for area, titulo in [('publico', 'área pública'), ('cliente', 'área do cliente'), ('interprete', 'área do intérprete'), ('backoffice', 'backoffice')]:
        d.figura(FIG / f'03-sitemap-{area}.png', f'Sitemap — {titulo}', FONTE_CODIGO)
    d.itens([
        f'A área pública ({por_area.get("publico", 0)} rotas) concentra a entrada no sistema: splash, login, recuperação e redefinição de senha, escolha do perfil, os dois cadastros e a verificação pública do comprovante, acessível a qualquer pessoa pelo código impresso no PDF.',
        f'A área do cliente ({por_area.get("cliente", 0)} rotas) parte do hub e segue o ciclo do atendimento: nova solicitação, acompanhamento, ficha do atendimento, sala, pagamento e avaliação, além do histórico e do perfil.',
        f'A área do intérprete ({por_area.get("interprete", 0)} rotas) gira em torno das demandas próximas: lista e detalhe da demanda, agenda de raio e disponibilidade, ficha do atendimento com o check-in, sala, avaliação, ganhos, histórico e perfil com a habilitação.',
        f'O backoffice ({por_area.get("backoffice", 0)} rotas) atende os operadores: fila e parecer das certificações, chamados de suporte e emergência e a trilha de auditoria. As telas comuns ({por_area.get("comum", 0)} rotas: notificações e suporte) ficam disponíveis a qualquer papel autenticado.',
        'Cada área é protegida pelo papel do usuário: sem sessão o aplicativo volta ao login, e um papel que tenta abrir a área de outro é levado ao próprio hub. As setas grossas da figura completa mostram essa entrada após o login.',
    ])
    d.paragrafo('A tabela a seguir lista todas as rotas, com a tela correspondente e o acesso exigido.')
    nomes_area = {'publico': 'Pública', 'cliente': 'Cliente', 'interprete': 'Intérprete', 'backoffice': 'Backoffice', 'comum': 'Comum'}
    d.tabela('Rotas e telas do Víamos', ['Área', 'Rota', 'Tela', 'Acesso'],
             [[nomes_area[r['area']], f'`{r["path"]}`', r['nome'], ', '.join(r['papeis']) or 'público'] for r in rotas],
             FONTE_CODIGO, larguras_cm=[2.2, 5.6, 4.6, 2.6], tamanho=8)
    d.paragrafo(
        'Com o sitemap derivado do próprio roteador, não há rota documentada que não exista nem tela implementada fora do mapa; '
        'qualquer mudança em `rotas.tsx` é refletida na próxima geração das figuras.'
    )

    # 1.2 Wireframe ------------------------------------------------------------------------------------
    d.subsecao('1.2 Wireframe.')
    d.paragrafo(
        f'Os wireframes a seguir mostram, tela por tela, a estrutura de blocos de cada uma das {len(lista_telas)} telas do Víamos, '
        'capturadas do aplicativo em execução com os dados fictícios de demonstração (celular de 390 × 844 px; o backoffice, '
        'usado em computador, em 1280 × 800 px). Cada figura traz uma descrição simplificada, e a tabela ao final resume os '
        'componentes essenciais e os requisitos atendidos por tela.'
    )
    imagens = [(TELAS / f'{t["imagem"]}.png', t['nome']) for t in lista_telas]
    moveis = [i for i, t in zip(imagens, lista_telas) if not t['rotas'].startswith('/backoffice')]
    escritorio = [i for i, t in zip(imagens, lista_telas) if t['rotas'].startswith('/backoffice')]
    d.grade(moveis, FONTE_TELA, colunas=3, largura_cm=4.6)
    d.itens([f'{t["nome"]} (`{t["rotas"]}`): {t["descricao"]}' for t in lista_telas if not t['rotas'].startswith('/backoffice')][:15])
    d.itens([f'{t["nome"]} (`{t["rotas"]}`): {t["descricao"]}' for t in lista_telas if not t['rotas'].startswith('/backoffice')][15:])
    for caminho, titulo in escritorio:
        d.figura(caminho, titulo, FONTE_TELA, largura_max_cm=15)
    d.itens([f'{t["nome"]} (`{t["rotas"]}`): {t["descricao"]}' for t in lista_telas if t['rotas'].startswith('/backoffice')])
    d.paragrafo('A tabela a seguir resume os componentes essenciais de cada tela e os requisitos funcionais que ela atende.')
    d.tabela('Componentes essenciais por tela', ['Tela', 'Rota', 'Componentes essenciais', 'Requisitos'],
             [[t['nome'], f'`{t["rotas"]}`', t['componentes'], t['rf']] for t in lista_telas],
             FONTE_IA, larguras_cm=[2.8, 3.6, 6.6, 2.0], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo(
        'As telas usam componentes de carregamento, sucesso, erro e conteúdo vazio. A conferência sistemática desses '
        'estados por tela segue registrada na matriz de verificações. Os formulários aplicam máscaras em português e '
        'o servidor valida as entradas das operações da API.'
    )

    # 1.3 Prototipação ---------------------------------------------------------------------------------
    d.subsecao('1.3 Prototipação.')
    d.paragrafo(
        'O protótipo de alta fidelidade foi desenhado no Google Stitch a partir do design system do Víamos e serviu de referência '
        'visual para a implementação. A equipe exportou 14 quadros revisados do Stitch para o Figma e vinculou as telas '
        'com 13 interações de clique, organizadas em dois fluxos de apresentação.'
    )
    d.link('', FIGMA_URL, rotulo='Abrir o protótipo navegável no Figma')
    d.paragrafo('Use o menu de fluxos à esquerda para alternar entre a jornada do cliente e a do intérprete. Os dados e as mudanças de estado são demonstrativos.')
    d.itens([
        'Jornada do cliente. Em Entrar, abra o painel e clique em Solicitar intérprete agora. Avance pela definição do atendimento, pelo endereço e pela revisão do preço. Confirme para ver a busca. O cartão do acompanhamento leva ao atendimento confirmado e simula a mudança de estado após o aceite. Abra a sala pela ficha e use a seta da sala para voltar.',
        'Jornada do intérprete. No painel, abra a demanda e clique em Aceitar Atendimento Presencial para abrir o check-in. A tela ilustra a captura de GPS e a leitura do QR ou a entrada manual. Avance pelo início e pelo encerramento do atendimento. O trecho final encadeia a tela de pagamento do cliente, em modo simulado, e a tela do comprovante.',
    ])
    d.grade([
        (FIGMA / '01-hub-cliente.png', 'Painel após clicar em Entrar'),
        (FIGMA / '02-atendimento-aceito.png', 'Atendimento confirmado após a busca'),
        (FIGMA / '03-checkin.png', 'Validação de GPS e presença após o aceite'),
        (FIGMA / '04-comprovante.png', 'Comprovante após o pagamento simulado'),
    ], FONTE_FIGMA, colunas=2, largura_cm=6.9)
    d.paragrafo('As imagens a seguir registram os desenhos iniciais do Stitch e sua correspondência com as telas implementadas.')
    prototipos = [t for t in lista_telas if t['prototipo']]
    vistos, figuras_prototipo = set(), []
    for t in prototipos:
        if t['prototipo'] in vistos:
            continue
        vistos.add(t['prototipo'])
        figuras_prototipo.append((STITCH / t['prototipo'], f'Protótipo — {t["nome"]}'))
    d.grade(figuras_prototipo, FONTE_STITCH, colunas=3, largura_cm=4.4)
    d.itens([
        'As referências iniciais nas imagens cobrem login e splash, cadastros, hubs, uma versão de uma tela da nova solicitação, sala, avaliação, histórico, perfil e gestão de solicitações do intérprete.',
        'Os quadros revisados no Stitch seguem a versão implementada da jornada presencial: solicitação em três passos, acompanhamento, aceite, check-in, encerramento, pagamento simulado e emissão do comprovante.',
        'Durante a implementação, o protótipo foi corrigido onde faltavam dados exigidos pelos requisitos: telefone obrigatório e consentimentos da LGPD no cadastro, documento, raio e envio do certificado no cadastro do intérprete e a estimativa antes do envio da solicitação.',
        'O próprio aplicativo funciona como protótipo navegável do fluxo completo com as contas de demonstração, seguindo o roteiro de `docs/ROTEIRO_DEMONSTRACAO.md`.',
    ])
    d.tabela('Correspondência entre protótipo e tela implementada', ['Protótipo (Stitch)', 'Tela implementada', 'Rota'],
             [[t['prototipo'], t['nome'], f'`{t["rotas"]}`'] for t in prototipos], FONTE_IA, larguras_cm=[3.6, 5.0, 6.4], tamanho=8)
    d.paragrafo(
        'O protótipo garantiu que as decisões de layout fossem tomadas antes do código, e a correspondência registrada em '
        '`frontend/src/rotas.tsx` mantém a rastreabilidade entre o desenho e a tela que o usuário vê.'
    )


def arquitetura(d, ctx):
    ext, modelo = ctx['extracao'], ctx['modelo']
    v, h = ext['versoes'], ext['hospedagem']
    servicos = ext['backend']['servicos']
    d.secao('2 Arquitetura de Software')
    d.paragrafo(
        'A arquitetura do Víamos separa a interface, que roda no navegador, de uma API REST que concentra as regras de negócio e '
        'o acesso ao banco. A divisão em módulos funcionais, a escolha das tecnologias e a organização em Model, View e Controller '
        'foram feitas para que cada regra exista em um único lugar, seja testável de forma automatizada e possa ser publicada em '
        'serviços gratuitos com HTTPS.'
    )

    d.subsecao('2.1 Arquitetura Funcional.')
    d.paragrafo(
        f'A arquitetura funcional mostra os {len(servicos)} módulos de negócio do backend, agrupados por área, e como eles se '
        'integram. Cada módulo corresponde a um serviço em `backend/src/services`; as setas são importações reais entre serviços.'
    )
    d.figura(FIG / '07-arquitetura-funcional.png', 'Arquitetura funcional do Víamos', FONTE_CODIGO)
    d.itens([
        'A interface web conversa com o backend apenas por HTTPS e JSON. Recursos do aparelho (GPS e câmera) e o mapa do OpenStreetMap são usados diretamente pelo navegador.',
        'A contratação reúne a solicitação com a estimativa e a distribuição e as demandas com o aceite exclusivo e a agenda. Ambos usam a mesma regra de elegibilidade do intérprete (raio, disponibilidade semanal e agenda livre).',
        'A execução presencial cobre a sala, o check-in geolocalizado, o encerramento, o suporte e a avaliação; o financeiro cobre o pagamento idempotente, os ganhos, o repasse e o comprovante verificável.',
        'O acesso e cadastro cuida da autenticação, do cadastro com certificação e do perfil com os direitos da LGPD; a operação atende o backoffice. A trilha de auditoria e as notificações são serviços transversais, chamados por quase todos os módulos.',
        'O gateway de pagamento e o e-mail ficam atrás de adaptadores; no MVP ambos são simulados, e a troca por provedores reais fica restrita a esses arquivos.',
    ])
    uso = {}
    for e in ext['api']:
        controller = next((c for c in ext['backend']['controllers'] if c['nome'] == e['controller']), None)
        for nome in {x.split('.')[0] for x in (controller or {}).get('chamadas', {}).get(e['funcao'], [])}:
            uso[nome] = uso.get(nome, 0) + 1
    d.tabela('Módulos funcionais do backend', ['Serviço', 'Requisitos declarados', 'Endpoints', 'Depende de'],
             [[f'`{s["nome"]}.service.ts`', ', '.join(s['requisitos']) or '—', str(uso.get(s['nome'], 0)), ', '.join(s['dependeDe']) or '—'] for s in servicos],
             FONTE_CODIGO, larguras_cm=[4.2, 4.8, 1.8, 4.2], tamanho=8)
    d.paragrafo('Cada requisito funcional tem um módulo responsável, e as dependências entre módulos são poucas e explícitas, o que facilita testar e evoluir cada parte isoladamente.')

    d.subsecao('2.2 Arquitetura Técnica.')
    d.paragrafo('A arquitetura técnica detalha onde cada parte é executada, por quais protocolos e portas as partes se comunicam e quais tecnologias as compõem.')
    d.figura(FIG / '08-arquitetura-tecnica.png', 'Arquitetura técnica e hospedagem', FONTE_CODIGO)
    d.itens([
        f'O frontend é uma SPA em React {v["frontend"]["react"].split(".")[0]} compilada pelo Vite e servida como arquivos estáticos pela CDN da Vercel, com a regra de reescrita que faz qualquer rota abrir o aplicativo (recarregar `/cliente/historico` não dá erro 404).',
        f'A API é um serviço Node.js com Express {v["backend"]["express"]} no Render ({h["render"]["servico"]}), com Helmet, CORS restrito, limite de tentativas, sessão JWT revogável e validação Zod em todas as entradas. O health check fica em `{h["render"]["health"]}`.',
        'O PostgreSQL gerenciado está hospedado no Render. A API usa consultas parametrizadas pelo Drizzle ORM e aplica as migrações SQL versionadas no repositório.',
        f'O GitHub Actions executa, a cada envio para a `main`, typecheck, testes (com PostgreSQL {h["ci"]["imagemPostgres"].split(":")[1].split("-")[0]} de serviço), lint, build e a verificação de que os diagramas estão em dia com o código.',
    ])
    b, f = v['backend'], v['frontend']
    d.tabela('Tecnologias por camada', ['Camada', 'Tecnologia', 'Versão', 'Função no Víamos'], [
        ['Apresentação', 'React + React Router', f'{f["react"]} / {f["react-router-dom"]}', 'SPA, rotas do sitemap e proteção por papel'],
        ['Apresentação', 'Vite + Tailwind CSS', f'{f["vite"]} / {f["tailwindcss"]}', 'Build e estilos com os tokens do design system'],
        ['Apresentação', 'Leaflet, qrcode.react, html5-qrcode', f'{f["leaflet"]} / {f["qrcode.react"]} / {f["html5-qrcode"]}', 'Mapa, exibição e leitura do QR Code'],
        ['Aplicação', 'Node.js + Express', f'{ext["versoes"]["node"]} / {b["express"]}', 'API REST em camadas MVC'],
        ['Aplicação', 'Zod, jsonwebtoken, bcryptjs', f'{b["zod"]} / {b["jsonwebtoken"]} / {b["bcryptjs"]}', 'Validação de entrada, sessão JWT e hash de senha'],
        ['Aplicação', 'Helmet, CORS, express-rate-limit', f'{b["helmet"]} / {b["cors"]} / {b["express-rate-limit"]}', 'Cabeçalhos de segurança, origens permitidas e limite de tentativas'],
        ['Aplicação', 'PDFKit', b['pdfkit'], 'Comprovante de atendimento em PDF'],
        ['Persistência', 'PostgreSQL + Drizzle ORM + pg', f'16/18 / {b["drizzle-orm"]} / {b["pg"]}', f'{modelo["totais"]["tabelas"]} tabelas, consultas parametrizadas, migrações versionadas'],
        ['Qualidade', 'TypeScript, Vitest, Supertest, Oxlint', f'{b["typescript"]} / {b["vitest"]} / {b["supertest"]} / {f["oxlint"]}', 'Tipagem, testes de API contra banco real e análise estática'],
    ], FONTE_CODIGO, larguras_cm=[2.4, 4.4, 3.4, 4.8], tamanho=8, primeira_coluna_italico=True)
    d.tabela('Servidores, protocolos e portas', ['Componente', 'Onde roda', 'Protocolo e porta', 'Configuração'], [
        ['SPA (estáticos)', 'Vercel (CDN)', 'HTTPS 443', f'`frontend/vercel.json` — reescrita `{h["vercel"]["rewrite"]["source"]}`'],
        ['API REST', f'Render, web service {h["render"]["runtime"]} (plano {h["render"]["plano"]})', 'HTTPS 443', f'`render.yaml` — build `{h["render"]["build"]}`, start `{h["render"]["start"]}`'],
        ['Banco de dados', 'PostgreSQL gerenciado', 'TCP 5432 com TLS', 'variável `DATABASE_URL`'],
        ['Mapa e busca de endereço', 'OpenStreetMap e Nominatim', 'HTTPS 443 (navegador)', '`frontend/src/components/Mapa.tsx`'],
        ['Integração contínua', 'GitHub Actions', '—', f'`.github/workflows/ci.yml` (Node {h["ci"]["node"]})'],
        ['Desenvolvimento local', 'Vite, Node e Docker', f'HTTP {h["local"]["portaVite"]}, {h["local"]["portaApi"]} e TCP {h["local"]["portaBanco"]}', f'proxy de `/api` para {h["local"]["proxy"]}; `docker-compose.yml`'],
    ], FONTE_CODIGO, larguras_cm=[3.0, 3.8, 3.0, 5.2], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('Toda a pilha usa planos gratuitos com HTTPS automático, e as versões citadas são as instaladas pelos arquivos de bloqueio do repositório, o que torna o ambiente reproduzível.')

    d.subsecao('2.3 Arquitetura MVC.')
    d.paragrafo('A arquitetura MVC mostra como o código do backend se distribui entre Model, View e Controller e em qual ambiente de hospedagem cada camada é publicada.')
    d.figura(FIG / '09-arquitetura-mvc.png', 'Arquitetura MVC e ambiente de hospedagem', FONTE_CODIGO)
    c = ext['backend']['camadas']
    d.itens([
        f'Model: `backend/src/models` define as {modelo["totais"]["tabelas"]} tabelas no Drizzle ORM e a conexão com o PostgreSQL; nenhuma outra camada escreve SQL à mão.',
        f'Controller: os {len(c["controllers"])} arquivos de `backend/src/controllers` recebem a requisição já autenticada e validada pelos middlewares, chamam o serviço e escolhem o status HTTP.',
        'View: no servidor, `backend/src/views` monta as respostas JSON e o PDF do comprovante; no cliente, a SPA React é a camada de apresentação, publicada separadamente na Vercel.',
        f'Entre Controller e Model ficam os {len(c["services"])} serviços com as regras de negócio e as transações, para que nenhuma regra fique na rota ou na tela. Rotas e middlewares (autenticação, papel, validação e erros) formam a entrada da API no Render.',
    ])
    d.tabela('Camadas MVC, pastas e hospedagem', ['Camada', 'Pasta', 'Responsabilidade', 'Hospedagem'], [
        ['Model', '`backend/src/models`', 'Esquema das tabelas, relações e conexão', 'Render (API) + PostgreSQL gerenciado'],
        ['Controller', '`backend/src/controllers`', 'Entrada HTTP, esquemas Zod, status de resposta', 'Render (API)'],
        ['View (servidor)', '`backend/src/views`', 'Apresentação em JSON e PDF do comprovante', 'Render (API)'],
        ['View (cliente)', '`frontend/src`', 'Telas, componentes e cliente HTTP', 'Vercel (CDN)'],
        ['Regras de negócio', '`backend/src/services`', 'Regras, transações e integrações', 'Render (API)'],
        ['Entrada da API', '`backend/src/routes` e `middlewares`', 'Mapa de rotas, JWT, papel, validação e erros', 'Render (API)'],
    ], FONTE_CODIGO, larguras_cm=[2.6, 4.2, 4.6, 3.6], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('Com essa separação, a interface pode ser trocada ou republicada sem tocar nas regras, e as regras são testadas pela API, sem depender do navegador.')


def requisitos(d, ctx):
    req = ctx['requisitos']
    d.secao('3 Engenharia de Requisitos')
    d.paragrafo(
        f'A engenharia de requisitos define o escopo contratado do Víamos: {len(req["rf"])} requisitos funcionais, que dizem o que o '
        f'sistema faz, e {len(req["rnf"])} requisitos não funcionais, que dizem com que qualidade ele faz. As tabelas desta seção '
        'são lidas diretamente da planilha entregue em 02/09, a mesma usada como critério de aceite de cada tela e endpoint; a '
        'associação entre os dois tipos e o projeto linear completam a rastreabilidade.'
    )
    d.subsecao('3.1 Requisitos Funcionais.')
    d.paragrafo('A tabela a seguir descreve cada requisito funcional com o identificador, o nome, a categoria, a prioridade e o comportamento esperado.')
    d.tabela('Requisitos funcionais', ['ID', 'Nome', 'Categoria', 'Prioridade', 'Descrição'],
             [[r['id'], r['nome'], r['categoria'], r['prioridade'], r['descricao']] for r in req['rf']],
             FONTE_REQ, larguras_cm=[1.2, 3.0, 2.2, 1.8, 6.8], tamanho=7.5)
    prioridades = contar_por(req['rf'], 'prioridade')
    d.paragrafo('Distribuição por prioridade: ' + ', '.join(f'{k} ({n})' for k, n in sorted(prioridades.items(), key=lambda x: -x[1])) + '. Todos os requisitos funcionais têm endpoint na API e tela correspondente.')

    d.subsecao('3.2 Requisitos Não Funcionais.')
    d.paragrafo('A tabela a seguir descreve os requisitos não funcionais: desempenho, segurança, usabilidade, acessibilidade, disponibilidade e conformidade.')
    d.tabela('Requisitos não funcionais', ['ID', 'Nome', 'Categoria', 'Prioridade', 'Descrição'],
             [[r['id'], r['nome'], r['categoria'], r['prioridade'], r['descricao']] for r in req['rnf']],
             FONTE_REQ, larguras_cm=[1.3, 3.0, 2.2, 1.8, 6.7], tamanho=7.5)
    categorias = contar_por(req['rnf'], 'categoria')
    d.paragrafo('Distribuição por categoria: ' + ', '.join(f'{k} ({n})' for k, n in sorted(categorias.items(), key=lambda x: -x[1])) + '.')

    d.subsecao('3.3 Requisitos Associados.')
    d.paragrafo('A associação liga cada requisito funcional aos requisitos não funcionais que restringem sua implementação, formando a matriz de rastreabilidade usada na revisão de cada entrega.')
    nomes = {r['id']: r['nome'] for r in req['rf']}
    d.tabela('Requisitos funcionais e não funcionais associados', ['RF', 'Nome', 'RNF associados'],
             [[rf, nomes.get(rf, ''), ', '.join(rnfs)] for rf, rnfs in req['associacao'].items()],
             FONTE_REQ, larguras_cm=[1.4, 5.2, 8.4], tamanho=8)
    total = sum(len(v) for v in req['associacao'].values())
    d.paragrafo(f'São {total} associações no total; nenhum requisito funcional fica sem pelo menos uma restrição de qualidade associada.')

    d.subsecao('3.4 Projeto Linear.')
    d.paragrafo('O projeto linear encadeia as áreas e telas do sistema na ordem em que a pessoa usuária as percorre, indicando os requisitos que cada uma materializa; ele orientou a ordem de construção das telas.')
    d.tabela('Projeto linear do Víamos', ['Código', 'Área do sistema', 'Requisitos'], req['linear'], FONTE_REQ, larguras_cm=[1.6, 6.4, 7.0], tamanho=8)
    d.paragrafo(f'Os {len(req["linear"])} itens do projeto linear correspondem às telas e estados implementados, conferidos no sitemap da seção 1.1.')


def processos(d, ctx):
    R = ctx['R']
    d.secao('4 Modelagem de Processos e Fluxos')
    d.paragrafo(
        'A modelagem de processos descreve o negócio que o Víamos apoia, do nível mais amplo ao mais detalhado: o macroprocesso '
        'mostra a cadeia de valor do atendimento presencial; o fluxograma detalha os pontos de decisão do fluxo principal com as '
        'mesmas regras e códigos de erro da implementação; e o BPMN da entrega de modelagem separa as responsabilidades de cada '
        'participante em raias.'
    )
    d.subsecao('4.1 Macroprocesso.')
    d.paragrafo('O macroprocesso organiza o Víamos em processos primários, que entregam valor diretamente à pessoa surda, apoiados por processos de gestão e de apoio.')
    d.figura(FIG / '16-macroprocesso.png', 'Macroprocesso do atendimento presencial', FONTE_CODIGO)
    d.itens([
        'A cadeia de valor começa na necessidade de mediação presencial em Libras e termina no atendimento comprovado e auditável, passando por sete processos primários.',
        f'Os números do diagrama vêm do arquivo de regras da aplicação: duração mínima de {R["DURACAO_MINIMA_MIN"]} min, raio de até {R["RAIO_MAXIMO_KM"]} km, check-in a até {R["CHECKIN_DISTANCIA_MAXIMA_M"]} m do local e taxa da plataforma de {int(R["PRECO"]["TAXA_PLATAFORMA_PERCENTUAL"] * 100)}%.',
        'A habilitação de intérpretes pelo backoffice é um processo de gestão que condiciona a distribuição: só intérprete aprovado recebe e aceita demandas. A auditoria e a privacidade acompanham todas as etapas.',
        'Notificações, suporte e emergência, gateway de pagamento, mapa e geolocalização, histórico e perfil são processos de apoio, indicados com as etapas que sustentam.',
    ])
    d.tabela('Processos primários do macroprocesso', ['Processo', 'Requisitos', 'Entrada', 'Saída'], [
        ['1. Cadastro e acesso', 'RF01–RF04, RF07–RF09', 'Dados pessoais ou profissionais e credenciais', 'Conta, consentimentos e sessão'],
        ['2. Solicitação e estimativa', 'RF10–RF16', 'Serviço, data, duração e local', 'Solicitação com cotação'],
        ['3. Distribuição e aceite', 'RF17, RF20–RF25', 'Solicitação e intérpretes elegíveis', 'Atendimento agendado com QR'],
        ['4. Encontro e check-in', 'RF28–RF32', 'QR do cliente e posição do intérprete', 'Atendimento em andamento'],
        ['5. Atendimento e encerramento', 'RF33', 'Início real e confirmação de fim', 'Duração real e valor final'],
        ['6. Pagamento e comprovante', 'RF35–RF38', 'Forma de pagamento e valor', 'Pagamento, crédito e comprovante'],
        ['7. Avaliação e repasse', 'RF26, RF27, RF40, RF41', 'Notas e pedido de repasse', 'Reputação e transferência do saldo'],
    ], FONTE_IA, larguras_cm=[3.6, 3.2, 4.2, 4.0], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('O macroprocesso fixa o escopo de cada módulo: cada processo primário corresponde a um grupo de serviços da arquitetura funcional.')

    d.subsecao('4.2 Fluxograma.')
    d.paragrafo('O fluxograma do atendimento foi dividido em quatro partes para caber na página. Os pontos de decisão aparecem na mesma ordem em que o código os avalia, e as caixas tracejadas são as respostas de erro da API.')
    partes = [('17-fluxograma-1-solicitacao-e-estimativa', 'parte 1: solicitação, estimativa e distribuição'), ('17-fluxograma-2-resposta-e-aceite', 'parte 2: resposta dos intérpretes, cancelamento e aceite'),
              ('17-fluxograma-3-encontro-e-checkin', 'parte 3: encontro presencial e check-in'), ('17-fluxograma-4-pagamento-e-avaliacao', 'parte 4: encerramento, pagamento e avaliação')]
    for nome, titulo in partes:
        d.figura(FIG / f'{nome}.png', f'Fluxograma do atendimento — {titulo}', FONTE_CODIGO)
    d.itens([
        f'Parte 1: os dados são validados (duração de {R["DURACAO_MINIMA_MIN"] // 60} h a {R["DURACAO_MAXIMA_MIN"] // 60} h, em blocos de {R["DURACAO_BLOCO_MIN"]} min, e horário futuro), a estimativa é calculada e, com a confirmação, a demanda é distribuída aos intérpretes elegíveis. Sem nenhum elegível, a solicitação continua em busca e é oferecida a quem ficar elegível depois.',
        f'Parte 2: a recusa vale só para o intérprete que recusou; o cancelamento aplica taxa de {int(R["CANCELAMENTO"]["PERCENTUAL_TAXA"] * 100)}% quando a solicitação já foi aceita e faltam menos de {R["CANCELAMENTO"]["JANELA_SEM_TAXA_HORAS"]} h; o aceite confere habilitação, estado, horário, raio, grade semanal e agenda e é exclusivo.',
        f'Parte 3: a tela só libera a leitura do QR depois da captura da posição; o servidor confere o código, a janela de {R["CHECKIN_ANTECEDENCIA_MIN"]} min, a precisão de até {R["CHECKIN_PRECISAO_MAXIMA_M"]} m e a distância de até {R["CHECKIN_DISTANCIA_MAXIMA_M"]} m.',
        'Parte 4: o encerramento calcula o valor final; o pagamento é idempotente e a recusa do gateway permite outra tentativa; com a aprovação vêm o crédito ao intérprete, o comprovante, a avaliação e o repasse.',
    ])
    d.tabela('Decisões do fluxograma e respostas da API', ['Parte', 'Decisão', 'Resposta quando falha'], [
        ['1', 'Dados válidos e horário futuro?', '400 VALIDACAO, 422 DURACAO_BLOCO ou DATA_PASSADA'],
        ['1', 'Algum intérprete elegível?', 'Continua BUSCANDO (nova distribuição)'],
        ['2', 'Cancelamento com taxa?', 'Taxa exibida antes da confirmação'],
        ['2', 'Aceite válido?', '403, 409 DEMANDA_INDISPONIVEL ou AGENDA_CONFLITANTE, 422 DEMANDA_EXPIRADA, FORA_DO_RAIO ou FORA_DA_DISPONIBILIDADE'],
        ['3', 'Código, janela, precisão e distância?', '422 QR_INVALIDO, FORA_DA_JANELA, PRECISAO_INSUFICIENTE ou FORA_DO_LOCAL'],
        ['4', 'Já pago? Gateway aprova?', '200 repetido (sem nova cobrança) ou 402 PAGAMENTO_RECUSADO'],
    ], FONTE_CODIGO, larguras_cm=[1.4, 5.0, 8.6], tamanho=8)
    d.paragrafo('Como o fluxograma cita as funções, os códigos de erro e os parâmetros do código, a geração das figuras falha se alguma regra mudar sem que o diagrama acompanhe.')

    d.subsecao('4.3 BPMN.')
    d.paragrafo('Os diagramas BPMN da entrega de modelagem de 11/11 descrevem os processos de negócio com raias de responsabilidade, eventos, tarefas e gateways.')
    bpmn = [('bpmn-1-habilitacao-profissional', 'habilitação profissional'), ('bpmn-2-criar-e-confirmar-solicitacao', 'criar e confirmar solicitação'),
            ('bpmn-3-distribuir-e-aceite-exclusivo', 'distribuir e obter aceite exclusivo'), ('bpmn-4-encontro-checkin-e-encerramento', 'encontro, check-in e encerramento'),
            ('bpmn-5-cobranca-e-falha', 'cobrança e tratamento de falha'), ('bpmn-6-cancelamento', 'cancelamento solicitado pelo cliente')]
    for nome, titulo in bpmn:
        d.figura(FIG_ENT / f'{nome}.png', f'BPMN — {titulo}', FONTE_MODELAGEM)
    d.itens([
        'Habilitação profissional: o intérprete envia cadastro e certificação, o Víamos registra o perfil em análise e o backoffice decide; correção devolve ao envio, reprovação encerra a análise sem habilitar. Na aplicação, o reenvio volta a habilitação para "em análise".',
        'Criar e confirmar solicitação: a estimativa antecede a confirmação, e dados inválidos voltam ao preenchimento; a desistência antes da confirmação não cria registro, exatamente como no assistente de três passos.',
        f'Distribuir e obter aceite exclusivo: a elegibilidade exige aprovação, disponibilidade e raio de até {R["RAIO_MAXIMO_KM"]} km; sem elegíveis, a busca espera uma mudança de disponibilidade. A aplicação implementa essa espera como nova distribuição quando o intérprete fica online ou muda raio ou agenda.',
        f'Encontro, check-in e encerramento: o cliente exibe o QR e o intérprete o lê no local; distância de até {R["CHECKIN_DISTANCIA_MAXIMA_M"]} m e precisão de até {R["CHECKIN_PRECISAO_MAXIMA_M"]} m impedem o início indevido, e a falha mantém o atendimento aceito.',
        'Cobrança e tratamento de falha: requisição e retorno do gateway são fluxos de mensagem; a aprovação gera crédito uma única vez e a falha permite nova tentativa. Na aplicação, chamadas simultâneas são serializadas para que o gateway seja acionado uma vez.',
        'Cancelamento: o sistema revalida estado, prazo e autorização de forma atômica para não disputar com o check-in; na aplicação, cancelamento e check-in bloqueiam a solicitação na mesma ordem.',
    ])
    d.tabela('Processos BPMN e implementação correspondente', ['Processo BPMN', 'Raias', 'Implementação'], [
        ['Habilitação profissional', 'Intérprete, Víamos, Backoffice', '`cadastro.service`, `backoffice.service` (parecer e reenvio)'],
        ['Criar e confirmar solicitação', 'Cliente, Víamos', '`solicitacao.service` (estimativa e criação)'],
        ['Distribuir e aceite exclusivo', 'Víamos, Intérprete', '`solicitacao.service` (distribuição), `demanda.service` (aceite, recusa, nova distribuição)'],
        ['Encontro, check-in e encerramento', 'Cliente, Intérprete, Víamos', '`atendimento.service` (check-in e encerramento)'],
        ['Cobrança e falha', 'Cliente, Víamos (gateway como pool externo)', '`pagamento.service`, `gateway.service`'],
        ['Cancelamento', 'Cliente, Víamos', '`solicitacao.service` (cancelamento com política)'],
    ], FONTE_IA, larguras_cm=[4.0, 4.4, 6.6], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('Os seis processos BPMN têm implementação direta nos serviços. No BPMN histórico, o encerramento libera o comprovante. Na versão entregue, o encerramento abre a cobrança e o comprovante é emitido após a confirmação do pagamento simulado, conforme a decisão D-10 confirmada em 16/11.')


def diagramas(d, ctx):
    R, modelo, ext = ctx['R'], ctx['modelo'], ctx['extracao']
    lista_telas = telas(R)
    d.secao('5 Diagramas e Modelagem de Software')
    d.paragrafo(
        'Esta seção reúne os modelos lógicos e estruturais do Víamos. Os casos de uso e as classes vêm da entrega de arquitetura '
        'e UML; o diagrama entidade-relacionamento, as máquinas de estado, os diagramas de operação, os processos de telas, a '
        'ferramenta CASE e o diagrama de contexto foram gerados do código; o fluxo de dados vem da entrega de modelagem. Para cada '
        'modelo herdado, as diferenças em relação à implementação são registradas.'
    )

    # 5.1 Casos de uso -------------------------------------------------------------------------------
    d.subsecao('5.1 Diagrama de Caso de Uso.')
    d.paragrafo('Os casos de uso foram modelados por módulo, com os atores fora da fronteira do sistema e as relações de inclusão e extensão. A primeira figura mostra a jornada principal; as demais detalham cada módulo.')
    ucs = [('uc-0-jornada-principal', 'jornada principal'), ('uc-1-cadastro-e-habilitacao', 'cadastro e habilitação (UC01–UC03, UC34)'), ('uc-2-acesso-a-plataforma', 'acesso à plataforma (UC04–UC06, UC33)'),
           ('uc-3-solicitacao-de-interprete', 'solicitação de intérprete (UC09–UC13)'), ('uc-4-demandas-e-disponibilidade', 'demandas e disponibilidade (UC14–UC17)'),
           ('uc-5-comunicacao-e-suporte', 'comunicação e suporte (UC18–UC20, UC24)'), ('uc-6-checkin-e-encerramento', 'check-in e encerramento (UC21–UC23)'),
           ('uc-7-pagamento-e-ganhos', 'pagamento e ganhos (UC25, UC26, UC30, UC31)'), ('uc-8-historico-e-pos-atendimento', 'histórico e pós-atendimento (UC27–UC29)'),
           ('uc-9-perfil-privacidade-e-notificacoes', 'perfil, privacidade e notificações (UC07, UC08, UC32)')]
    for nome, titulo in ucs:
        d.figura(FIG_ENT / f'{nome}.png', f'Casos de uso — {titulo}', FONTE_UML)
    d.itens([
        'Os atores humanos são o cliente surdo, o intérprete de Libras, o backoffice e o suporte; os serviços de mapas, de notificações, o gateway financeiro e a localização do dispositivo aparecem como atores externos.',
        'Solicitar intérprete inclui calcular a estimativa e distribuir a solicitação; realizar o check-in inclui validar a posição; enviar a foto do encontro estende a conversa na sala; validar o segundo fator estende o acesso.',
        'Dos 34 casos de uso do catálogo, todos têm tela ou serviço correspondente, com exceção do segundo fator de autenticação (UC33), que ficou reservado: o campo existe no banco, mas o fluxo não foi implementado no MVP.',
    ])
    d.paragrafo('As tabelas a seguir descrevem, para cada tela, o caso de uso que ela realiza: atores, requisitos, pré-condições, fluxo principal, fluxos alternativos e exceções (com os códigos devolvidos pela API) e pós-condição.')
    for t in lista_telas:
        d.ficha(f'Caso de uso da tela {t["nome"]}', [
            ('Tela e rota', f'{t["nome"]} — `{t["rotas"]}`'),
            ('Caso de uso', t['uc']),
            ('Atores', t['atores']),
            ('Requisitos', t['rf']),
            ('Pré-condições', t['pre']),
            ('Fluxo principal', t['fluxo']),
            ('Alternativos e exceções', t['excecoes']),
            ('Pós-condição', t['pos']),
        ], FONTE_IA)
    d.paragrafo('Com uma tabela por tela, cada caso de uso fica ligado à interface que o realiza e aos códigos de erro que a API devolve, o que também orientou os testes de exceção.')

    # 5.2 Classes ------------------------------------------------------------------------------------
    d.subsecao('5.2 Diagrama de Classe.')
    d.paragrafo('O diagrama de classes do modelo de análise apresenta as entidades do domínio com atributos, métodos e relacionamentos (herança, composição e multiplicidades). A primeira figura mostra a estrutura principal; as demais detalham cada módulo.')
    classes = sorted(p.stem for p in FIG_ENT.glob('classes-*.png'))
    for nome in classes:
        titulo = nome.split('-', 2)[-1].replace('-', ' ')
        d.figura(FIG_ENT / f'{nome}.png', f'Classes — {titulo}', FONTE_UML)
    d.itens([
        'Usuário é a superclasse de Cliente e Intérprete; Operador é representado no banco como um papel do usuário (BACKOFFICE ou SUPORTE), porque não tem atributos próprios no MVP.',
        'Solicitação, Cotação, Oferta e Atendimento formam o núcleo da contratação; CheckIn, Mensagem, LocalizaçãoCompartilhada e ChamadoSuporte, a execução; Pagamento, LançamentoFinanceiro, ContaBancária e Repasse, o financeiro.',
        'Os métodos do modelo viraram funções dos serviços (por exemplo, `aceitarDemanda`, `realizarCheckin`, `processarPagamento`), e os atributos viraram colunas do esquema, conferidas no DER da seção 5.3.',
    ])
    d.tabela('Diferenças entre o modelo de classes e a implementação', ['Modelo de análise', 'Implementação', 'Justificativa'], [
        ['Classe Local separada', 'Endereço, complemento, referência e coordenadas em `solicitacoes`', 'Relação 1:1 obrigatória; evita junção em toda listagem'],
        ['Classe Credencial', 'Tentativas, bloqueio e segundo fator em `usuarios`', 'Relação 1:1 obrigatória; segundo fator reservado'],
        ['Classe Operador', 'Papel BACKOFFICE ou SUPORTE em `usuarios`', 'Sem atributos próprios no MVP'],
        ['Classe Carteira com saldo', 'Saldo somado de `lancamentos_financeiros`', 'Evita divergência entre saldo guardado e lançamentos'],
        ['CheckIn/QRCode com métodos', 'Tabela `checkins` (1:1) e regras em `atendimento.service`', 'Mesmo conceito; métodos como funções de serviço'],
        ['Oferta sem distância', '`ofertas.distancia_km`', 'Necessária para ordenar por proximidade (RF17)'],
    ], FONTE_IA, larguras_cm=[3.8, 5.6, 5.6], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('As diferenças são simplificações de persistência que preservam os conceitos do modelo, e todas estão documentadas para a banca.')

    # 5.3 DER -----------------------------------------------------------------------------------------
    t = modelo['totais']
    d.subsecao('5.3 Diagrama de Entidade-Relacionamento.')
    d.paragrafo(
        f'O DER foi gerado diretamente do esquema do banco (`backend/src/models/schema.ts`): {t["tabelas"]} tabelas, {t["colunas"]} colunas, '
        f'{t["chavesEstrangeiras"]} chaves estrangeiras e {t["enums"]} tipos enumerados. A visão geral mostra as entidades e os relacionamentos; '
        'as visões por domínio trazem os atributos com chaves primárias, estrangeiras e únicas.'
    )
    d.figura(FIG / '22-der-visao-geral.png', 'DER — visão geral', FONTE_CODIGO)
    for p in sorted(FIG.glob('22-der-[0-9]*.png')):
        titulo = p.stem.split('-', 3)[-1].replace('-', ' ')
        d.figura(p, f'DER — {titulo}', FONTE_CODIGO)
    d.itens([
        'Notação pé-de-galinha: linha contínua indica relacionamento identificador (a chave estrangeira compõe a chave primária da tabela filha, como `clientes` e `interpretes` em relação a `usuarios`); linha tracejada, relacionamento não identificador; o círculo indica opcionalidade.',
        'A unicidade de `atendimentos.solicitacao_id` garante que uma solicitação gere no máximo um atendimento (aceite exclusivo), e o índice único parcial de `pagamentos` permite um único pagamento PAGO por atendimento (idempotência).',
        'Restrições CHECK protegem as regras no próprio banco: raio de 1 a 15 km, duração mínima de 60 min, nota de 1 a 5, autor diferente do avaliado e lançamento financeiro originado de pagamento ou de repasse, nunca dos dois.',
        'A trilha de auditoria é imutável: um gatilho no PostgreSQL impede alteração e exclusão de eventos registrados.',
    ])
    secao_por_tabela = {tb['nome']: tb['secao'] for tb in modelo['tabelas']}
    d.tabela('Tabelas do banco por domínio', ['Tabela', 'Domínio', 'Colunas', 'Referencia'],
             [[f'`{tb["nome"]}`', secao_por_tabela[tb['nome']].split(' (')[0], str(len(tb['colunas'])), ', '.join(sorted({fk['tabelaReferenciada'] for fk in tb['chavesEstrangeiras']})) or '—'] for tb in modelo['tabelas']],
             FONTE_CODIGO, larguras_cm=[4.2, 4.4, 1.6, 4.8], tamanho=8)
    d.paragrafo('O dicionário de dados completo, com tipos, obrigatoriedade, valores padrão e índices de cada coluna, é gerado junto com o DER em `docs/producao-tecnica/tabelas/dicionario-de-dados.md`, e o CI acusa qualquer divergência entre o DER documentado e o banco.')

    # 5.4 Estados ------------------------------------------------------------------------------------
    d.subsecao('5.4 Diagrama de Estado de Máquina.')
    d.paragrafo('As máquinas de estado mostram o ciclo de vida das entidades principais, com as transições rotuladas pela função que as executa. Os estados são os valores dos enums do banco.')
    for p in sorted(FIG.glob('23-estados-*.png')):
        d.figura(p, f'Máquina de estados — {p.stem.split("-", 3)[-1]}', FONTE_CODIGO)
    d.figura(FIG_ENT / 'estados-solicitacao-e-atendimento.png', 'Máquina de estados da entrega de modelagem — solicitação e atendimento associado', FONTE_MODELAGEM)
    d.itens([
        'A solicitação nasce em BUSCANDO, passa a ACEITA com o aceite exclusivo, a EM_ANDAMENTO com o check-in e a CONCLUÍDA com o encerramento; pode ser CANCELADA antes do check-in.',
        'O atendimento é criado AGENDADO no aceite, vai a EM_ANDAMENTO no check-in e a CONCLUÍDO no encerramento, ou é CANCELADO junto com a solicitação.',
        'O pagamento nasce PENDENTE no encerramento e vai a PAGO ou FALHOU conforme o gateway; uma nova tentativa sai de FALHOU. O valor ESTORNADO existe no enum, mas não tem transição no MVP.',
        'A habilitação do intérprete começa EM_ANALISE no cadastro e recebe o parecer do backoffice; correção e reprovação voltam à análise com o reenvio do certificado.',
        'A máquina da entrega de modelagem descreve o mesmo ciclo em nível conceitual; a implementação acrescenta o estado explícito "em andamento" entre o aceite e a conclusão.',
    ])
    d.tabela('Transições de estado e eventos', ['Entidade', 'De', 'Para', 'Evento'], [
        ['Solicitação', '—', 'BUSCANDO', 'criarSolicitacao'], ['Solicitação', 'BUSCANDO', 'ACEITA', 'aceitarDemanda'],
        ['Solicitação', 'BUSCANDO / ACEITA', 'CANCELADA', 'cancelarSolicitacao'], ['Solicitação', 'ACEITA', 'EM_ANDAMENTO', 'realizarCheckin'],
        ['Solicitação', 'EM_ANDAMENTO', 'CONCLUIDA', 'encerrarAtendimento'], ['Atendimento', '—', 'AGENDADO', 'aceitarDemanda'],
        ['Atendimento', 'AGENDADO', 'EM_ANDAMENTO', 'realizarCheckin'], ['Atendimento', 'AGENDADO', 'CANCELADO', 'cancelarSolicitacao'],
        ['Atendimento', 'EM_ANDAMENTO', 'CONCLUIDO', 'encerrarAtendimento'], ['Pagamento', 'PENDENTE / FALHOU', 'PAGO / FALHOU', 'processarPagamento'],
        ['Habilitação', '—', 'EM_ANALISE', 'cadastrarInterprete'], ['Habilitação', 'EM_ANALISE', 'APROVADO / CORRECAO_SOLICITADA / REPROVADO', 'registrarParecer'],
        ['Habilitação', 'CORRECAO_SOLICITADA / REPROVADO', 'EM_ANALISE', 'reenviarCertificacao'],
    ], FONTE_CODIGO, larguras_cm=[2.6, 3.8, 4.8, 3.8], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('Cada transição é protegida no banco por uma atualização condicional ao estado anterior, de modo que duas ações simultâneas nunca levem a entidade a um estado inválido.')

    # 5.5 Operação -----------------------------------------------------------------------------------
    d.subsecao('5.5 Diagrama de Operação.')
    d.paragrafo('Os diagramas de operação mostram a sequência de chamadas internas, da rota ao banco, nas quatro rotinas críticas do Víamos.')
    for nome, titulo in [('24-operacao-a-aceite-exclusivo', 'aceite exclusivo da demanda'), ('24-operacao-b-checkin', 'check-in por QR Code e geolocalização'),
                         ('24-operacao-c-encerramento', 'encerramento do atendimento'), ('24-operacao-d-pagamento-comprovante', 'pagamento idempotente e comprovante')]:
        d.figura(FIG / f'{nome}.png', f'Diagrama de operação — {titulo}', FONTE_CODIGO)
    d.itens([
        'Aceite exclusivo: a transação começa bloqueando o registro do intérprete, aplica a regra de elegibilidade e só então troca o estado com `UPDATE … WHERE status = \'BUSCANDO\'`; o segundo intérprete recebe 409.',
        'Check-in: as validações de código, janela, precisão e distância acontecem antes da transação; dentro dela, a solicitação é bloqueada na mesma ordem do cancelamento e o estado é conferido de novo.',
        'Encerramento: a duração real e o valor final são calculados e, numa única transação, o atendimento é concluído, a localização é encerrada e o pagamento pendente é criado.',
        'Pagamento: os pagamentos do atendimento são bloqueados; se já houver um PAGO, a resposta é repetida sem cobrar; aprovado, o crédito e o comprovante saem na mesma transação.',
    ])
    d.tabela('Garantias das rotinas críticas', ['Rotina', 'Garantia', 'Mecanismo', 'Erro quando violada'], [
        ['Aceite', 'Um atendimento por solicitação; agenda sem sobreposição', 'Bloqueio do intérprete, UPDATE condicional e índice único', '409 DEMANDA_INDISPONIVEL / AGENDA_CONFLITANTE'],
        ['Check-in', 'Presença física comprovada', 'QR, janela, precisão e distância; bloqueio da solicitação', '422 QR_INVALIDO, FORA_DA_JANELA, PRECISAO_INSUFICIENTE, FORA_DO_LOCAL'],
        ['Encerramento', 'Encerramento único com cobrança correta', "UPDATE condicional a EM_ANDAMENTO; regra D-03", '409 ENCERRAMENTO_DUPLICADO'],
        ['Pagamento', 'Uma cobrança e um crédito por atendimento', 'Bloqueio dos pagamentos e índice único parcial', '200 repetido; 402 PAGAMENTO_RECUSADO'],
    ], FONTE_CODIGO, larguras_cm=[2.4, 4.0, 4.6, 4.0], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('Essas garantias são cobertas por testes automatizados que disparam as operações em paralelo e conferem que apenas uma prevalece.')

    # 5.6 DFD ---------------------------------------------------------------------------------------
    d.subsecao('5.6 Diagrama de Fluxo de Dados.')
    d.paragrafo('Os diagramas de fluxo de dados da entrega de modelagem decompõem o Víamos em seis processos (P1 a P6), mostrando as entidades externas, os depósitos de dados e os fluxos entre eles.')
    for p in sorted(FIG_ENT.glob('dfd-*.png')):
        partes = p.stem.split('-', 2)
        d.figura(p, f'DFD — {partes[1].upper()} — {partes[2].replace("-", " ")}', FONTE_MODELAGEM)
    d.itens([
        'P1 transforma dados cadastrais e certificados em contas, sessões e habilitação; o depósito D1 guarda o hash das senhas, nunca a senha em claro.',
        'P2 registra solicitações, o vínculo exclusivo e a agenda (D2), combinando habilitação (D1), agenda (D2) e reputação (D5) na seleção dos intérpretes.',
        'P3 transforma QR e posição em início validado e horários em duração real; P4 deriva o valor final e registra lançamentos sem duplicação; P5 produz histórico, comprovante e reputação; P6 coordena privacidade, auditoria e notificações.',
        'O DFD P5 histórico libera o comprovante no encerramento. Na versão entregue, o encerramento abre a cobrança e o comprovante é emitido após a confirmação do pagamento simulado (D-10, decisão confirmada em 16/11).',
    ])
    d.tabela('Processos do DFD, depósitos e implementação', ['Processo', 'Depósitos', 'Implementação'], [
        ['P1 Identidade, acesso e certificação', 'D1 Pessoas, acesso e certificações', '`auth`, `cadastro`, `backoffice`'],
        ['P2 Solicitação, distribuição e agenda', 'D1, D2 Solicitações e agenda, D5', '`solicitacao`, `demanda`'],
        ['P3 Execução presencial e suporte', 'D1, D2, D3 Atendimento e comunicação', '`atendimento`'],
        ['P4 Pagamento, ganhos e repasse', 'D3, D4 Financeiro', '`pagamento`, `gateway`'],
        ['P5 Histórico, comprovante e avaliação', 'D1, D3, D4, D5 Comprovantes e avaliações', '`comprovante`, `avaliacao`, `atendimento`'],
        ['P6 Privacidade, auditoria e notificações', 'D1, D6', '`perfil`, `auditoria`, `notificacao`'],
    ], FONTE_IA, larguras_cm=[5.2, 5.0, 4.8], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('Os seis processos do DFD correspondem a grupos de serviços do backend, e os depósitos correspondem aos domínios do DER.')

    # 5.7 Processos de telas -------------------------------------------------------------------------
    nav = ext['navegacao']
    d.subsecao('5.7 Diagrama de Processos (Telas).')
    d.paragrafo(f'Os diagramas de processos de telas mostram as transições entre as telas disparadas por cliques e eventos. Foram extraídos do código de cada tela ({len(nav["transicoes"])} transições), separados por área.')
    for area, titulo in [('publico', 'área pública'), ('cliente', 'área do cliente'), ('interprete', 'área do intérprete'), ('backoffice', 'backoffice')]:
        d.figura(FIG / f'26-telas-{area}.png', f'Processos de telas — {titulo}', FONTE_CODIGO)
    d.itens([
        'Seta simples: clique em um link ou botão, rotulada com o texto do elemento; seta de duas pontas: ida e volta entre as mesmas telas.',
        'Seta grossa: navegação feita pelo código depois que uma ação é concluída (por exemplo, o aceite leva à ficha do atendimento); seta tracejada: redirecionamento automático.',
        'A marca ☰ indica as telas abertas pelo menu principal, presente em todas as telas da área; caixas tracejadas são telas de outra área.',
    ])
    contagem = {}
    for tr in nav['transicoes']:
        area = next((r['area'] for r in ext['rotas'] if r['path'] == tr['de']), '?')
        contagem[area] = contagem.get(area, 0) + 1
    d.tabela('Transições de telas por área', ['Área', 'Telas', 'Transições', 'Exemplo de evento'], [
        ['Pública', str(sum(1 for r in ext['rotas'] if r['area'] == 'publico')), str(contagem.get('publico', 0)), 'Login válido leva ao hub do papel'],
        ['Cliente', str(sum(1 for r in ext['rotas'] if r['area'] == 'cliente')), str(contagem.get('cliente', 0)), 'Confirmar a solicitação abre o acompanhamento'],
        ['Intérprete', str(sum(1 for r in ext['rotas'] if r['area'] == 'interprete')), str(contagem.get('interprete', 0)), 'Aceitar a demanda abre a ficha do atendimento'],
        ['Backoffice', str(sum(1 for r in ext['rotas'] if r['area'] == 'backoffice')), str(contagem.get('backoffice', 0)), 'Registrar o parecer volta à fila'],
        ['Comum', str(sum(1 for r in ext['rotas'] if r['area'] == 'comum')), str(contagem.get('comum', 0)), 'Tocar a notificação abre a tela indicada'],
    ], FONTE_CODIGO, larguras_cm=[2.6, 1.6, 2.2, 8.6], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('A lista completa das transições, com o arquivo e a linha de cada uma, está em `docs/producao-tecnica/tabelas/transicoes-de-telas.md`.')

    # 5.8 CASE ---------------------------------------------------------------------------------------
    d.subsecao('5.8 Ferramenta CASE.')
    d.paragrafo('O projeto usou ferramentas computacionais de modelagem em duas frentes: o diagrams.net para os modelos UML da entrega de 30/09 (arquivo editável em `Entregas/Arquitetura e UML/Viamos_Diagramas_Editaveis.drawio`) e uma cadeia de geração de modelos a partir do código, criada para este documento.')
    d.figura(FIG / '27-ferramenta-case.png', 'Cadeia CASE de geração dos modelos a partir do código', FONTE_CODIGO)
    d.itens([
        'O exportador de modelo usa a introspecção do Drizzle ORM sobre o esquema do banco; o extrator usa a árvore sintática do compilador TypeScript para ler rotas, telas, navegação e endpoints.',
        'Os construtores transformam os dados em diagramas Mermaid, e o Mermaid CLI os renderiza em PNG; a mesma execução gera o dicionário de dados e as tabelas de apoio.',
        'O comando de verificação, executado no CI, falha se alguma figura ou tabela versionada estiver diferente do que o código atual gera — é o que mantém o DER alinhado ao banco.',
    ])
    d.tabela('Ferramentas CASE e artefatos produzidos', ['Ferramenta', 'Uso', 'Artefato'], [
        ['diagrams.net (draw.io)', 'Modelagem UML de casos de uso e classes', '`Entregas/Arquitetura e UML/Viamos_Diagramas_Editaveis.drawio`'],
        ['Google Stitch', 'Protótipo de alta fidelidade', '`docs/producao-tecnica/fontes/stitch/`'],
        ['Drizzle ORM e Drizzle Kit', 'Modelo físico e migrações SQL', '`backend/src/models/schema.ts`, `backend/drizzle/`'],
        ['Compilador TypeScript', 'Extração de rotas, navegação e endpoints', '`docs/diagramas/lib/extrair.mjs`'],
        ['Mermaid CLI', 'Renderização dos diagramas gerados', '`docs/diagramas/fontes/*.mmd` → `docs/producao-tecnica/figuras/`'],
    ], FONTE_IA, larguras_cm=[4.0, 4.8, 6.2], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo('Com a cadeia CASE, a documentação deixa de ser um retrato estático: ela é refeita a cada mudança do código e verificada automaticamente.')

    # 5.9 Contexto ----------------------------------------------------------------------------------
    d.subsecao('5.9 Diagrama de Contexto.')
    d.paragrafo('O diagrama de contexto trata o Víamos como uma caixa-preta e mostra as pessoas e os serviços externos com que ele troca informações. A primeira figura foi gerada do código; as duas seguintes são as vistas de contexto da entrega de modelagem.')
    d.figura(FIG / '28-diagrama-de-contexto.png', 'Diagrama de contexto do Víamos', FONTE_CODIGO)
    d.figura(FIG_ENT / 'contexto-1-pessoas-e-operacao.png', 'Contexto da entrega de modelagem — pessoas e operação', FONTE_MODELAGEM)
    d.figura(FIG_ENT / 'contexto-2-integracoes-externas.png', 'Contexto da entrega de modelagem — integrações externas', FONTE_MODELAGEM)
    acessos = contar_por(ext['api'], 'acesso')
    d.itens([
        f'O cliente surdo, à esquerda, origina a demanda: cadastra-se, solicita, exibe o QR, conversa na sala, paga e avalia; recebe estimativa, andamento, avisos e o comprovante. Usa {acessos.get("CLIENTE", 0)} endpoints exclusivos.',
        f'O intérprete envia cadastro e certificado, aceita ou recusa demandas, faz o check-in com GPS, encerra e pede o repasse; recebe demandas no raio e na agenda, avisos e ganhos. Usa {acessos.get("INTERPRETE", 0)} endpoints exclusivos.',
        f'O operador emite pareceres e atende chamados, recebendo a fila de certificações, as emergências, os indicadores e a trilha de auditoria ({acessos.get("BACKOFFICE/SUPORTE", 0)} endpoints). Qualquer pessoa com o código confirma um comprovante na verificação pública.',
        'À direita, o gateway de pagamento recebe cobranças e repasses e devolve aprovação ou recusa; o provedor de e-mail envia o link de recuperação de senha; o OpenStreetMap fornece mapa e busca de endereço; o aparelho do usuário fornece a posição e a leitura do QR.',
    ])
    d.paragrafo('A tabela a seguir sintetiza os fluxos de dados entre o sistema e cada entidade externa.')
    d.tabela('Diagrama de Contexto', ['Entidade externa', 'Entrada (para o sistema)', 'Saída (do sistema)'], [
        ['Cliente surdo', 'Cadastro, solicitação, QR, mensagens, pagamento e avaliação', 'Estimativa, andamento, avisos e comprovante'],
        ['Intérprete de Libras', 'Cadastro e certificado, aceite ou recusa, check-in, encerramento e repasse', 'Demandas elegíveis, avisos e ganhos'],
        ['Operador (backoffice e suporte)', 'Parecer da certificação e atendimento de chamados', 'Fila de certificações, emergências, indicadores e auditoria'],
        ['Qualquer pessoa', 'Código de verificação', 'Dados essenciais do atendimento'],
        ['Gateway de pagamento', 'Aprovação ou recusa', 'Cobrança Pix ou cartão e transferência do repasse'],
        ['Provedor de e-mail', '—', 'Link de recuperação de senha'],
        ['OpenStreetMap e Nominatim', 'Blocos do mapa e coordenadas', 'Consultas de endereço'],
        ['Aparelho do usuário', 'Posição (check-in e sala) e leitura do QR', '—'],
    ], FONTE_IA, larguras_cm=[3.8, 5.6, 5.6], tamanho=8, primeira_coluna_italico=True)
    d.paragrafo(
        'O contexto confirma que as decisões de negócio ficam dentro do Víamos: os serviços externos apenas devolvem dados, e o '
        'gateway e o e-mail estão atrás de adaptadores simulados no MVP, prontos para a troca por provedores reais.'
    )


def main():
    ctx = dict(modelo=carregar_json('modelo.json'), extracao=carregar_json('extracao.json'), requisitos=carregar_requisitos())
    ctx['R'] = ctx['modelo']['regras']
    d = Documento(RAIZ / 'Entregas' / 'modelo_entrega.docx')
    introducao(d, ctx)
    modelagem_produto(d, ctx)
    arquitetura(d, ctx)
    requisitos(d, ctx)
    processos(d, ctx)
    diagramas(d, ctx)
    destino = ENTREGA / 'Viamos_Producao_Tecnica.docx'
    d.salvar(destino, 'Víamos — Produção Técnica', 'Equipe Víamos')
    print(f'{destino.relative_to(RAIZ)}: {d.figuras} figuras, {d.tabelas} tabelas.')


if __name__ == '__main__':
    main()
