"""
Motor de formatação do documento "Produção Técnica" no padrão de Entregas/modelo_entrega.docx:
Arial; título de subseção em negrito e itálico 14 pt; texto justificado 11 pt; figura centralizada com a legenda
"Figura NN: título" logo abaixo e "Fonte: ..." em 9 pt; tabela com o título "Tabela NN – título" acima (10 pt),
estilo "Plain Table 2" e "Fonte: ..." abaixo. Diagramas largos vão para páginas em paisagem.
"""
from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image

ROMANOS = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv']
DPI_IMPRESSAO = 250  # resolução final das imagens no documento (nítido impresso, arquivo leve)
CACHE = Path(__file__).resolve().parent / 'tmp'


def preparar_imagem(caminho: Path, largura_cm: float) -> Path:
    """
    Ajusta a imagem ao tamanho em que aparece no documento, para o .docx ficar leve sem perder nitidez:
    reduz à resolução de impressão e grava os diagramas (tons de cinza) em escala de cinza e as capturas de tela
    (coloridas) com paleta de 256 cores.
    """
    alvo = round(largura_cm / 2.54 * DPI_IMPRESSAO)
    CACHE.mkdir(exist_ok=True)
    destino = CACHE / f'{caminho.parent.name}-{caminho.stem}-{alvo}.png'
    if destino.exists() and destino.stat().st_mtime >= caminho.stat().st_mtime:
        return destino
    imagem = Image.open(caminho)
    if imagem.mode in ('RGBA', 'LA', 'P'):
        fundo = Image.new('RGB', imagem.size, 'white')
        fundo.paste(imagem.convert('RGBA'), mask=imagem.convert('RGBA').split()[-1])
        imagem = fundo
    if imagem.width > alvo * 1.1:
        imagem = imagem.resize((alvo, round(imagem.height * alvo / imagem.width)), Image.LANCZOS)
    diagrama = caminho.parent.name in ('figuras', 'figuras-entregas')
    final = imagem.convert('L') if diagrama else imagem.convert('RGB').quantize(colors=256, method=Image.Quantize.MEDIANCUT)
    final.save(destino, optimize=True)
    return destino
LARGURA_RETRATO_CM = 15.0  # A4 com margens de 3 cm (modelo)
ALTURA_RETRATO_CM = 20.5
LARGURA_PAISAGEM_CM = 24.7  # A4 deitado com margens de 2,5 cm
ALTURA_PAISAGEM_CM = 13.8


def _fonte_arial(run, tamanho=None, negrito=None, italico=None, cor=None):
    run.font.name = 'Arial'
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn('w:rFonts'))
    if rfonts is None:
        rfonts = OxmlElement('w:rFonts')
        rpr.insert(0, rfonts)
    for atributo in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'):
        rfonts.set(qn(atributo), 'Arial')
    if tamanho:
        run.font.size = Pt(tamanho)
    if negrito is not None:
        run.font.bold = negrito
    if italico is not None:
        run.font.italic = italico
    if cor:
        run.font.color.rgb = RGBColor.from_string(cor)


def _espacamento(paragrafo, antes=6, depois=6, alinhamento=WD_ALIGN_PARAGRAPH.JUSTIFY, manter_com_proximo=False):
    formato = paragrafo.paragraph_format
    formato.space_before = Pt(antes)
    formato.space_after = Pt(depois)
    formato.line_spacing = 1.0
    formato.alignment = alinhamento
    formato.keep_with_next = manter_com_proximo


