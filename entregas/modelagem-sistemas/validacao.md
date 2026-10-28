# Validação da entrega

Resultado: **verificações automáticas aprovadas**.

- 34 arquivos originais conferidos contra SHA-256 do ZIP.
- 17 páginas A4 verticais no PDF; capa, introdução e 15 diagramas inteiros, um por página.
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
