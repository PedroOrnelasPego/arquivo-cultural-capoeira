# Changelog - Arquivo Cultural Capoeira

## [1.1.0] - 2026-03-18

### Novidades e Melhorias 🚀
- **Trava de Segurança (Revisão):** Implementado selo de verificação "Item Revisado" que bloqueia edições acidentais em registros finalizados.
- **Upload de Exemplares:** Corregido bug crítico onde novas imagens de exemplares sobrescreviam as anteriores. Agora a ordem dos slots (Capa, Verso, Encarte, Disco) é preservada fielmente.
- **Estabilidade no Upload:** Melhorado o tratamento de erros e logs no backend para garantir que exclusões de arquivos no Azure Storage ocorram sem falhas silenciosas.
- **Interface Administrativa:** Ajustes visuais nos campos de entrada e botões para indicar estados desabilitados.
