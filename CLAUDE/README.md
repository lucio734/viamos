# Passagem de bastão do Víamos

- [Gustavo e Claude](contexto_atual_claude.md)
- [Lúcio e ChatGPT](contexto_atual_chatgpt.md)

Esta pasta reúne os relatórios temporários e as instruções de retomada. Registre no [registro permanente](../docs/REGISTRO_TRABALHO.md) as decisões finais, as evidências de teste e os links do deploy antes de retirar a pasta. Após concluir a implementação, validar os fluxos e confirmar a publicação da versão final, a pasta `CLAUDE/` pode ser removida como unidade.

## Regra de limpeza final

Execute esta etapa após concluir a implementação, os testes, o deploy final e a conferência das entregas na estrutura prevista no [roteiro do professor](../Entregas/Produ%C3%A7%C3%A3o%20T%C3%A9cnica/DOC.txt).

1. Compare a entrega com o roteiro e confirme que o DOCX, o PDF e as evidências da versão final estão disponíveis. Registre o resultado no [registro permanente](../docs/REGISTRO_TRABALHO.md).
2. Revise as pastas e arquivos auxiliares que não fazem parte da documentação oficial. Exclua os que já não tiverem uso. Preserve o código, os testes, os arquivos de configuração e as fontes que ainda forem necessárias para executar, publicar, conferir ou regerar a entrega.
3. As 33 rotas de tela têm componentes implementados. Valide o comportamento dos fluxos na etapa final. Se a validação encontrar uma tela ausente ou incompleta, registre a rota, o requisito e a referência visual no [plano](../docs/PLANO_BLOCOS.md) antes da limpeza. Os HTMLs exportados do Stitch são candidatos à remoção quando deixarem de ser referência. As imagens ainda são lidas pelo gerador da Produção Técnica, e o item do Figma segue pendente (P-01).
4. Confira os links e as dependências após a limpeza. Retire esta pasta de passagem de bastão por último e publique o commit de encerramento na main.