class Documento:
    def __init__(self, modelo: Path):
        self.doc = Document(str(modelo))
        corpo = self.doc.element.body
        for elemento in list(corpo):
            if elemento.tag != qn('w:sectPr'):
                corpo.remove(elemento)
        # a imagem de exemplo do modelo deixa de ser referenciada
        for rid, rel in list(self.doc.part.rels.items()):
            if rel.reltype.endswith('/image'):
                del self.doc.part.rels[rid]
        estilo = self.doc.styles['Normal']
        estilo.font.name = 'Arial'
        estilo.font.size = Pt(11)
        self.figuras = 0
        self.tabelas = 0
        self.paisagem = False
        self.indice_figuras: list[str] = []
        self.indice_tabelas: list[str] = []

    # ---------------------------------------------------------------- orientação das páginas
    def _nova_secao(self, paisagem: bool):
        secao = self.doc.add_section(WD_SECTION.NEW_PAGE)
        largura, altura = Cm(21.0), Cm(29.7)
        if paisagem:
            secao.orientation = WD_ORIENT.LANDSCAPE
            secao.page_width, secao.page_height = altura, largura
            secao.left_margin = secao.right_margin = Cm(2.5)
            secao.top_margin = secao.bottom_margin = Cm(2.5)
        else:
            secao.orientation = WD_ORIENT.PORTRAIT
            secao.page_width, secao.page_height = largura, altura
            secao.left_margin = secao.right_margin = Cm(3.0)
            secao.top_margin = secao.bottom_margin = Cm(2.5)
        self.paisagem = paisagem

    def _retrato(self):
        if self.paisagem:
            self._nova_secao(False)

    # ---------------------------------------------------------------- texto
    def capitulo(self, texto: str):
        self._retrato()
        p = self.doc.add_paragraph()
        _espacamento(p, antes=0, depois=18, alinhamento=WD_ALIGN_PARAGRAPH.LEFT, manter_com_proximo=True)
        _fonte_arial(p.add_run(texto.upper()), tamanho=18, negrito=True)

    def secao(self, texto: str):
        self._retrato()
        p = self.doc.add_paragraph()
        _espacamento(p, antes=18, depois=8, alinhamento=WD_ALIGN_PARAGRAPH.LEFT, manter_com_proximo=True)
        _fonte_arial(p.add_run(texto), tamanho=16, negrito=True)

    def subsecao(self, texto: str):
        """Mesmo formato do título "8.2 Diagrama de Contexto." do modelo."""
        self._retrato()
        p = self.doc.add_paragraph()
        _espacamento(p, antes=14, depois=6, manter_com_proximo=True)
        _fonte_arial(p.add_run(texto), tamanho=14, negrito=True, italico=True)

    def paragrafo(self, texto: str, italico=False, manter_com_proximo=False):
        self._retrato()
        p = self.doc.add_paragraph()
        _espacamento(p, manter_com_proximo=manter_com_proximo)
        self._texto_com_codigo(p, texto, italico=italico)
        return p

    def _texto_com_codigo(self, p, texto, italico=False, tamanho=None):
        """Trechos entre `crases` saem em fonte monoespaçada (nomes de arquivos, rotas e códigos)."""
        partes = texto.split('`')
        for i, parte in enumerate(partes):
            if not parte:
                continue
            run = p.add_run(parte)
            if i % 2 == 1:
                run.font.name = 'Consolas'
                rpr = run._element.get_or_add_rPr()
                rfonts = rpr.find(qn('w:rFonts'))
                if rfonts is None:  # (elemento lxml sem filhos é "falso": comparar com None)
                    rfonts = OxmlElement('w:rFonts')
                    rpr.insert(0, rfonts)
                for atributo in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'):
                    rfonts.set(qn(atributo), 'Consolas')
                run.font.size = Pt((tamanho or 11) - 1)
                run.font.italic = italico
            else:
                _fonte_arial(run, tamanho=tamanho, italico=italico)

    def itens(self, textos: list[str]):
        """Explicações numeradas (i), (ii), (iii)… como no modelo."""
        for romano, texto in zip(ROMANOS, textos):
            self.paragrafo(f'({romano}) {texto}')

    def link(self, antes: str, url: str, depois: str = ''):
        self._retrato()
        p = self.doc.add_paragraph()
        _espacamento(p)
        self._texto_com_codigo(p, antes)
        rid = self.doc.part.relate_to(url, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', is_external=True)
        hyperlink = OxmlElement('w:hyperlink')
        hyperlink.set(qn('r:id'), rid)
        novo = OxmlElement('w:r')
        rpr = OxmlElement('w:rPr')
        for tag, valor in (('w:rFonts', None), ('w:color', '0563C1'), ('w:u', 'single')):
            e = OxmlElement(tag)
            if tag == 'w:rFonts':
                for atributo in ('w:ascii', 'w:hAnsi', 'w:cs'):
                    e.set(qn(atributo), 'Arial')
            else:
                e.set(qn('w:val'), valor)
            rpr.append(e)
        novo.append(rpr)
        t = OxmlElement('w:t')
        t.text = url
        t.set(qn('xml:space'), 'preserve')
        novo.append(t)
        hyperlink.append(novo)
        p._p.append(hyperlink)
        if depois:
            self._texto_com_codigo(p, depois)

    def quebra_pagina(self):
        self._retrato()
        self.doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

    # ---------------------------------------------------------------- figuras
    def _legenda(self, titulo: str, fonte: str):
        self.figuras += 1
        rotulo = f'Figura {self.figuras:02d}: {titulo}'
        self.indice_figuras.append(rotulo)
        legenda = self.doc.add_paragraph()
        _espacamento(legenda, antes=2, depois=0, alinhamento=WD_ALIGN_PARAGRAPH.CENTER, manter_com_proximo=True)
        _fonte_arial(legenda.add_run(rotulo), italico=True)
        p_fonte = self.doc.add_paragraph()
        _espacamento(p_fonte, antes=0, depois=10, alinhamento=WD_ALIGN_PARAGRAPH.CENTER)
        _fonte_arial(p_fonte.add_run(fonte), tamanho=9)

    def figura(self, caminho: Path, titulo: str, fonte: str, largura_max_cm: float | None = None, permitir_paisagem=True):
        largura_px, altura_px = Image.open(caminho).size
        proporcao = largura_px / altura_px
        retrato = min(largura_max_cm or LARGURA_RETRATO_CM, ALTURA_RETRATO_CM * proporcao)
        paisagem = min(LARGURA_PAISAGEM_CM, ALTURA_PAISAGEM_CM * proporcao)
        usar_paisagem = permitir_paisagem and largura_max_cm is None and largura_px >= 1600 and paisagem >= retrato * 1.3
        if usar_paisagem and not self.paisagem:
            self._nova_secao(True)
        elif not usar_paisagem:
            self._retrato()
        p = self.doc.add_paragraph()
        _espacamento(p, antes=6, depois=0, alinhamento=WD_ALIGN_PARAGRAPH.CENTER, manter_com_proximo=True)
        largura = paisagem if usar_paisagem else retrato
        p.add_run().add_picture(str(preparar_imagem(caminho, largura)), width=Cm(largura))
        self._legenda(titulo, fonte)

    def grade(self, imagens: list[tuple[Path, str]], fonte: str, colunas=2, largura_cm=6.4):
        """Capturas de tela lado a lado, cada uma com a própria legenda numerada."""
        self._retrato()
        linhas = [imagens[i:i + colunas] for i in range(0, len(imagens), colunas)]
        for linha in linhas:
            tabela = self.doc.add_table(rows=1, cols=colunas)
            tabela.alignment = WD_TABLE_ALIGNMENT.CENTER
            for celula, (caminho, titulo) in zip(tabela.rows[0].cells, linha):
                p = celula.paragraphs[0]
                _espacamento(p, antes=4, depois=0, alinhamento=WD_ALIGN_PARAGRAPH.CENTER)
                p.add_run().add_picture(str(preparar_imagem(caminho, largura_cm)), width=Cm(largura_cm))
                self.figuras += 1
                rotulo = f'Figura {self.figuras:02d}: {titulo}'
                self.indice_figuras.append(rotulo)
                leg = celula.add_paragraph()
                _espacamento(leg, antes=2, depois=0, alinhamento=WD_ALIGN_PARAGRAPH.CENTER)
                _fonte_arial(leg.add_run(rotulo), tamanho=10, italico=True)
                src = celula.add_paragraph()
                _espacamento(src, antes=0, depois=8, alinhamento=WD_ALIGN_PARAGRAPH.CENTER)
                _fonte_arial(src.add_run(fonte), tamanho=8)
            # impede que a linha de imagens se parta entre páginas
            trpr = tabela.rows[0]._tr.get_or_add_trPr()
            nao_dividir = OxmlElement('w:cantSplit')
            trpr.append(nao_dividir)

    # ---------------------------------------------------------------- tabelas
    def tabela(self, titulo: str, cabecalho: list[str], linhas: list[list[str]], fonte: str, larguras_cm: list[float] | None = None, tamanho=9, primeira_coluna_italico=False):
        self._retrato()
        self.tabelas += 1
        rotulo = f'Tabela {self.tabelas:02d} – {titulo}'
        self.indice_tabelas.append(rotulo)
        p = self.doc.add_paragraph()
        _espacamento(p, antes=10, depois=4, alinhamento=WD_ALIGN_PARAGRAPH.CENTER, manter_com_proximo=True)
        _fonte_arial(p.add_run(rotulo), tamanho=10)

        tabela = self.doc.add_table(rows=1 + len(linhas), cols=len(cabecalho))
        tabela.style = self.doc.styles['Plain Table 2']
        tabela.alignment = WD_TABLE_ALIGNMENT.CENTER
        tabela.autofit = False
        larguras = larguras_cm or [LARGURA_RETRATO_CM / len(cabecalho)] * len(cabecalho)
        for i, linha in enumerate([cabecalho, *linhas]):
            celulas = tabela.rows[i].cells
            for j, valor in enumerate(linha):
                celula = celulas[j]
                celula.width = Cm(larguras[j])
                par = celula.paragraphs[0]
                _espacamento(par, antes=2, depois=2, alinhamento=WD_ALIGN_PARAGRAPH.LEFT)
                if i == 0:
                    _fonte_arial(par.add_run(str(valor)), tamanho=tamanho, negrito=True)
                else:
                    self._texto_com_codigo(par, str(valor), italico=primeira_coluna_italico and j == 0, tamanho=tamanho)
                    for run in par.runs:
                        run.font.bold = False
        # repete o cabeçalho quando a tabela atravessa a página
        trpr = tabela.rows[0]._tr.get_or_add_trPr()
        cabecalho_repetido = OxmlElement('w:tblHeader')
        trpr.append(cabecalho_repetido)
        p_fonte = self.doc.add_paragraph()
        _espacamento(p_fonte, antes=4, depois=10, alinhamento=WD_ALIGN_PARAGRAPH.CENTER)
        _fonte_arial(p_fonte.add_run(fonte), tamanho=9)

    def ficha(self, titulo: str, campos: list[tuple[str, str]], fonte: str):
        """Tabela de duas colunas (campo | descrição), usada na tabela por caso de uso de cada tela."""
        self.tabela(titulo, ['Campo', 'Descrição'], [[c, v] for c, v in campos], fonte, larguras_cm=[3.6, 11.4], tamanho=9, primeira_coluna_italico=True)

    # ---------------------------------------------------------------- saída
    def salvar(self, destino: Path, titulo: str, autor: str):
        propriedades = self.doc.core_properties
        propriedades.title = titulo
        propriedades.author = autor
        propriedades.last_modified_by = autor
        propriedades.subject = 'Produção Técnica — Engenharia de Software e Arquitetura de Sistemas'
        destino.parent.mkdir(parents=True, exist_ok=True)
        self.doc.save(str(destino))


def copiar(elemento):
    return deepcopy(elemento)
