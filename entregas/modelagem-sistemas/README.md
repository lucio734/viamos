# Modelagem integral do Víamos

[PDF de submissão — A4 horizontal, preto e branco](Viamos_Modelagem_Sistemas.pdf).

O PDF tem capa simples com FECAP, Ciência da Computação, CCOMP4/NOTURNO, equipe e professor Luis Fernando dos Santos Pires; depois, um parágrafo de introdução e uma explicação breve em cada página de diagrama. Usa margens de 3 cm (superior/esquerda) e 2 cm (inferior/direita), texto em fonte serifada de 12 pt e entrelinha de 1,5.

Os 15 diagramas aprovados mantêm o conteúdo, as conexões, os símbolos e a geometria. Cada desenho aparece inteiro em uma única página, sem recortes ou divisão em metades, totalizando **17 páginas**. A escala é uniforme e os desenhos continuam vetoriais. As cores foram substituídas por preto e branco no PDF.

## Arquivos

- [PDF completo](Viamos_Modelagem_Sistemas.pdf).
- [Pacote completo atualizado](../pacotes/Viamos_Entrega_Modelagem.zip).
- [Draw.io original editável](Viamos_Modelagem_Editavel.drawio) e [SVGs originais](diagramas/): preservam a apresentação aprovada dos modelos; a nova formatação acadêmica aplica-se ao PDF.
- [Rastreabilidade dos 45 RF](rastreabilidade.md), [dicionário de fluxos](dicionario-fluxos.md) e [validação](validacao.md).
- [Análise integral do projeto](../../projeto/analise-contexto.md).

## Organização do PDF

| Páginas | Conteúdo |
| --- | --- |
| 1 | Capa |
| 2 | Introdução |
| 3–4 | Contexto: pessoas/operação e integrações |
| 5–10 | BPMN: habilitação, solicitação, distribuição/aceite, execução, pagamento e cancelamento |
| 11–16 | DFD lógico: identidade, solicitação, atendimento, financeiro, pós-atendimento e governança |
| 17 | Máquina de estados |

Cada página de diagrama contém a figura completa e seu parágrafo explicativo. As páginas de detalhes recortados foram removidas.

## Reprodução

Na raiz do repositório, com Python 3, ReportLab, PyMuPDF e as fontes DejaVu Sans e Liberation Serif instaladas:

```bash
python3 entregas/modelagem-sistemas/fontes/formatar_pdf.py
python3 entregas/modelagem-sistemas/fontes/validar_entrega.py
```

Os dados da capa ficam em [fontes/submissao.json](fontes/submissao.json). Preencher as matrículas nesse arquivo e executar os comandos acima para atualizar a capa. O gerador `formatar_pdf.py` usa a fonte diagramática aprovada em um diretório temporário, altera somente a apresentação do PDF e registra a paginação em `fontes/formatacao_pdf.json`.

`gerar_entrega.py` mantém o formato original dos editáveis; sua execução direta também restaura o PDF antigo em A3. Para produzir o PDF de submissão, utilizar `formatar_pdf.py`.

## Pendência para submissão

**As matrículas ficaram de fora por solicitação do usuário.** Acrescentá-las antes de enviar ao AVA para cumprir integralmente a seção 5 do guia. A capa usa a identificação acadêmica informada e apresentação inspirada no padrão ABNT; não foi fornecido um modelo adicional de cabeçalho institucional. Não houve envio ao AVA.
