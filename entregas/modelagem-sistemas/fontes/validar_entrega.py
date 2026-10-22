#!/usr/bin/env python3
"""Valida integridade da importação e estrutura dos artefatos, sem alegar execução do aplicativo."""
from pathlib import Path
import hashlib,json,re,xml.etree.ElementTree as ET
import fitz
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
check(len(pdf)==len(diagrams)==len(models)==20,'PDF, Draw.io e modelos têm as mesmas 20 páginas.')
check(len(list((OUT/'diagramas').glob('*.svg')))==20,'20 SVGs disponíveis.')
alltext='\n'.join(p.get_text() for p in pdf)
for keyword in ['FECAP','Lúcio Vecchio','Gustavo Pires','Felipe Mathey','Contexto','BPMN','DFD','Máquina de estados']:
 check(keyword in alltext,'Texto presente no PDF: '+keyword)
for page,diagram,model in zip(pdf,diagrams,models):
 key=model['id'];nodes=model['nodes'];edges=model['edges']
 check(diagram.get('id')==key,'Ordem de páginas consistente: '+key)
 ET.parse(OUT/'diagramas'/f'{key}.svg')
 cells=diagram.findall('.//mxCell');ids=[c.get('id') for c in cells]
 check(len(ids)==len(set(ids)),'IDs XML únicos: '+key)
 for cell in cells:
  for attr in ['source','target']:
   if cell.get(attr):check(cell.get(attr) in ids,'Conexão XML válida: '+key+'/'+cell.get('id')+'/'+attr)
 check(len(page.get_text().strip())>200,'Página PDF contém texto selecionável: '+key)
 check(not page.get_images(),'Página vetorial, sem rasterização: '+key)
 for block in page.get_text('dict')['blocks']:
  if 'lines' not in block:continue
  for line in block['lines']:
   for span in line['spans']:
    x0,y0,x1,y1=span['bbox']
    check(x0>=-1 and y0>=-1 and x1<=page.rect.width+1 and y1<=page.rect.height+1,'Texto dentro da página: '+key)
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
trace=(OUT/'rastreabilidade.md').read_text()
check(set(re.findall(r'^\| (RF\d{2}) \|',trace,re.M))=={f'RF{i:02d}' for i in range(1,46)},'Rastreabilidade contém exatamente RF01–RF45.')
summary=f'''# Validação da entrega\n\nResultado: **verificações automáticas aprovadas**.\n\n- 34 arquivos originais conferidos contra SHA-256 do ZIP.\n- 20 páginas no PDF e no Draw.io; 20 SVGs válidos.\n- PDF vetorial com texto selecionável e sem texto fora da página.\n- XML/SVG analisados; IDs e ligações consistentes.\n- Fluxos não atravessam o interior de outras tarefas/estados/entidades.\n- Todos os elementos dos seis BPMNs são alcançáveis a partir do início; gateways têm alternativas e elementos não terminais têm saída.\n- DFDs usam processos entre entidades/depósitos.\n- RF01–RF45 presentes na matriz de rastreabilidade.\n\nRevisão visual realizada nas páginas e no conjunto de miniaturas; foram ajustados rótulos de dados, contornos e a rota de repetição do pagamento. Revisão documental confrontou as regras com as duas planilhas, os documentos, os protótipos e a entrega UML anterior. As planilhas coincidem após remover a coluna adicional Versão da entrega separada; as associações também coincidem.\n\nEssas verificações validam os artefatos e sua estrutura, não substituem a avaliação acadêmica da semântica. Não foi executado um aplicativo, pois a pasta contém documentação e protótipos independentes. Matrículas e conferência do cabeçalho institucional permanecem pendentes para submissão.\n\nReexecutar: `python3 entregas/modelagem-sistemas/fontes/validar_entrega.py`.\n'''
(OUT/'validacao.md').write_text(summary)
print(f'Validação aprovada: {len(checks)} asserções estruturais; 34 originais; 20 páginas; 45 RF.')
