# Validação da entrega

Resultado: **verificações automáticas aprovadas**.

- 34 arquivos originais conferidos contra SHA-256 do ZIP.
- 20 páginas no PDF e no Draw.io; 20 SVGs válidos.
- PDF vetorial com texto selecionável e sem texto fora da página.
- XML/SVG analisados; IDs e ligações consistentes.
- Fluxos não atravessam o interior de outras tarefas/estados/entidades.
- Todos os elementos dos seis BPMNs são alcançáveis a partir do início; gateways têm alternativas e elementos não terminais têm saída.
- DFDs usam processos entre entidades/depósitos.
- RF01–RF45 presentes na matriz de rastreabilidade.

Revisão visual realizada nas páginas e no conjunto de miniaturas; foram ajustados rótulos de dados, contornos e a rota de repetição do pagamento. Revisão documental confrontou as regras com as duas planilhas, os documentos, os protótipos e a entrega UML anterior. As planilhas coincidem após remover a coluna adicional Versão da entrega separada; as associações também coincidem.

Essas verificações validam os artefatos e sua estrutura, não substituem a avaliação acadêmica da semântica. Não foi executado um aplicativo, pois a pasta contém documentação e protótipos independentes. Matrículas e conferência do cabeçalho institucional permanecem pendentes para submissão.

Reexecutar: `python3 entregas/modelagem-sistemas/fontes/validar_entrega.py`.
