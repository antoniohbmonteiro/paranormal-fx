# Roadmap

## Em desenvolvimento — animações automáticas de armas v1

- Catálogo fechado de 38 armas, com 26 datapaths do JB2A Free; sete armas sem associação.
- Hook local `paranormal-toolkit.attack.published` v1 para ataques nativos e gerenciados.
- Um efeito no primeiro ataque elegível de cada acionamento; sem replay de cards.
- Setting mundial **Animações automáticas de armas**, habilitado por padrão.
- Seleção de distância e variantes delegada ao Sequencer; melee orientado, projéteis
  esticados ao alvo e Lança-chamas com escala transversal preservada.
- Ataques privados, tokens ocultos e referências ausentes/ambíguas não são animados.
- Sem mudanças mecânicas, migração de flags, editor de associações ou assets distribuídos.

Validação automatizada em 20/10/2026: `npm run check` passou com 195 testes,
typecheck e build, incluindo referências locais do JB2A Free 0.9.4, Sequencer
4.3.0 e compêndio Ordem 8.0.2. A regressão de rituais cobre as três formas de
Eletrocussão e o intervalo de 500 ms. O Toolkit passou com 1.331 testes e as
referências locais do Ordem/Foundry 14.369 habilitadas.

### Validação manual pendente

A porta local 30000 não estava acessível durante a implementação. A verificação
de arquivos JB2A e os testes com fontes do Foundry/Ordem não substituem um mundo real.
Antes de considerar a feature validada em mesa, verificar em Foundry v14 com GM,
jogador executor e um terceiro jogador:

- Pistola, Fuzil de Assalto, Espingarda e Bazuca: um efeito por acionamento.
- Snipe em distâncias diferentes e Katana em ataques sucessivos, conferindo variantes.
- Melee, Acha/halberd, Corrente/flail e largura/orientação da linha do Lança-chamas.
- Ataques nativos, do card Toolkit, diretos, de jogador e GM; cancelamento do diálogo.
- Vários ataques/alvos, inclusive primeira entrada cancelada/sem alvo: primeiro válido somente.
- Reações e acerto/erro/crítico: nenhum resultado exposto pelo efeito ou duplicação.
- Privado/cego/pessoal, tokens ocultos, fog e níveis: nenhum vazamento visual ao terceiro cliente.
- Alvo removido ou ambíguo e arma sem associação: silêncio; reload do chat: nenhum replay.
- Eletrocussão Padrão, Discente e Verdadeira (500 ms entre raios), além de dano/cura flutuantes.

O projeto ainda não recebeu bump de versão ou publicação por esta implementação.

## 0.3.0

- Exibir texto flutuante nativo de dano e cura pela variação final de PV/HP.
- Hidratar snapshots no carregamento da cena e separar Actors vinculados de sintéticos.
- Restringir o feedback de jogadores a OBSERVER+, Tokens não ocultos e visualmente disponíveis.
- Adicionar setting de cliente e cobertura unitária da lógica pura.

## 0.2.1

- Adicionar preset visual para Eletrocussão Verdadeira (`form: true`).
- Posicionar um raio do conjurador até cada alvo confirmado.
- Aplicar atraso de 500 ms entre os disparos, sem depender de rotação/facing do token.
- Manter Eletrocussão Padrão e Discente sem alteração de regra.

## 0.2.0

- Adicionar preset visual para Eletrocussão Padrão (`form: standard`).
- Posicionar o efeito do conjurador até o alvo único usando `sourceToTargetLine`.
- Calcular a origem na borda do token do conjurador voltada para o alvo, sem depender de facing/rotação do token.
- Manter Eletrocussão Discente em `rectangleRayLine` sem alteração de regra.

## 0.1.4

- Configurar o manifesto para publicação via GitHub Releases.
- Trocar o `manifest` para `releases/latest/download/module.json`.
- Adicionar `download` apontando para o asset `paranormal-fx.zip` da release.
- Não altera comportamento, presets, hooks, Sequencer ou integração JB2A.

## 0.1.3

- Adicionar logs diagnósticos para confirmar se o Toolkit está enviando `shape.direction`, `ray.start/end`, `bounds`, `center` e `shape` corretamente.
- Logar o `placement` final enviado ao Sequencer, incluindo start/end, delta, distância e ângulo.
- Não altera regra nem comportamento do Toolkit.

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
