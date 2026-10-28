#!/usr/bin/env python3
"""Formata somente o PDF de submissão; preserva os modelos, textos e geometria aprovados.

A fonte diagramática continua em gerar_entrega.py, sem alterações. Esse módulo é
executado em diretório temporário. O PDF final usa os mesmos desenhos vetoriais,
com mudança de cor para preto/branco e escala uniforme em folhas A4 horizontais.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import contextlib
import importlib.util
import io
import json
import re
import sys
import shutil
import hashlib
from collections import Counter
import fitz
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from xml.sax.saxutils import escape

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
OUT = HERE.parent
CONFIG = HERE / 'submissao.json'
IDS = ['C1-contexto-pessoas', 'C2-contexto-integracoes',
       'B1-habilitacao', 'B2-solicitacao', 'B3-distribuicao',
       'B4-execucao', 'B5-pagamento', 'B6-cancelamento',
       'D1-identidade', 'D2-solicitacoes', 'D3-atendimento',
       'D4-financeiro', 'D5-pos-atendimento', 'D6-governanca', 'E1-estados']
WIDTH, HEIGHT = landscape(A4)
LEFT, RIGHT, TOP, BOTTOM = 3*cm, 2*cm, 3*cm, 2*cm
TEXT_WIDTH = WIDTH - LEFT - RIGHT
INTRO = (
    'Este trabalho apresenta a modelagem do Víamos, uma plataforma que conecta pessoas surdas '
    'a intérpretes de Libras para atendimentos presenciais. Com base nos requisitos, na documentação '
    'e nas entregas anteriores do projeto, os diagramas de contexto delimitam os participantes e '
    'as integrações externas; os modelos BPMN descrevem os processos e suas responsabilidades; '
    'os diagramas de fluxo de dados mostram o tratamento e o armazenamento das informações; '
    'e a máquina de estados representa o ciclo de vida da solicitação e do atendimento. '
    'As diferentes vistas mantêm o mesmo domínio e vocabulário, abrangendo desde a habilitação '
    'profissional até o encerramento e o pós-atendimento.'
)
FONT_DIR = Path('/usr/share/fonts/truetype/liberation')
pdfmetrics.registerFont(TTFont('Texto', str(FONT_DIR/'LiberationSerif-Regular.ttf')))
pdfmetrics.registerFont(TTFont('TextoNegrito', str(FONT_DIR/'LiberationSerif-Bold.ttf')))
BODY = ParagraphStyle('Corpo', fontName='Texto', fontSize=12, leading=18,
                      alignment=TA_JUSTIFY, firstLineIndent=1.25*cm, textColor='#000000')
HEADING = ParagraphStyle('Titulo', fontName='TextoNegrito', fontSize=12, leading=18,
                         alignment=TA_LEFT, textColor='#000000')
SMALL = ParagraphStyle('Legenda', fontName='Texto', fontSize=10, leading=12,
                       alignment=TA_LEFT, textColor='#000000')


def paragraph(c, text, top, style=BODY):
    p = Paragraph(escape(text), style)
    _, height = p.wrap(TEXT_WIDTH, HEIGHT-TOP-BOTTOM)
    p.drawOn(c, LEFT, HEIGHT-top-height)
    return top+height


def centered(c, text, top, font='Texto', size=12):
    c.setFont(font, size)
    c.setFillGray(0)
    c.drawCentredString(WIDTH/2, HEIGHT-top-size, text)


def page_number(c, number):
    c.setFont('Texto', 10)
    c.setFillGray(0)
    c.drawRightString(WIDTH-RIGHT, HEIGHT-2*cm, str(number))


def monochrome(document):
    """Muda apenas operadores de cor; caminhos, textos e matrizes ficam intactos."""
    number = rb'[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?'
    pattern = re.compile(rb'(?<![\w.])('+number+rb')\s+('+number+rb')\s+('+number+rb')\s+(rg|RG)\b')
    seen = set()
    for page in document:
        for xref in page.get_contents():
            if xref in seen:
                continue
            seen.add(xref)
            stream = document.xref_stream(xref)
            def replace(match):
                rgb = [float(match.group(i)) for i in (1, 2, 3)]
                if match.group(4) == b'RG':
                    return b'1 G' if min(rgb) > .99 else b'0 G'
                # Fundos claros ficam brancos; tinta, texto e marcadores ficam pretos.
                return b'1 g' if sum(rgb)/3 > .65 else b'0 g'
            document.update_stream(xref, pattern.sub(replace, stream))


def main():
    config = json.loads(CONFIG.read_text())
    spec = importlib.util.spec_from_file_location('modelos_aprovados', HERE/'gerar_entrega.py')
    original = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(original)
    models = {p.id: p for p in original.PAGES}
    metadata = {'formato': 'A4 paisagem', 'dimensoes_pt': [WIDTH, HEIGHT],
                'margens_cm': {'superior': 3, 'esquerda': 3, 'inferior': 2, 'direita': 2},
                'cores': 'preto e branco', 'fonte_texto': 'Liberation Serif 12 pt',
                'entrelinha_texto_pt': 18, 'diagramas': [],
                'matriculas_pendentes': [p['nome'] for p in config['integrantes'] if not p['matricula']],
                'fonte_diagramas_sha256': hashlib.sha256((HERE/'gerar_entrega.py').read_bytes()).hexdigest()}
    with TemporaryDirectory(prefix='viamos-submissao-') as temp:
        temp = Path(temp)
        original.OUT = temp/'fontes_originais'
        original.OUT.mkdir()
        (original.OUT/'fontes').mkdir()
        with contextlib.redirect_stdout(io.StringIO()):
            original.render()
        source = fitz.open(original.OUT/'Viamos_Modelagem_Sistemas.pdf')
        source_numbers = {p.id: i for i, p in enumerate(original.PAGES)}
        clips = {}
        original_text = {}
        for key in IDS:
            page = source[source_numbers[key]]
            sx, sy = page.rect.width/original.W, page.rect.height/original.H
            clip = fitz.Rect(40*sx, 150*sy, 1440*sx, 830*sy)
            clips[key] = clip
            tokens = Counter(w[4] for w in page.get_text('words', clip=clip))
            original_text[key] = hashlib.sha256(json.dumps(sorted(tokens.items()), ensure_ascii=False).encode()).hexdigest()
            # Remove exclusivamente cabeçalhos, rodapés e textos explicativos antigos.
            # As duas bandas ficam fora de todos os elementos do diagrama aprovado.
            page.add_redact_annot(fitz.Rect(0, 0, page.rect.width, 150*sy), fill=(1, 1, 1))
            page.add_redact_annot(fitz.Rect(0, 830*sy, page.rect.width, page.rect.height), fill=(1, 1, 1))
            page.apply_redactions(images=2, graphics=2, text=0)
        monochrome(source)
        typeset = temp/'texto.pdf'
        c = canvas.Canvas(str(typeset), pagesize=landscape(A4), invariant=1)
        c.setTitle('Víamos — Especificação e Modelagem Integral de Sistemas')
        c.setAuthor('; '.join(p['nome'] for p in config['integrantes']))
        centered(c, config['instituicao'], TOP, 'TextoNegrito')
        centered(c, config['curso'].upper(), TOP+22)
        centered(c, config['turma'], TOP+44)
        for index, member in enumerate(config['integrantes']):
            matricula = member['matricula']
            centered(c, member['nome'], 160+index*36)
            if matricula:
                centered(c, 'Matrícula: '+matricula, 177+index*36)
        centered(c, config['titulo'], 300, 'TextoNegrito', 14)
        centered(c, config['subtitulo'], 327)
        centered(c, config['disciplina'], 390)
        centered(c, 'Professor: '+config['professor'], 414)
        centered(c, config['local'], HEIGHT-BOTTOM-40)
        centered(c, config['ano'], HEIGHT-BOTTOM-18)
        c.showPage()
        paragraph(c, '1 INTRODUÇÃO', TOP, HEADING)
        paragraph(c, INTRO, TOP+36)
        page_number(c, 2)
        c.showPage()
        placements = []
        for index, key in enumerate(IDS, 1):
            model = models[key]
            explanatory = next(item['text'] for item in model.items
                               if item['kind']=='text' and item.get('y')==859)
            title = model.title.replace(' | ', ' — ')
            views = [('integral', clips[key])]
            for view, clip in views:
                label = f'{index+1} {title}'
                if view != 'integral':
                    label += ' — '+view
                y = paragraph(c, label, TOP, HEADING)+18
                text = explanatory if view=='integral' else (
                    f'Esta página apresenta o {view} da figura {index}, com sobreposição na região central para acompanhar as ligações. '
                    + explanatory.split('. ')[0].rstrip('.')+'.')
                y = paragraph(c, text, y)+24
                c.setFont('Texto', 10)
                c.drawString(LEFT, HEIGHT-y-10, f'Figura {index} — {title}'+(' ('+view+')' if view!='integral' else ''))
                y += 24
                available_height = HEIGHT-BOTTOM-y-30
                scale = min(TEXT_WIDTH/clip.width, available_height/clip.height)
                fw, fh = clip.width*scale, clip.height*scale
                x = LEFT+(TEXT_WIDTH-fw)/2
                rectangle = fitz.Rect(x, y, x+fw, y+fh)
                placements.append({'id': key, 'pagina': len(placements)+3, 'vista': view,
                                   'destino': list(rectangle), 'recorte': list(clip),
                                   'escala_uniforme': scale,
                                   'conteudo_original_sha256': original_text[key]})
                c.setFont('Texto', 10)
                c.drawString(LEFT, HEIGHT-(y+fh+17), 'Fonte: elaboração dos autores a partir dos documentos do Projeto Víamos.')
                page_number(c, len(placements)+2)
                c.showPage()
        c.save()
        final = fitz.open(typeset)
        for item in placements:
            target = final[item['pagina']-1]
            target.show_pdf_page(fitz.Rect(item['destino']), source, source_numbers[item['id']],
                                 clip=fitz.Rect(item['recorte']), keep_proportion=True)
        metadata['diagramas'] = placements
        metadata['paginas'] = len(final)
        metadata['detalhes_ampliados'] = config['detalhes_ampliados']
        final.save(OUT/'Viamos_Modelagem_Sistemas.pdf', garbage=4, deflate=True, no_new_id=True)
        final.close()
        source.close()
    pacote = OUT.parent/'pacotes'
    pacote.mkdir(exist_ok=True)
    shutil.copyfile(OUT/'Viamos_Modelagem_Sistemas.pdf', pacote/'Viamos_Modelagem_Sistemas_Horizontal.pdf')
    (HERE/'formatacao_pdf.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n')
    print(f'PDF A4 horizontal gerado: {metadata["paginas"]} páginas; 15 diagramas preservados.')
    if metadata['matriculas_pendentes']:
        print('Capa pendente de matrículas: '+', '.join(metadata['matriculas_pendentes']))


if __name__ == '__main__':
    main()
