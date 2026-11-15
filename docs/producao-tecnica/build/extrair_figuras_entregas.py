"""
Extrai, como PNG, os diagramas das entregas anteriores (PDFs vetoriais em Entregas/) para o documento
"Produção Técnica": casos de uso e classes (entrega de 30/09) e contexto, BPMN, DFD e estados (entrega de 11/11).

Os PDFs em Entregas/ são só lidos (a pasta é preservada, AGENTS.md §5). As figuras vão para
docs/producao-tecnica/figuras-entregas/. Cada página é recortada na área dos desenhos vetoriais,
sem o título e o texto de apoio da página.

Uso (na raiz do repositório):
    python -m pip install pymupdf          # uma vez
    python docs/producao-tecnica/build/extrair_figuras_entregas.py
"""
from pathlib import Path

import pymupdf
from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parents[3]
SAIDA = RAIZ / 'docs' / 'producao-tecnica' / 'figuras-entregas'
ESCALA = 2.5  # ~180 dpi: nítido na página A4 sem arquivos enormes

# (pdf relativo a Entregas/, página 1-based, nome da figura)
PAGINAS = [
    ('Viamos_Modelagem_Sistemas.pdf', 3, 'contexto-1-pessoas-e-operacao'),
    ('Viamos_Modelagem_Sistemas.pdf', 4, 'contexto-2-integracoes-externas'),
    ('Viamos_Modelagem_Sistemas.pdf', 5, 'bpmn-1-habilitacao-profissional'),
    ('Viamos_Modelagem_Sistemas.pdf', 6, 'bpmn-2-criar-e-confirmar-solicitacao'),
    ('Viamos_Modelagem_Sistemas.pdf', 7, 'bpmn-3-distribuir-e-aceite-exclusivo'),
    ('Viamos_Modelagem_Sistemas.pdf', 8, 'bpmn-4-encontro-checkin-e-encerramento'),
    ('Viamos_Modelagem_Sistemas.pdf', 9, 'bpmn-5-cobranca-e-falha'),
    ('Viamos_Modelagem_Sistemas.pdf', 10, 'bpmn-6-cancelamento'),
    ('Viamos_Modelagem_Sistemas.pdf', 11, 'dfd-p1-identidade-acesso-e-certificacao'),
    ('Viamos_Modelagem_Sistemas.pdf', 12, 'dfd-p2-solicitacao-distribuicao-e-agenda'),
    ('Viamos_Modelagem_Sistemas.pdf', 13, 'dfd-p3-execucao-presencial-e-suporte'),
    ('Viamos_Modelagem_Sistemas.pdf', 14, 'dfd-p4-pagamento-ganhos-e-repasse'),
    ('Viamos_Modelagem_Sistemas.pdf', 15, 'dfd-p5-historico-comprovante-e-avaliacao'),
    ('Viamos_Modelagem_Sistemas.pdf', 16, 'dfd-p6-privacidade-auditoria-e-notificacoes'),
    ('Viamos_Modelagem_Sistemas.pdf', 17, 'estados-solicitacao-e-atendimento'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 1, 'uc-0-jornada-principal'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 3, 'uc-1-cadastro-e-habilitacao'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 4, 'uc-2-acesso-a-plataforma'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 5, 'uc-3-solicitacao-de-interprete'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 6, 'uc-4-demandas-e-disponibilidade'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 7, 'uc-5-comunicacao-e-suporte'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 8, 'uc-6-checkin-e-encerramento'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 9, 'uc-7-pagamento-e-ganhos'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 10, 'uc-8-historico-e-pos-atendimento'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 11, 'uc-9-perfil-privacidade-e-notificacoes'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 2, 'classes-0-estrutura-principal'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 12, 'classes-01-quem-usa-o-viamos'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 13, 'classes-02-habilitacao-e-disponibilidade'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 14, 'classes-03-pedido-e-estimativa'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 15, 'classes-04-distribuicao-aceite-e-vinculo'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 16, 'classes-05-comunicacao'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 17, 'classes-06-checkin-e-suporte'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 18, 'classes-07-cobranca'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 19, 'classes-08-ganhos-saldo-e-repasses'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 20, 'classes-09-comprovante-e-avaliacao'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 21, 'classes-10-privacidade-e-notificacoes'),
    ('30_09/Viamos_Entrega_Arquitetura_UML.pdf', 22, 'classes-11-acesso-recuperacao-e-auditoria'),
]


def area_dos_desenhos(pagina: pymupdf.Page) -> pymupdf.Rect:
    """União dos retângulos dos desenhos vetoriais grandes o bastante (ignora filetes de cabeçalho)."""
    area = pymupdf.Rect()
    pagina_area = pagina.rect.width * pagina.rect.height
    for d in pagina.get_drawings():
        r = d['rect']
        if r.width < 4 and r.height < 4:
            continue
        if r.width * r.height > pagina_area * 0.8:  # fundo da página (slides escuros da entrega de 30/09)
            continue
        if r.width > pagina.rect.width * 0.85 and r.height < 3:  # filete horizontal do cabeçalho/rodapé
            continue
        if r.width > pagina.rect.width * 0.65 and r.height < pagina.rect.height * 0.15:  # faixa de legenda/fonte (entrega de 11/11)
            continue
        area |= r
    if area.is_empty:
        return pagina.rect
    # inclui os rótulos cujo centro fica dentro da área (sem puxar parágrafos que só encostam nela)
    for x0, y0, x1, y1, *_ in pagina.get_text('blocks'):
        bloco = pymupdf.Rect(x0, y0, x1, y1)
        centro = pymupdf.Point((x0 + x1) / 2, (y0 + y1) / 2)
        if area.contains(centro):
            area |= bloco
    return (area + (-8, -8, 8, 8)) & pagina.rect


def main() -> None:
    SAIDA.mkdir(parents=True, exist_ok=True)
    abertos: dict[str, pymupdf.Document] = {}
    for pdf, numero, nome in PAGINAS:
        doc = abertos.setdefault(pdf, pymupdf.open(RAIZ / 'Entregas' / pdf))
        pagina = doc[numero - 1]
        recorte = area_dos_desenhos(pagina)
        imagem = pagina.get_pixmap(matrix=pymupdf.Matrix(ESCALA, ESCALA), clip=recorte, alpha=False)
        destino = SAIDA / f'{nome}.png'
        imagem.save(destino)
        if pdf.startswith('30_09/'):
            # os slides da entrega de 30/09 têm fundo escuro: em tons de cinza invertidos, ficam legíveis impressos
            ImageOps.autocontrast(ImageOps.invert(Image.open(destino).convert('L'))).save(destino, optimize=True)
        print(f'{nome}.png  {imagem.width}x{imagem.height}  ({pdf} p.{numero})')
    for doc in abertos.values():
        doc.close()


if __name__ == '__main__':
    main()
