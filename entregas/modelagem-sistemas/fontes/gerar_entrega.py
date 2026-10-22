#!/usr/bin/env python3
"""Gera PDF vetorial, SVGs e Draw.io a partir do mesmo modelo. Executar na raiz do repositório."""
from pathlib import Path
import math, json, html, re, hashlib, xml.etree.ElementTree as ET
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import toColor as HexColor
from reportlab.lib.pagesizes import A3, landscape
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'entregas/modelagem-sistemas'
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
pdfmetrics.registerFont(TTFont('DejaVu',FONT))
pdfmetrics.registerFont(TTFont('DejaVuB',FONT.replace('.ttf','-Bold.ttf')))
W,H=1440,1000
NAVY='#1a2e44'; INK='#213547'; TEAL='#087e8b'; LIGHT='#edf4f8'; GOLD='#fff2ce'
PAGES=[]
def wrap(text,width,size,bold=False):
 out=[]
 for line in text.split('\n'):
  words=line.split(); cur=''
  for word in words:
   nxt=(cur+' '+word).strip()
   if cur and pdfmetrics.stringWidth(nxt,'DejaVuB' if bold else 'DejaVu',size)>width:
    out.append(cur);cur=word
   else:cur=nxt
  out.append(cur)
 return out
class Page:
 def __init__(self,id,title,subtitle,caption='',refs=''):
  self.id=id;self.title=title;self.items=[];self.nodes={};self.edges=[]
  self.box('banner',0,0,W,12,'',NAVY,stroke=NAVY)
  self.text(48,32,'VÍAMOS  /  MODELAGEM DE SISTEMAS',15,TEAL,bold=True,width=1300)
  self.text(48,62,title,30,NAVY,bold=True,width=1330)
  self.text(48,109,subtitle,16,width=1320)
  self.line([(48,145),(1392,145)],'#cbd5df',1)
  if caption:
   self.text(48,834,'JUSTIFICATIVA E REGRAS',13,TEAL,bold=True,width=1300)
   self.text(48,859,caption,15,width=1330)
  if refs:self.text(48,938,refs,12,'#526578',width=1330)
  PAGES.append(self)
 def text(self,x,y,text,size=16,color=INK,width=220,bold=False,align='left'):
  self.items.append(dict(kind='text',x=x,y=y,text=text,size=size,color=color,w=width,bold=bold,align=align))
 def box(self,id,x,y,w,h,text='',fill='white',stroke=NAVY,kind='rect',size=17):
  assert id not in self.nodes,(self.id,id)
  n=dict(kind=kind,id=id,x=x,y=y,w=w,h=h,text=text,fill=fill,stroke=stroke,size=size)
  self.nodes[id]=n; self.items.append(n);return id
 def line(self,pts,color=INK,sw=1.6,dash=False):self.items.append(dict(kind='line',pts=pts,color=color,sw=sw,dash=dash))
 def edge(self,a,b,pts,label='',lx=None,ly=None,lw=220,dash=False):
  assert a in self.nodes and b in self.nodes
  e=dict(kind='edge',a=a,b=b,pts=pts,label=label,color=INK,sw=1.7,dash=dash);self.items.append(e);self.edges.append(e)
  if label:
   x,y=pts[len(pts)//2];self.items.append(dict(kind='label',x=lx if lx is not None else x,y=ly if ly is not None else y-25,w=lw,text=label,size=14,color=INK,bold=False,align='center'))
 def lanes(self,names):
  height=640/len(names)
  for i,name in enumerate(names):
   y=165+i*height
   self.box('lane'+str(i),48,y,1344,height,'',fill='#f5f8fa' if i%2==0 else 'white',stroke='#b7c7d3')
   self.box('lanehead'+str(i),48,y,80,height,'',fill=LIGHT,stroke='#b7c7d3')
   self.text(54,y+height/2-24,name,13,NAVY,width=68,bold=True,align='center')
 def task(self,id,x,y,text,w=164,h=70):return self.box(id,x,y,w,h,text,LIGHT,kind='round',size=14)
 def event(self,id,x,y,label='',end=False):
  self.box(id,x,y,32,32,'','white',kind='end' if end else 'start')
  if label:self.text(x-64,y+40,label,13,width=160,align='center')
  return id
 def gate(self,id,x,y,label):
  self.box(id,x,y,50,50,'×',GOLD,kind='diamond',size=27)
  self.text(x-70,y-40,label,14,width=190,align='center');return id

def fan(id,title,subtitle,center,entries,caption,refs):
 p=Page(id,title,subtitle,caption,refs)
 p.box('core',630,172,180,610,center,LIGHT,kind='round',size=20)
 # entries: (side, row, id, title, kind, incoming-to-core, outgoing-from-core)
 for side,row,key,name,kind,inc,out in entries:
  y=185+row*150;x=48 if side=='L' else 1142
  if key=='p6' and id.startswith('D'):
   inc='Pedido autorizado de dados/tratamento LGPD'
   out=out+'; dados exportáveis'
  p.box(key,x,y,250,104,name,'#fffaf0' if kind=='store' else 'white',kind=kind,size=16)
  if side=='L':
   if inc:p.edge(key,'core',[(298,y+32),(630,y+32)],inc,310,y-10,308)
   if out:p.edge('core',key,[(630,y+80),(298,y+80)],out,310,y+38,308)
  else:
   if out:p.edge('core',key,[(810,y+32),(1142,y+32)],out,822,y-10,308)
   if inc:p.edge(key,'core',[(1142,y+80),(810,y+80)],inc,822,y+38,308)
 return p

p=Page('00-capa','Especificação e Modelagem Integral de Sistemas','FECAP • Ciência da Computação • 4º semestre')
p.text(75,210,'Projeto Víamos',49,NAVY,bold=True,width=1250)
p.text(78,292,'Conectando o ciclo da acessibilidade',25,TEAL,width=1250)
p.text(78,352,'Plataforma de contratação de intérpretes de Libras para atendimentos presenciais.',22,width=1180)
p.text(78,455,'Lúcio Vecchio\nGustavo Pires\nFelipe Mathey',24,width=1050)
p.text(78,590,'Disciplina: Engenharia de Software e Arquitetura de Sistemas\nDocente: Prof. MSc. Luis Fernando dos Santos Pires',19,width=1200)
p.text(78,685,'Perspectiva externa • Processos BPMN • Fluxos de dados • Máquina de estados',19,TEAL,width=1200)
p.text(78,760,'Identificação acadêmica: matrículas não fornecidas. Completar antes do envio ao AVA.\nCabeçalho institucional textual; conferir eventual modelo oficial da FECAP.',16,width=1200)
p.text(78,865,'Modelos de análise baseados nos documentos do projeto; não representam funcionalidades implementadas.',16,width=1200)

p=Page('01-leitura','Escopo, fontes e critérios de leitura','Uma base de requisitos; quatro perspectivas complementares.')
sections=[('DOMÍNIO','O Víamos conecta cliente surdo e intérprete habilitado para atendimento presencial. Backoffice analisa certificações; Suporte atende chamados. Mapas, gateway financeiro, push, e-mail e localização do dispositivo ficam fora da fronteira do software.'),('BASE CONSULTADA','34 arquivos importados: 5 Markdown, 12 HTML, 12 PNG, 2 XLSX, 1 DOCX, 1 PDF e 1 Draw.io. A planilha consolidada contém 45 RF, 45 RNF e 24 histórias (113 pontos). A entrega UML anterior contém 23 vistas. Os dois PDFs da disciplina completam as referências.'),('LEITURA DOS MODELOS','C1–C2 são vistas do mesmo contexto. B1–B6 detalham processos BPMN em raias. D1–D6 são vistas do mesmo DFD lógico de nível 1: P1–P6 e depósitos D1–D6 se repetem sem duplicação. E1 representa o ciclo da solicitação e de seu atendimento associado.'),('NOTAÇÃO','Contexto/DFD: retângulos = entidades externas; caixas arredondadas numeradas = processos; duas linhas paralelas = depósitos; setas = dados. BPMN: círculo fino = início; grosso = fim; tarefa arredondada; losango com X = decisão exclusiva; círculo duplo = espera. UML: estado arredondado; transição = evento [guarda] / ação.'),('DECISÕES DE CONSISTÊNCIA','Requisitos e contexto prevalecem sobre resíduos dos protótipos: sem videochamada; mínimo contratado de 60 min; raio de distribuição de até 15 km; check-in até 200 m e erro de posição até 50 m. Conclusão do atendimento não depende de aprovação do pagamento.')]
y=185
for title,body in sections:
 p.text(55,y,title,15,TEAL,bold=True,width=1300);p.text(55,y+30,body,18,width=1320);y+=145

fan('C1-contexto-pessoas','Contexto | pessoas e operação','Vista 1/2 do processo 0. Os serviços externos da vista C2 integram a mesma fronteira.','0\nSistema\nVíamos\n\nAtendimento\npresencial',[
 ('L',0,'cliente','Cliente surdo | contratação','rect','Cadastro/acesso; solicitação; cancelamento','Sessão/perfil; estimativa; status e intérprete'),
 ('L',1,'cliente_com','Cliente surdo | atendimento','rect','Mensagens/fotos; QR; avaliação; suporte','Conversa/localização; QR; histórico; PDF'),
 ('L',2,'interprete','Intérprete | contratação','rect','Cadastro/certificado; agenda; aceite/recusa','Conta/sessão; análise; demandas e agenda'),
 ('L',3,'interprete_com','Intérprete | atendimento','rect','Mensagens/fotos; QR; fim; avaliação; suporte','Conversa/localização; check-in; histórico/PDF'),
 ('R',0,'backoffice','Backoffice','rect','Parecer: aprovar, reprovar ou corrigir','Documentação para análise; resultado registrado'),
 ('R',1,'cliente_fin','Cliente | financeiro e dados','rect','Pagamento; perfil; consentimento; pedido LGPD','Resultado financeiro; dados/status; avisos'),
 ('R',3,'interprete_fin','Intérprete | financeiro e dados','rect','Ganhos/repasse; perfil; consentimento; pedido LGPD','Extrato/repasse; dados/status; avisos'),
 ('R',2,'suporte','Suporte','rect','Resposta e andamento do chamado','Chamado; data, hora e localização permitida')],
 'Cliente e intérprete aparecem repetidos apenas para organizar as trocas: cada perfil continua sendo uma única entidade externa. QR é exibido ao cliente e lido pelo intérprete. LGPD abrange consentimento, consulta, exportação e exclusão. Suporte recebe chamados; Backoffice analisa certificações.',
 'Fontes: RF01–RF45; RNF28; contexto; UML anterior DU1–DU9. Os atores humanos são externos ao software.')
fan('C2-contexto-integracoes','Contexto | integrações externas','Vista 2/2 do processo 0. Nenhum fornecedor específico é imposto pelas fontes.','0\nSistema\nVíamos\n\nMesma fronteira\nda vista C1',[
 ('L',0,'mapas','Serviço de mapas','rect','Endereço normalizado, coordenadas e distância','Endereço, rota e consulta de distância'),
 ('L',2,'gateway','Gateway financeiro','rect','Token; resultado da cobrança e do repasse','Tokenização; cobrança Pix/cartão; repasse'),
 ('R',0,'push','Serviço de notificações','rect','Confirmação de entrega ou falha','Destinatário e conteúdo da notificação'),
 ('R',1,'email','Serviço de e-mail','rect','Resultado do envio','E-mail e link temporário de recuperação'),
 ('R',3,'gps','Localização do dispositivo','rect','Posição, precisão e instante da leitura','Pedido autorizado de posição; parada')],
 'As integrações retornam dados; decisões de negócio permanecem no Víamos. A localização é temporária e depende de consentimento. O gateway tokeniza cartões. Repasses pelo mesmo gateway seguem a proposta da entrega UML anterior. Não há base compartilhada nem sistema legado identificado nas fontes.',
 'Fontes: RF07, RF14, RF21, RF27, RF29, RF32, RF36, RF42; RNF23–RNF26, RNF37, RNF44; UML DU2–DU7.')

p=Page('B1-habilitacao','BPMN | habilitação profissional','Processo de cadastro do intérprete; cliente cadastra-se sem análise de certificação.',
 'A aprovação do Backoffice é pré-condição para receber e aceitar demandas. Correção retorna ao envio; reprovação encerra esta análise sem habilitar o profissional. Os documentos aceitam Prolibras ou equivalente. As raias representam responsabilidades no processo de negócio.',
 'RF04–RF06; RNF36; US02. Losangos X são exclusivos. Fluxos entre raias pertencem ao mesmo processo.')
p.lanes(['Intérprete','Víamos','Backoffice'])
p.event('s',150,245);p.task('upload',230,225,'Enviar cadastro e certificação')
p.task('save',460,435,'Registrar perfil em análise')
p.task('review',690,650,'Analisar documentação')
p.gate('decision',940,660,'Parecer?')
p.task('fix',930,235,'Corrigir documentos e reenviar')
p.task('approved',1110,405,'Registrar aprovação; habilitar demandas')
p.task('rejected',1110,510,'Registrar reprovação; manter bloqueio')
p.event('ea',1330,425,'Habilitado',True);p.event('er',1330,530,'Não habilitado',True)
p.edge('s','upload',[(182,261),(230,261)])
p.edge('upload','save',[(394,260),(430,260),(430,470),(460,470)])
p.edge('save','review',[(624,470),(655,470),(655,685),(690,685)])
p.edge('review','decision',[(854,685),(940,685)])
p.edge('decision','fix',[(965,660),(965,305)],'Corrigir',975,360,125)
p.edge('fix','upload',[(930,270),(820,270),(820,192),(312,192),(312,225)],'Nova versão',520,166,170)
p.edge('decision','approved',[(990,680),(1060,680),(1060,440),(1110,440)],'Aprovar',970,594,110)
p.edge('decision','rejected',[(965,710),(965,764),(1090,764),(1090,545),(1110,545)],'Reprovar',975,738,100)
p.edge('approved','ea',[(1274,440),(1330,441)])
p.edge('rejected','er',[(1274,545),(1330,546)])

p=Page('B2-solicitacao','BPMN | criar e confirmar solicitação','Pré-condição: cliente autenticado. Saída: solicitação no estado “Buscando intérprete”.',
 'A estimativa antecede a confirmação. Data/hora passada, duração inferior a 60 min ou endereço inválido retornam ao preenchimento. O registro só ocorre com confirmação do cliente; a desistência antes disso não cria solicitação cancelada. Fórmula de preço permanece parametrizável, pois não está definida nas fontes.',
 'RF10–RF16; RNF24, RNF28; US05–US07. A distribuição continua na vista B3.')
p.lanes(['Cliente','Víamos'])
p.event('s',155,270);p.task('fill',240,250,'Informar serviço, data, duração e local')
p.task('validate',445,530,'Validar dados e geocodificar local')
p.gate('valid',690,540,'Dados válidos?');p.task('quote',820,530,'Calcular e apresentar estimativa')
p.gate('confirm',1100,270,'Confirmar resumo?');p.event('abort',1310,280,'Desistência',True)
p.task('register',1090,650,'Registrar solicitação e iniciar busca')
p.event('end',1320,670,'Busca iniciada (B3)',True)
p.edge('s','fill',[(187,286),(240,286)])
p.edge('fill','validate',[(404,285),(425,285),(425,565),(445,565)])
p.edge('validate','valid',[(609,565),(690,565)])
p.edge('valid','fill',[(715,590),(715,755),(210,755),(210,285),(240,285)],'Não: corrigir dados',330,722,250)
p.edge('valid','quote',[(740,565),(820,565)],'Sim',747,535,65)
p.edge('quote','confirm',[(984,565),(1040,565),(1040,295),(1100,295)])
p.edge('confirm','abort',[(1150,295),(1310,296)],'Não',1190,262,75)
p.edge('confirm','register',[(1125,320),(1172,320),(1172,650)],'Sim',1180,490,65)
p.edge('register','end',[(1254,685),(1320,686)])

p=Page('B3-distribuicao','BPMN | distribuir e obter aceite exclusivo','Pré-condição: solicitação confirmada e ainda aberta.',
 'Elegibilidade exige aprovação, disponibilidade, raio configurado de até 15 km e ordenação por proximidade/reputação. Sem elegíveis, a busca espera nova disponibilidade; não há prazo de expiração definido. Recusa individual não cancela a solicitação. O aceite atômico evita alocação duplicada e revalida a elegibilidade.',
 'RF17–RF25, RF42; RNF03, RNF27, RNF36, RNF43; US08, US14–US19. Cancelamento concorrente: B6.')
p.lanes(['Víamos','Intérprete'])
p.event('s',145,245);p.task('filter',205,225,'Selecionar intérpretes elegíveis')
p.gate('found',440,235,'Há elegíveis?')
p.box('wait',450,370,32,32,'','white',kind='wait');p.text(355,413,'Mudança de disponibilidade',13,width=220,align='center')
p.task('send',610,225,'Distribuir oferta e exibir demanda')
p.task('choose',815,555,'Analisar demanda e responder')
p.gate('yes',1050,565,'Aceitar?')
p.task('decline',560,675,'Recusar oferta (motivo opcional)')
p.task('atomic',1010,225,'Tentar aceite exclusivo; revalidar',w=175)
p.gate('won',1230,235,'Aceite válido?')
p.event('ok',1340,245,'Aceita; notificar',True);p.event('lost',1260,385,'Indisponível; atualizar lista',True)
p.edge('s','filter',[(177,261),(205,261)])
p.edge('filter','found',[(369,260),(440,260)])
p.edge('found','send',[(490,260),(610,260)],'Sim',520,233,60)
p.edge('found','wait',[(465,285),(466,370)],'Não',480,315,65)
p.edge('wait','filter',[(450,386),(287,386),(287,295)])
p.edge('send','choose',[(774,260),(790,260),(790,590),(815,590)])
p.edge('choose','yes',[(979,590),(1050,590)])
p.edge('yes','atomic',[(1075,565),(1092,565),(1092,295)],'Sim',1100,457,65)
p.edge('yes','decline',[(1075,615),(1075,710),(724,710)],'Não',860,681,65)
p.edge('decline','filter',[(560,710),(175,710),(175,330),(287,330),(287,295)],'Demanda permanece aberta',230,680,295)
p.edge('atomic','won',[(1185,260),(1230,260)])
p.edge('won','ok',[(1280,260),(1340,261)],'Sim',1285,231,50)
p.edge('won','lost',[(1255,285),(1276,285),(1276,385)],'Não',1290,320,65)

p=Page('B4-execucao','BPMN | encontro, check-in e encerramento','Pré-condição: solicitação aceita e participantes autenticados.',
 'O cliente exibe o QR e o intérprete faz a leitura. Validar vínculo, QR, distância até 200 m e precisão até 50 m impede início indevido. Falha mantém o estado “Aceita”. O encerramento registra duração real, para a localização e libera pagamento, comprovante e avaliação de forma independente.',
 'RF28–RF34, RF37–RF40; RNF21, RNF26, RNF44; US10, US20–US21. Suporte registrado em P3 não encerra automaticamente o atendimento.')
p.lanes(['Cliente','Intérprete','Víamos'])
p.event('s',155,240);p.task('qr',230,220,'Alinhar encontro; exibir QR ao intérprete',w=180)
p.task('read',455,440,'Ler QR no local e enviar posição')
p.task('check',680,650,'Validar QR e posição; registrar início se válido')
p.gate('valid',915,660,'Check-in válido?')
p.task('serve',980,430,'Realizar atendimento presencial',w=170)
p.task('finish',1200,430,'Confirmar encerramento',w=170)
p.task('close',1200,650,'Registrar fim e duração; liberar pós',w=170)
p.event('end',1340,755,'Concluída',True)
p.edge('s','qr',[(187,256),(230,255)])
p.edge('qr','read',[(410,255),(430,255),(430,475),(455,475)])
p.edge('read','check',[(619,475),(650,475),(650,685),(680,685)])
p.edge('check','valid',[(844,685),(915,685)])
p.edge('valid','read',[(940,710),(940,765),(430,765),(430,475),(455,475)],'Não: informar falha e repetir leitura',550,733,340)
p.edge('valid','serve',[(940,660),(940,465),(980,465)],'Sim: registrar início',805,546,190)
p.edge('serve','finish',[(1150,465),(1200,465)])
p.edge('finish','close',[(1285,500),(1285,650)])
p.edge('close','end',[(1285,720),(1285,771),(1340,771)])

p=Page('B5-pagamento','BPMN | cobrança e tratamento de falha','Pré-condição: atendimento concluído. O gateway é um participante externo, em pool separado.',
 'A requisição e o retorno do gateway são fluxos de mensagem (tracejados), nunca sequência entre pools. Pagamento aprovado gera crédito uma única vez; falha permite nova tentativa. A conclusão do atendimento e a emissão do comprovante não são desfeitas por falha financeira. Repasses e saldo são detalhados em P4.',
 'RF26–RF27, RF35–RF38; RNF23, RNF37; US11, US22–US23; UML DC7–DC8. Gateway externo mostrado como pool caixa-preta.')
# Two lanes in the Viamos business process, plus one external black-box pool.
p.box('pool',48,165,1344,510,'',stroke='#b7c7d3')
p.box('clientlane',48,165,1344,220,'',fill='#f5f8fa',stroke='#b7c7d3')
p.box('systemlane',48,385,1344,290,'',stroke='#b7c7d3')
p.text(55,255,'Cliente',13,width=75,bold=True);p.text(55,505,'Víamos',13,width=75,bold=True)
p.box('gateway',220,720,710,80,'Gateway financeiro — pool externo (processamento não detalhado)',LIGHT,size=17)
p.event('s',150,245);p.task('method',220,225,'Selecionar Pix ou cartão tokenizado',w=180)
p.task('request',450,430,'Solicitar cobrança e aguardar resultado',w=190)
p.task('record',720,430,'Registrar resultado da transação',w=180)
p.gate('ok',980,440,'Pagamento aprovado?')
p.task('credit',1120,420,'Registrar crédito e notificar',w=165)
p.event('end',1340,440,'Pago',True)
p.task('fail',960,565,'Registrar falha; informar motivo',w=190)
p.gate('retry',1070,245,'Tentar novamente?');p.event('pending',1310,255,'Pagamento pendente',True)
p.edge('s','method',[(182,261),(220,260)])
p.edge('method','request',[(400,260),(420,260),(420,465),(450,465)])
p.edge('request','record',[(640,465),(720,465)])
p.edge('request','gateway',[(500,500),(500,720)],'Cobrança Pix/cartão',280,625,200,True)
p.edge('gateway','request',[(600,720),(600,500)],'Resultado',620,625,120,True)
p.edge('record','ok',[(900,465),(980,465)])
p.edge('ok','credit',[(1030,465),(1120,455)],'Sim',1045,424,65)
p.edge('credit','end',[(1285,455),(1340,456)])
p.edge('ok','fail',[(1005,490),(1005,565)],'Não',1020,518,65)
p.edge('fail','retry',[(1150,600),(1300,600),(1300,340),(1095,340),(1095,295)])
p.edge('retry','method',[(1070,270),(870,270),(870,195),(310,195),(310,225)],'Sim',600,170,70)
p.edge('retry','pending',[(1120,270),(1310,271)],'Não',1190,235,65)

p=Page('B6-cancelamento','BPMN | cancelamento solicitado pelo cliente','Processo acionado em “Buscando intérprete” ou “Aceita”; em andamento, o fluxo documentado é encerramento.',
 'RF19 e US09 preveem cancelamento antes do início e eventual taxa. A política deve ser apresentada ao cliente; prazo, valor e fórmula não foram fornecidos. O sistema revalida estado e autorização de forma atômica para evitar corrida com o check-in. Cancelar não é o mesmo que recusar uma oferta individual.',
 'RF18–RF19, RF42, RF44; US09. A máquina E1 usa a mesma guarda: não iniciado e política autoriza.')
p.lanes(['Cliente','Víamos'])
p.event('s',160,260);p.task('ask',250,240,'Consultar política e confirmar cancelamento',w=195)
p.task('policy',515,540,'Revalidar estado, prazo e autorização',w=190)
p.gate('allowed',805,550,'Cancelamento permitido?')
p.task('deny',1060,520,'Informar motivo e preservar estado',w=185)
p.event('no',1320,540,'Não cancelada',True)
p.task('cancel',805,690,'Cancelar; liberar agenda; registrar taxa se aplicável',w=245)
p.event('yes',1260,710,'Cancelada; notificar',True)
p.edge('s','ask',[(192,276),(250,275)])
p.edge('ask','policy',[(445,275),(480,275),(480,575),(515,575)])
p.edge('policy','allowed',[(705,575),(805,575)])
p.edge('allowed','deny',[(855,575),(1060,555)],'Não',920,535,70)
p.edge('deny','no',[(1245,555),(1320,556)])
p.edge('allowed','cancel',[(830,600),(830,690)],'Sim',845,630,70)
p.edge('cancel','yes',[(1050,725),(1260,726)],'Registrar e auditar',1060,688,190)

fan('D1-identidade','DFD | P1 — identidade, acesso e certificação','DFD lógico de nível 1 • vista 1/6 • caixas arredondadas externas ao centro são referências a outros processos.','P1\nGerir\nidentidade,\nacesso e\ncertificação',[
 ('L',0,'cliente','Cliente surdo','rect','Dados cadastrais; credenciais; recuperação','Conta/sessão; validação; resultado do acesso'),
 ('L',1,'interprete','Intérprete de Libras','rect','Perfil, credenciais e certificado; correção','Conta/sessão; resultado documental'),
 ('L',2,'backoffice','Backoffice','rect','Parecer e justificativa de análise','Documentação e fila para análise'),
 ('R',0,'email','Serviço de e-mail','rect','Resultado do envio','Endereço e link de recuperação'),
 ('R',1,'d1','D1 | Pessoas, acesso e certificações','store','Cadastro, hash de senha, sessão e parecer','Perfil, sessão, certificado e análise atualizados'),
 ('R',3,'p6','P6 | Governança e notificações','round','','Eventos de cadastro/acesso/análise; avisos')],
 'O processo recebe dados e os transforma em contas, sessões e habilitação. Backoffice decide sobre a certificação; serviço de e-mail apenas entrega o link. D1 guarda hash de senha e tokens protegidos, nunca senha em claro. Consentimento/perfil e auditoria são coordenados por P6.',
 'RF01–RF09; RNF05–RNF08, RNF34–RNF36. D1 e P6 são os mesmos em todas as vistas.')
fan('D2-solicitacoes','DFD | P2 — solicitação, distribuição e agenda','DFD lógico de nível 1 • vista 2/6 • fluxos nomeiam dados, não ordem de execução.','P2\nGerir\nsolicitações,\nbusca e\nagenda',[
 ('L',0,'cliente','Cliente surdo','rect','Serviço, data, duração, local; confirmação/cancelamento','Estimativa; status; intérprete; resultado do cancelamento'),
 ('L',1,'interprete','Intérprete de Libras','rect','Raio, disponibilidade; aceite/recusa','Demandas, mapa e agenda atualizada'),
 ('L',2,'mapas','Serviço de mapas','rect','Endereço, coordenadas, rotas e distâncias','Consulta de endereço, rota e distância'),
 ('L',3,'p6','P6 | Governança e notificações','round','','Eventos de aceite/cancelamento; avisos'),
 ('R',0,'d1','D1 | Pessoas, acesso e certificações','store','Perfil aprovado e endereço-base',''),
 ('R',1,'d2','D2 | Solicitações e agenda','store','Solicitação, agenda, raio e disponibilidade','Cotação; solicitação; aceite/recusa; agenda'),
 ('R',2,'d5','D5 | Comprovantes e avaliações','store','Reputação calculada do intérprete','')],
 'D2 registra a busca, o vínculo exclusivo e a disponibilidade. A seleção combina habilitação em D1, agenda em D2 e reputação em D5. A recusa é individual. Cancelamento valida a política antes de alterar D2. A fórmula de estimativa não é inventada; é uma regra de negócio ainda a detalhar.',
 'RF10–RF25; RNF03, RNF24, RNF27, RNF36, RNF43. Relação com BPMN B2, B3 e B6; estados em E1.')
fan('D3-atendimento','DFD | P3 — execução presencial e suporte','DFD lógico de nível 1 • vista 3/6 • localização é temporária, autorizada e vinculada ao atendimento.','P3\nCoordenar\nencontro e\nregistrar\natendimento',[
 ('L',0,'cliente','Cliente surdo','rect','Mensagens/fotos; solicitação de QR e suporte','Conversa/localização; QR; status e suporte'),
 ('L',1,'interprete','Intérprete de Libras','rect','Mensagens/fotos; leitura QR; encerramento; suporte','Conversa/localização; validação; duração real'),
 ('L',2,'gps','Localização do dispositivo','rect','Posição, precisão e instante da leitura','Pedido autorizado de posição; parada'),
 ('L',3,'suporte','Suporte','rect','Resposta e situação do chamado','Chamado; data, hora e localização permitida'),
 ('R',0,'d1','D1 | Pessoas, acesso e certificações','store','Participantes e consentimento de localização',''),
 ('R',1,'d2','D2 | Solicitações e agenda','store','Vínculo, estado, local e horário previsto','Estado em andamento ou concluída'),
 ('R',2,'d3','D3 | Atendimento e comunicação','store','Conversa; check-in; início e chamados','Mensagens/fotos; QR; início/fim; duração; chamado'),
 ('R',3,'p6','P6 | Governança e notificações','round','','Eventos de check-in/fim; avisos de mensagens')],
 'Check-in transforma QR e posição em início validado; encerramento transforma horários em duração real. Só participantes acessam a conversa. Precisão insuficiente, QR inválido ou distância excessiva produzem falha sem iniciar o atendimento. O chamado de suporte não modifica automaticamente seu ciclo de vida.',
 'RF28–RF34; RNF21, RNF26, RNF44. Limites: distância ≤ 200 m; erro de posição ≤ 50 m. BPMN B4.')
fan('D4-financeiro','DFD | P4 — pagamento, ganhos e repasse','DFD lógico de nível 1 • vista 4/6 • o estado financeiro é independente do estado operacional.','P4\nProcessar\ncobrança,\nganhos e\nrepasse',[
 ('L',0,'cliente','Cliente surdo','rect','Meio de pagamento; autorização de cobrança','Token/meio cadastrado; valor e resultado'),
 ('L',1,'interprete','Intérprete de Libras','rect','Consulta de ganhos; pedido de repasse e conta','Extrato; saldo; resultado e previsão do repasse'),
 ('L',2,'gateway','Gateway financeiro','rect','Token; resultado de cobrança e repasse','Tokenização; cobrança Pix/cartão; repasse'),
 ('L',3,'p6','P6 | Governança e notificações','round','','Eventos financeiros e aviso de pagamento'),
 ('R',0,'d2','D2 | Solicitações e agenda','store','Cotação, participantes e eventual taxa',''),
 ('R',1,'d3','D3 | Atendimento e comunicação','store','Início/fim, duração real e conclusão',''),
 ('R',2,'d4','D4 | Financeiro','store','Token/Pix; tentativas; lançamentos; conta e saldo','Resultado; crédito/débito; reserva e repasse')],
 'O valor final deriva de registros do serviço e da política de cobrança. O gateway retorna um resultado, que gera lançamento financeiro sem duplicação. Repasse reserva saldo disponível e registra resultado. Cartão bruto não persiste em D4: a tokenização ocorre pelo gateway. Provedor e fórmula de preço não foram definidos.',
 'RF26–RF27, RF35–RF36; RNF23, RNF37; US11, US22–US23; UML DC7–DC8. BPMN B5.')
fan('D5-pos-atendimento','DFD | P5 — histórico, comprovante e avaliação','DFD lógico de nível 1 • vista 5/6 • comprovação do serviço é distinta de confirmação financeira.','P5\nProduzir\nhistórico,\ncomprovante\ne reputação',[
 ('L',0,'cliente','Cliente surdo','rect','Filtros; pedido de PDF; nota 1–5 e comentário','Histórico, PDF verificável; avaliação registrada'),
 ('L',1,'interprete','Intérprete de Libras','rect','Filtros; pedido de PDF; nota 1–5 e comentário','Histórico, PDF; avaliação e reputação'),
 ('L',2,'p6','P6 | Governança e notificações','round','','Eventos de avaliação e emissão de documento'),
 ('L',3,'d4','D4 | Financeiro','store','Situação financeira do atendimento',''),
 ('R',0,'d1','D1 | Pessoas, acesso e certificações','store','Dados e certificação do intérprete',''),
 ('R',1,'d2','D2 | Solicitações e agenda','store','Participantes, local, tipo e estado',''),
 ('R',2,'d3','D3 | Atendimento e comunicação','store','Data, início/fim e duração real',''),
 ('R',3,'d5','D5 | Comprovantes e avaliações','store','PDF, código verificável, notas e reputação','Comprovante; avaliação; reputação recalculada')],
 'O PDF usa o registro real de atendimento e inclui identificador único. A conclusão libera o comprovante independentemente da aprovação financeira. Avaliação é bilateral, uma por autor/atendimento; somente notas recebidas pelo intérprete compõem sua reputação. Exibição pública não identifica o autor.',
 'RF37–RF41; RNF29, RNF41–RNF42; US12–US13; UML DC9. D5 alimenta a ordenação de demandas em P2.')
fan('D6-governanca','DFD | P6 — privacidade, auditoria e notificações','DFD lógico de nível 1 • vista 6/6 • operações transversais preservam identificação e finalidade.','P6\nGerir perfil,\nprivacidade,\nauditoria e\nnotificações',[
 ('L',0,'cliente','Cliente surdo','rect','Perfil/preferências; consentimento; exportação/exclusão','Perfil; exportação; protocolo/status; notificações'),
 ('L',1,'interprete','Intérprete de Libras','rect','Perfil/preferências; consentimento; exportação/exclusão','Perfil; exportação; protocolo/status; notificações'),
 ('L',2,'origins','P1, P2, P3, P4 e P5\nReferências aos processos','round','Eventos críticos; dados para aviso; dados exportáveis','Pedido autorizado de dados ou tratamento LGPD'),
 ('R',0,'push','Serviço de notificações','rect','Confirmação de entrega ou falha','Destinatário e conteúdo da notificação'),
 ('R',1,'d1','D1 | Pessoas, acesso e certificações','store','Perfil, consentimentos e preferências','Perfil e consentimentos atualizados'),
 ('R',2,'d6','D6 | Governança','store','Pedidos LGPD; logs; avisos e entrega','Protocolo LGPD; eventos; notificação/status')],
 'P6 registra pedidos de exportação/exclusão e coordena o tratamento pelos módulos proprietários dos dados. A retenção de atendimento por cinco anos e a auditoria por seis meses exigem política específica: um pedido não equivale a apagar imediatamente todos os registros. Push é transporte; D6 mantém o resultado.',
 'RF42–RF45; RNF09, RNF25, RNF29, RNF33, RNF44. Leituras/tratamentos LGPD complementam P1–P5; consultar a matriz de fluxos.')

p=Page('E1-estados','Máquina de estados | solicitação e atendimento associado','UML • evento [guarda] / ação • estados de RF18; pagamento possui ciclo próprio.',
 'A criação acontece somente após confirmar o resumo. Recusa e ausência de elegíveis mantêm a busca. O aceite exclusivo cria o vínculo; só check-in válido inicia. O encerramento conclui o serviço mesmo se a cobrança falhar. Cancelamento antes do início é sujeito à política; nenhum prazo de expiração ou estado de falta foi inventado.',
 'RF16–RF19, RF22–RF23, RF31–RF33; RNF26, RNF27, RNF36; US09. Setas rotuladas são transições; pontos pretos = início/fim.')
p.text(560,185,'Eventos descritos dentro do estado são internos: não saem do estado nem repetem ações entry. Assim, suporte não reinicia o relógio e QR inválido não refaz o aceite.',16,width=790)
p.box('init',75,330,24,24,'',NAVY,kind='initial')
p.box('search',185,290,245,120,'Buscando intérprete\nentry / distribuir demanda\nrecusa / manter oferta\nsem elegíveis / aguardar',LIGHT,kind='round',size=14)
p.box('accepted',625,290,245,120,'Aceita\nentry / vincular agenda e notificar\ncheck-in inválido / informar falha',LIGHT,kind='round',size=14)
p.box('active',1080,290,275,120,'Em andamento\nentry / registrar início\nsuporte / registrar chamado',LIGHT,kind='round',size=14)
p.box('done',1080,645,275,120,'Concluída\n\nentry / parar localização; liberar pós-atendimento',LIGHT,kind='round',size=16)
p.box('cancel',625,645,260,120,'Cancelada\n\nentry / liberar agenda; notificar e auditar',LIGHT,kind='round',size=16)
p.box('final',970,705,28,28,'','white',kind='final')
p.edge('init','search',[(99,342),(185,342)],'/ registrar confirmação',60,231,215)
p.edge('search','accepted',[(430,350),(625,350)],'aceitar demanda\n[elegível e aberta]\n/ reservar exclusivamente',435,269,185)
p.edge('accepted','active',[(870,350),(1080,350)],'ler QR [QR/vínculo válidos;\ndistância ≤ 200 m;\nprecisão ≤ 50 m]',878,269,195)
p.edge('active','done',[(1217,410),(1217,645)],'encerrar [intérprete vinculado]\n/ registrar fim e duração real',1080,500,275)
p.edge('search','cancel',[(305,410),(305,705),(625,705)],'cancelar [não iniciado;\npolítica autoriza]',320,622,275)
p.edge('accepted','cancel',[(747,410),(747,645)],'cancelar [não iniciado;\npolítica autoriza]',759,508,275)
p.edge('cancel','final',[(885,719),(970,719)])
p.edge('done','final',[(1080,719),(998,719)])

p=Page('M1-rastreabilidade','Rastreabilidade | cobertura funcional','Os grupos abaixo cobrem RF01–RF45 sem alterar os identificadores das entregas originais.')
rows=[('RF01–RF09','Identidade, cadastro, certificação e acesso','C1/C2 · B1 · P1'),('RF10–RF16','Solicitação, local, duração e cotação','C1/C2 · B2 · P2 · E1'),('RF17–RF25','Distribuição, status, cancelamento e agenda','C1 · B3/B6 · P2 · E1'),('RF26–RF27','Ganhos, saldo e repasse','C1/C2 · P4'),('RF28–RF34','Comunicação, check-in, encerramento e suporte','C1/C2 · B4 · P3 · E1'),('RF35–RF36','Forma de pagamento e cobrança','C1/C2 · B5 · P4'),('RF37–RF41','Comprovante, histórico e avaliação bilateral','C1 · P5'),('RF42–RF45','Notificações, perfil, auditoria e privacidade','C1/C2 · P6')]
y=185
for a,b,c in rows:
 p.box('row'+a,48,y,1344,63,'',fill=LIGHT if int((y-185)/70)%2==0 else 'white',stroke='#d7e2ea')
 p.text(65,y+20,a,17,NAVY,bold=True,width=175);p.text(255,y+20,b,17,width=735);p.text(1030,y+20,c,16,TEAL,width=350);y+=70
p.text(55,770,'RF09 (splash) é uma apresentação do carregamento/sessão em P1, não um processo externo. RNFs de desempenho, acessibilidade, segurança e disponibilidade são restrições; estes modelos não demonstram que suas metas foram implementadas ou medidas.',17,width=1310)

p=Page('M2-decisoes','Decisões, limites e pendências do domínio','Regras confirmadas foram separadas de detalhes que as fontes ainda não definem.')
notes=[('Presencial e duração','RNF28 e RF13 prevalecem sobre os resíduos “Online”, link de reunião e 30 min dos protótipos. Duração real pode diferir da contratada.'),('Aceite, recusa e ausência','RF22 exige exclusividade; RF23 torna o motivo de recusa opcional. Sem profissional, mantém-se a busca; não foi criado tempo de expiração. Não há alocação em dupla no modelo principal.'),('Cancelamento e preço','US09 limita cancelamento ao serviço não iniciado. Prazo, taxa, fórmula da estimativa, excedentes e arredondamento devem ser definidos pelo grupo; os modelos usam política configurada sem atribuir valores.'),('Pagamento e comprovante','RF33, RF37 e US12 liberam o pós-atendimento por conclusão. Pagamento tem tentativas e resultado próprios. A proposta de repasse pelo gateway acompanha a entrega UML, sem escolher fornecedor.'),('Dados, suporte e consentimento','Chamado não cancela nem encerra automaticamente o serviço. Localização exige consentimento e cessa ao terminar. P6 coordena exportação/exclusão preservando a política de retenção; tratamento detalhado ainda precisa ser definido.'),('Validade da entrega','A capa usa a equipe e a instituição confirmadas pelo usuário. Matrículas não foram fornecidas; conferir cabeçalho oficial antes do AVA. Não há envio ao AVA, implementação do aplicativo ou validação jurídica nesta entrega.')]
y=180
for head,body in notes:
 p.text(55,y,head,17,TEAL,bold=True,width=1300);p.text(55,y+31,body,17,width=1320);y+=119

p=Page('M3-referencias','Referências e arquivos de origem','Originais preservados; inventário com caminhos e SHA-256 em projeto/inventario-importacao.json.')
refs=[('1. Guia da atividade','PIRES, Luis Fernando dos Santos. Especificação e Modelagem Integral de Sistemas. Engenharia de Software, atividade curricular prática, 2 páginas. Entregáveis e critérios: pp. 1–2. Arquivo: referencias/modelagem-sistemas/guia-atividade-pratica.pdf.'),('2. Material da disciplina','PIRES, Luis Fernando dos Santos. Introdução à Modelagem de Sistemas. 22 slides. Contexto: slides 4–6; processos/BPMN: 7–10; DFD: 11–14; estados: 15–19; ferramentas CASE: 20–21.'),('3. Requisitos do Víamos','ENTREGA VIAMOS COMPLETA.xlsx: seis abas; RF01–RF45, RNF01–RNF45, associações, mapa de histórias e backlog. Planilha separada de 02/09 e DOCX com link preservados em entregas/anteriores/Engenharia de Requisitos/.'),('4. Contexto e produto','projeto/documentacao/: context.md_projeto_v_amos.md, prd_projeto_v_amos.md, Briefing_Projeto_Viamos.md e DESIGN.md. O briefing é referência histórica, confrontada com os arquivos do ZIP atual.'),('5. Arquitetura e protótipos','entregas/anteriores/30-09/: Viamos_Entrega_Arquitetura_UML.pdf e Viamos_Diagramas_Editaveis.drawio (23 vistas). projeto/prototipos/Arquivos Stitch/: 12 HTMLs, 12 PNGs e DESIGN.md. Protótipos não representam uma aplicação integrada.'),('6. Reprodução e revisão','A pasta fontes/ contém o gerador comum. diagramas/ contém SVGs vetoriais por página; Viamos_Modelagem_Editavel.drawio permite edição no diagrams.net. Viamos_Modelagem_Sistemas.pdf reúne as quatro categorias solicitadas e suas justificativas.')]
y=180
for title,body in refs:
 p.text(55,y,title,17,TEAL,bold=True,width=1300);p.text(55,y+31,body,16,width=1320);y+=120

# Renderização única para PDF, SVG e Draw.io (notação vetorial editável).
def path_pdf(c,pts,close=False):
 q=c.beginPath();q.moveTo(pts[0][0],H-pts[0][1])
 for x,y in pts[1:]:q.lineTo(x,H-y)
 if close:q.close()
 return q

def render():
 OUT.mkdir(exist_ok=True);(OUT/'diagramas').mkdir(exist_ok=True)
 doc=canvas.Canvas(str(OUT/'Viamos_Modelagem_Sistemas.pdf'),pagesize=landscape(A3),pageCompression=1,invariant=1)
 doc.setTitle('Víamos — Especificação e Modelagem Integral de Sistemas')
 doc.setAuthor('Lúcio Vecchio; Gustavo Pires; Felipe Mathey')
 mx=ET.Element('mxfile',host='app.diagrams.net',version='24.7.17',type='device')
 issues=[]
 for number,p in enumerate(PAGES,1):
  p.line([(48,970),(1392,970)],'#cbd5df',1)
  p.text(48,978,'FECAP • Ciência da Computação • 4º semestre | '+p.id,11,'#526578',width=1100)
  p.text(1280,978,f'{number:02d} / {len(PAGES):02d}',11,'#526578',width=110,align='right')
  dw,dh=landscape(A3);doc.saveState();doc.scale(dw/W,dh/H)
  svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title"><title id="title">{html.escape(p.title)}</title><rect width="100%" height="100%" fill="white"/>']
  diagram=ET.SubElement(mx,'diagram',id=p.id,name=p.id+' | '+p.title)
  model=ET.SubElement(diagram,'mxGraphModel',dx='1440',dy='1000',grid='1',gridSize='10',guides='1',tooltips='1',connect='1',arrows='1',fold='1',page='1',pageScale='1',pageWidth=str(W),pageHeight=str(H),math='0',shadow='0')
  root=ET.SubElement(model,'root');ET.SubElement(root,'mxCell',id='0');ET.SubElement(root,'mxCell',id='1',parent='0')
  count=0
  def textdraw(item,cell=True):
   nonlocal count
   x,y,size,width=item['x'],item['y'],item['size'],item['w'];lines=wrap(item['text'],width,size,item.get('bold',False));lh=size*1.3
   if y+len(lines)*lh>H+1:issues.append(f'{p.id}: texto fora da página: {item["text"][:60]}')
   if item['kind']=='label':
    doc.setFillColor(HexColor('white'));doc.rect(x-3,H-y-len(lines)*lh-3,width+6,len(lines)*lh+6,fill=1,stroke=0)
    svg.append(f'<rect x="{x-3}" y="{y-3}" width="{width+6}" height="{len(lines)*lh+6}" fill="white"/>')
   font='DejaVuB' if item.get('bold') else 'DejaVu';doc.setFont(font,size);doc.setFillColor(HexColor(item['color']))
   for i,line in enumerate(lines):
    tx=x;anchor='start';align=item.get('align','left')
    if align=='center':tx=x+width/2;anchor='middle'
    elif align=='right':tx=x+width;anchor='end'
    ty=y+size+i*lh
    if align=='center':doc.drawCentredString(tx,H-ty,line)
    elif align=='right':doc.drawRightString(tx,H-ty,line)
    else:doc.drawString(tx,H-ty,line)
    svg.append(f'<text x="{tx}" y="{ty}" font-family="DejaVu Sans, sans-serif" font-size="{size}" font-weight="{700 if item.get("bold") else 400}" fill="{item["color"]}" text-anchor="{anchor}">{html.escape(line)}</text>')
   if cell:
    count+=1;style=f'text;html=0;whiteSpace=wrap;align={item.get("align","left")};verticalAlign=middle;fontFamily=DejaVu Sans;fontSize={size};fontColor={item["color"]};fontStyle={1 if item.get("bold") else 0};strokeColor=none;fillColor={"#ffffff" if item["kind"]=="label" else "none"};'
    c=ET.SubElement(root,'mxCell',id=f't{count}',value=item['text'],style=style,vertex='1',parent='1');ET.SubElement(c,'mxGeometry',x=str(x),y=str(y),width=str(width),height=str(len(lines)*lh),**{'as':'geometry'})
  for item in p.items:
   kind=item['kind']
   if kind in ['text','label']:textdraw(item);continue
   if kind in ['line','edge']:
    pts=item['pts'];color=item['color'];sw=item['sw'];dash=item['dash']
    doc.setStrokeColor(HexColor(color));doc.setLineWidth(sw);doc.setDash([7,5] if dash else [])
    doc.drawPath(path_pdf(doc,pts),stroke=1,fill=0)
    svg.append(f'<polyline points="{" ".join(str(x)+","+str(y) for x,y in pts)}" fill="none" stroke="{color}" stroke-width="{sw}"'+(' stroke-dasharray="7 5"' if dash else '')+'/>')
    if kind=='edge':
     (x1,y1),(x2,y2)=pts[-2:];ang=math.atan2(y2-y1,x2-x1);length=10
     a=(x2-length*math.cos(ang-.43),y2-length*math.sin(ang-.43));b=(x2-length*math.cos(ang+.43),y2-length*math.sin(ang+.43))
     doc.setDash([]);doc.setFillColor(HexColor(color));doc.drawPath(path_pdf(doc,[a,(x2,y2),b],not dash),stroke=1,fill=0 if dash else 1)
     svg.append(f'<polyline points="{a[0]},{a[1]} {x2},{y2} {b[0]},{b[1]}" fill="{"none" if dash else color}" stroke="{color}" stroke-width="1.4"/>')
     if dash:
      x0,y0=pts[0];doc.setFillColor(HexColor('white'));doc.circle(x0,H-y0,3,fill=1,stroke=1);svg.append(f'<circle cx="{x0}" cy="{y0}" r="3" fill="white" stroke="{color}"/>')
    count+=1;attrs=dict(id=f'e{count}',value='',edge='1',parent='1')
    style=f'edgeStyle=none;rounded=0;html=0;strokeColor={color};strokeWidth={sw};endArrow={"open" if dash else "block" if kind=="edge" else "none"};dashed={1 if dash else 0};'
    if kind=='edge':
     attrs.update(source=item['a'],target=item['b'])
     for prop,nodekey,point in [('exit','a',pts[0]),('entry','b',pts[-1])]:
      n=p.nodes[item[nodekey]];style+=f'{prop}X={(point[0]-n["x"])/n["w"]};{prop}Y={(point[1]-n["y"])/n["h"]};{prop}Perimeter=0;'
    attrs['style']=style;c=ET.SubElement(root,'mxCell',**attrs);g=ET.SubElement(c,'mxGeometry',relative='1',**{'as':'geometry'})
    for name,point in [('sourcePoint',pts[0]),('targetPoint',pts[-1])]:ET.SubElement(g,'mxPoint',x=str(point[0]),y=str(point[1]),**{'as':name})
    if len(pts)>2:
     arr=ET.SubElement(g,'Array',**{'as':'points'})
     for x,y in pts[1:-1]:ET.SubElement(arr,'mxPoint',x=str(x),y=str(y))
    continue
   x,y,w,h=item['x'],item['y'],item['w'],item['h'];stroke=item['stroke'];fill=item['fill'];sw=4 if kind=='end' else 1.8
   if x<0 or y<0 or x+w>W or y+h>H:issues.append(p.id+': forma fora da página '+item['id'])
   doc.setDash([]);doc.setStrokeColor(HexColor(stroke));doc.setFillColor(HexColor(fill));doc.setLineWidth(sw)
   common=f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"'
   shape='rounded=0;'
   if kind in ['start','end','wait','initial','final']:
    doc.ellipse(x,H-y-h,x+w,H-y,fill=1,stroke=1);svg.append(f'<ellipse cx="{x+w/2}" cy="{y+h/2}" rx="{w/2}" ry="{h/2}" {common}/>');shape='ellipse;'
    if kind in ['wait','final']:
     doc.ellipse(x+5,H-y-h+5,x+w-5,H-y-5,fill=1 if kind=='final' else 0,stroke=1)
     if kind=='final':doc.setFillColor(HexColor(stroke));doc.circle(x+w/2,H-y-h/2,w/2-6,fill=1,stroke=0)
     svg.append(f'<ellipse cx="{x+w/2}" cy="{y+h/2}" rx="{w/2-5}" ry="{h/2-5}" fill="{stroke if kind=="final" else "none"}" stroke="{stroke}"/>');shape='shape=doubleEllipse;'
     if kind=='wait':
      doc.setLineWidth(.8);doc.rect(x+11,H-y-22,10,13,fill=0,stroke=1)
      for yy in [y+12,y+16,y+20]:doc.line(x+13,H-yy,x+19,H-yy)
      svg.append(f'<path d="M {x+11} {y+9} h 10 v 13 h -10 Z M {x+13} {y+12} h 6 M {x+13} {y+16} h 6 M {x+13} {y+20} h 6" fill="none" stroke="{stroke}" stroke-width=".8"/>')
      shape='shape=mxgraph.bpmn.event;outline=catching;symbol=conditional;'
   elif kind=='diamond':
    pts=[(x+w/2,y),(x+w,y+h/2),(x+w/2,y+h),(x,y+h/2)];doc.drawPath(path_pdf(doc,pts,True),fill=1,stroke=1);svg.append(f'<polygon points="{" ".join(str(a)+","+str(b) for a,b in pts)}" {common}/>');shape='rhombus;'
   elif kind=='store':
    doc.setFillColor(HexColor(fill));doc.rect(x,H-y-h,w,h,fill=1,stroke=0)
    for yy in [y,y+h]:doc.line(x,H-yy,x+w,H-yy)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/><path d="M {x} {y} H {x+w} M {x} {y+h} H {x+w}" stroke="{stroke}" fill="none" stroke-width="1.8"/>');shape='shape=partialRectangle;top=1;bottom=1;left=0;right=0;'
   else:
    radius=15 if kind=='round' else 0
    doc.roundRect(x,H-y-h,w,h,radius,fill=1,stroke=1);svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" {common}/>');shape='rounded=1;arcSize=12;' if radius else 'rounded=0;'
   style=shape+f'whiteSpace=wrap;html=0;fillColor={fill};strokeColor={stroke};strokeWidth={sw};fontColor={INK};fontSize={item["size"]};fontFamily=DejaVu Sans;align=center;verticalAlign=middle;spacing=8;'
   c=ET.SubElement(root,'mxCell',id=item['id'],value=item['text'],style=style,vertex='1',parent='1');ET.SubElement(c,'mxGeometry',x=str(x),y=str(y),width=str(w),height=str(h),**{'as':'geometry'})
   if kind=='final':
    inner=ET.SubElement(root,'mxCell',id='inner_'+item['id'],value='',style='ellipse;fillColor='+stroke+';strokeColor='+stroke+';',vertex='1',parent='1')
    ET.SubElement(inner,'mxGeometry',x=str(x+6),y=str(y+6),width=str(w-12),height=str(h-12),**{'as':'geometry'})
   if item['text']:
    lines=wrap(item['text'],w-20,item['size']);th=len(lines)*item['size']*1.3
    if th>h-8:issues.append(f'{p.id}: texto excede caixa {item["id"]}')
    textdraw(dict(kind='text',x=x+10,y=y+(h-th)/2,w=w-20,text=item['text'],size=item['size'],color=INK,bold=False,align='center'),cell=False)
  svg.append('</svg>');(OUT/'diagramas'/f'{p.id}.svg').write_text('\n'.join(svg),encoding='utf-8')
  doc.restoreState();doc.showPage()
 doc.save();ET.indent(mx);ET.ElementTree(mx).write(OUT/'Viamos_Modelagem_Editavel.drawio',encoding='utf-8',xml_declaration=True)
 (OUT/'fontes/modelos.json').write_text(json.dumps([{'id':p.id,'titulo':p.title,'nodes':p.nodes,'edges':p.edges} for p in PAGES],ensure_ascii=False,indent=2)+'\n')
 if issues:raise RuntimeError('\n'.join(issues))
 print(f'Gerados: PDF com {len(PAGES)} páginas, {len(PAGES)} SVGs e Draw.io editável.')
if __name__=='__main__':render()
