# Modelagem integral do Víamos

**Diagramas concluídos.** A entrega aplica o guia ao contexto completo do projeto: atendimento presencial, intérprete habilitado, busca por proximidade, check-in, financeiro e pós-atendimento.

## Arquivos

- [PDF unificado — 20 páginas](Viamos_Modelagem_Sistemas.pdf).
- [Draw.io editável — todas as páginas](Viamos_Modelagem_Editavel.drawio): abrir em diagrams.net.
- [SVGs vetoriais](diagramas/): uma página por arquivo.
- [Rastreabilidade dos 45 RF](rastreabilidade.md).
- [Dicionário de dados e fluxos](dicionario-fluxos.md).
- [Validação dos artefatos](validacao.md).
- [Análise integral da pasta](../../projeto/analise-contexto.md).

## Conteúdo do PDF

| Páginas | Conteúdo |
| --- | --- |
| 1–2 | Capa, escopo, fontes e notações |
| 3–4 | Contexto: pessoas/operação e integrações externas |
| 5–10 | BPMN: habilitação, solicitação, distribuição/aceite, execução, pagamento e cancelamento |
| 11–16 | DFD lógico de nível 1: seis vistas do mesmo modelo, com processos e depósitos compartilhados |
| 17 | Máquina de estados da solicitação e do atendimento associado |
| 18–20 | Rastreabilidade, decisões, pendências e referências |

Cada diagrama tem justificativa e referências. As vistas complementares não são sistemas diferentes. O PDF é vetorial em A3 paisagem para preservar a legibilidade; pode ser consultado com zoom ou impresso em A3.

## Reprodução

Na raiz do repositório, com Python 3, ReportLab e as fontes DejaVu Sans instalados:

```bash
python3 entregas/modelagem-sistemas/fontes/gerar_entrega.py
python3 entregas/modelagem-sistemas/fontes/validar_entrega.py
```

A validação adicional usa PyMuPDF. O gerador usa a biblioteca padrão e ReportLab; preserva os arquivos originais e recria PDF, SVGs, Draw.io e `fontes/modelos.json`. `gerar_entrega.py` é a fonte dos modelos; `modelos.json` é uma exportação para inspeção, não uma entrada do gerador. Edições manuais no Draw.io devem ser guardadas separadamente antes de regenerar.

## Antes de enviar ao AVA

Completar as matrículas dos três integrantes e conferir o cabeçalho institucional exigido. A instituição, curso, semestre e equipe já estão na capa. Taxas, prazos de cancelamento e fórmula de preço não foram inventados; as lacunas estão explicitadas.

O guia exige um único PDF; o arquivo acima é o documento consolidado. Os editáveis e SVGs ficam no repositório para manutenção. Não houve envio ao AVA.
