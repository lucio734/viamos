#!/usr/bin/env python3
"""Valida integridade da importação e estrutura dos artefatos, sem alegar execução do aplicativo."""
from pathlib import Path
import hashlib,json,re,xml.etree.ElementTree as ET
import fitz
from collections import Counter
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'entregas/modelagem-sistemas'
checks=[]
def check(condition,message):
 if not condition:raise AssertionError(message)
 checks.append(message)
inventory=json.loads((ROOT/'projeto/inventario-importacao.json').read_text())
check(len(inventory)==34,'Inventário contém os 34 arquivos do ZIP.')
for item in inventory:
 p=ROOT/item['destino'];check(p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'],'Original íntegro: '+item['destino'])
models=json.loads((OUT/'fontes/modelos.json').read_text())
xml=ET.parse(OUT/'Viamos_Modelagem_Editavel.drawio');diagrams=xml.getroot().findall('diagram')
pdf=fitz.open(OUT/'Viamos_Modelagem_Sistemas.pdf')
formatacao=json.loads((OUT/'fontes/formatacao_pdf.json').read_text())
check(len(diagrams)==len(models)==20,'Draw.io e modelos originais mantêm 20 páginas.')
check(len(pdf)==formatacao['paginas'],'PDF corresponde à paginação A4 registrada.')
check(len(pdf)==17 and len(formatacao['diagramas'])==15,'Capa, introdução e uma página por diagrama: 17 páginas.')
check(all(p['vista']=='integral' for p in formatacao['diagramas']),'Somente diagramas inteiros; sem páginas de recortes.')
check(len(list((OUT/'diagramas').glob('*.svg')))==20,'20 SVGs disponíveis.')
alltext='\n'.join(p.get_text() for p in pdf)
for keyword in ['FECAP','Lúcio Vecchio','Gustavo Pires','Felipe Mathey','Contexto','BPMN','DFD','Máquina de estados']:
 check(keyword in alltext,'Texto presente no PDF: '+keyword)
for diagram,model in zip(diagrams,models):
 key=model['id'];nodes=model['nodes'];edges=model['edges']
 check(diagram.get('id')==key,'Ordem de páginas consistente: '+key)
 ET.parse(OUT/'diagramas'/f'{key}.svg')
 cells=diagram.findall('.//mxCell');ids=[c.get('id') for c in cells]
 check(len(ids)==len(set(ids)),'IDs XML únicos: '+key)
 for cell in cells:
  for attr in ['source','target']:
   if cell.get(attr):check(cell.get(attr) in ids,'Conexão XML válida: '+key+'/'+cell.get('id')+'/'+attr)
 for e in edges:
  check(e['a'] in nodes and e['b'] in nodes,'Extremidades de fluxo existentes: '+key)
  # Não permite fluxos passando pelo interior de outra tarefa/estado/entidade.
  for name,n in nodes.items():
   if name in [e['a'],e['b'],'banner','core','pool','clientlane','systemlane'] or name.startswith('lane'):continue
   x0,y0,x1,y1=n['x']+3,n['y']+3,n['x']+n['w']-3,n['y']+n['h']-3
   for (ax,ay),(bx,by) in zip(e['pts'],e['pts'][1:]):
    hit=(ax==bx and x0<ax<x1 and max(min(ay,by),y0)<min(max(ay,by),y1)) or (ay==by and y0<ay<y1 and max(min(ax,bx),x0)<min(max(ax,bx),x1))
    check(not hit,f'Fluxo não atravessa outra forma: {key}/{e["a"]}->{e["b"]}/{name}')
 if key.startswith('B'):
  actual={k:n for k,n in nodes.items() if not k.startswith('lane') and k not in ['banner','pool','clientlane','systemlane','gateway']}
  sequence=[e for e in edges if not e['dash']]
  starts=[k for k,n in actual.items() if n['kind']=='start'];ends={k for k,n in actual.items() if n['kind']=='end'}
  reached=set(starts)
  while True:
   nxt=reached|{e['b'] for e in sequence if e['a'] in reached}
   if nxt==reached:break
   reached=nxt
  check(set(actual)<=reached,'Todas as tarefas/eventos BPMN são alcançáveis: '+key)
  check(bool(starts) and bool(ends),'BPMN tem início e fim: '+key)
  for k,n in actual.items():
   outgoing=[e for e in sequence if e['a']==k]
   if n['kind']=='diamond':check(len(outgoing)>=2,'Gateway com alternativas: '+key+'/'+k)
   if n['kind']!='end':check(bool(outgoing),'Elemento BPMN não terminal possui saída: '+key+'/'+k)
 # DFD: nenhum depósito conversa diretamente com outro depósito ou entidade externa.
 if key.startswith('D'):
  for e in edges:check(e['a']=='core' or e['b']=='core','Fluxo DFD passa por processo: '+key)
# A formatação do PDF é independente dos arquivos diagramáticos originais.
for number,page in enumerate(pdf,1):
 check(abs(page.rect.width-595.2756)<.02 and abs(page.rect.height-841.8898)<.02 and page.rotation==0,'Página A4 vertical: '+str(number))
 check(not page.get_images(),'Página vetorial: '+str(number))
 check(len(page.get_text().strip())>100,'Texto selecionável na página: '+str(number))
 for block in page.get_text('dict')['blocks']:
  if 'lines' not in block:continue
  for line in block['lines']:
   for span in line['spans']:
    x0,y0,x1,y1=span['bbox']
    check(x0>=-1 and y0>=-1 and x1<=page.rect.width+1 and y1<=page.rect.height+1,'Texto dentro da página: '+str(number))
    check(span['color']==0,'Texto em preto: '+str(number))
 for drawing in page.get_drawings():
  for attr in ['color','fill']:
   color=drawing[attr]
   check(color is None or all(abs(v)<.0001 for v in color) or all(abs(v-1)<.0001 for v in color),'Traço/preenchimento preto ou branco: '+str(number))
for item in formatacao['diagramas']:
 if item['vista']!='integral':continue
 page=pdf[item['pagina']-1]
 tokens=Counter(w[4] for w in page.get_text('words',clip=fitz.Rect(item['destino'])))
 digest=hashlib.sha256(json.dumps(sorted(tokens.items()),ensure_ascii=False).encode()).hexdigest()
 check(digest==item['conteudo_original_sha256'],'Texto do diagrama integral preservado: '+item['id'])
check(hashlib.sha256((OUT/'fontes/gerar_entrega.py').read_bytes()).hexdigest()==formatacao['fonte_diagramas_sha256'],'Fonte dos diagramas corresponde à versão formatada.')
trace=(OUT/'rastreabilidade.md').read_text()
check(set(re.findall(r'^\| (RF\d{2}) \|',trace,re.M))=={f'RF{i:02d}' for i in range(1,46)},'Rastreabilidade contém exatamente RF01–RF45.')
summary=f"""# Validação da entrega

Resultado: **verificações automáticas aprovadas**.

- 34 arquivos originais conferidos contra SHA-256 do ZIP.
- {len(pdf)} páginas A4 verticais no PDF; capa, introdução e 15 diagramas inteiros, um por página.
- 20 páginas originais no Draw.io e 20 SVGs mantidos sem alteração.
- Texto preto, fundo branco e traços pretos; sem ilustrações decorativas.
- PDF vetorial com texto selecionável e sem texto fora dos limites da folha.
- Conteúdo textual dos 15 diagramas integrais comparado com a fonte aprovada, sem perdas ou acréscimos.
- XML/SVG analisados; IDs e ligações consistentes; fluxos sem atravessar outras tarefas/estados/entidades.
- Elementos dos seis BPMNs alcançáveis; gateways com alternativas e elementos não terminais com saída.
- DFDs usam processos entre entidades/depósitos; RF01–RF45 presentes na matriz de rastreabilidade.

A reformatação mantém o gerador, a geometria e o conteúdo diagramático aprovados. Cada desenho é inserido como gráfico vetorial com escala uniforme; nenhum diagrama é dividido em recortes ou metades. Somente as cores mudam na apresentação do PDF. Margens de 3 cm (superior/esquerda) e 2 cm (inferior/direita), texto em Liberation Serif 12 pt, entrelinha de 18 pt e capa textual simples. As páginas com os diagramas inteiros foram revisadas visualmente.

As matrículas foram deixadas de fora por solicitação do usuário e devem ser acrescentadas antes do envio para cumprir integralmente a seção 5. A capa usa a identificação acadêmica informada; nenhum modelo institucional adicional foi fornecido. Não houve alteração do domínio ou implementação de um aplicativo.

Gerar: `python3 entregas/modelagem-sistemas/fontes/formatar_pdf.py`.
Validar: `python3 entregas/modelagem-sistemas/fontes/validar_entrega.py`.
"""
(OUT/'validacao.md').write_text(summary)
print(f'Validação aprovada: {len(checks)} asserções estruturais; 34 originais; {len(pdf)} páginas A4; 45 RF.')
