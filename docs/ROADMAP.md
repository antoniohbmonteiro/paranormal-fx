# Roadmap

## 0.1.2

- Corrigir posicionamento da Eletrocussão Discente ao rotacionar a `rectangleRay`.
- Calcular a linha visual pelo início da forma, largura da faixa e direção, evitando usar o centro do bounding box rotacionado.

## 0.1.1

- Preset inicial para `ritual.eletrocussao` Discente em área `rectangleRay`.
- Asset padrão: `jb2a.chain_lightning.primary.blue.60ft`.
- Posicionamento em linha: início da área até o fim da `rectangleRay`, sem usar alvos como caminho visual.
- Normalização do payload público atual do Paranormal Toolkit, com compatibilidade defensiva para payloads legados.

## 0.1.0

- Estrutura inicial com TypeScript, Vite e ES Modules.
- Manifesto Foundry v14+ apontando para `dist/main.js`.
- Validação inicial de dependências: Paranormal Toolkit, Sequencer e JB2A.
- Listener dos hooks públicos de ritual do Paranormal Toolkit.
- Registry de presets visuais.
- Adapter isolado para Sequencer.

## Próximos passos

- Melhorar cálculo de variantes JB2A por tamanho real da área.
- Adicionar settings para ativar/desativar presets.
- Adicionar suporte a som por preset.
- Adicionar hooks/eventos internos para debug e futuras integrações.
