# Roadmap

## 0.5.0 — sons automáticos de armas com PSFX

- Perfis sonoros associados ao catálogo existente, sem ampliar suas 38 armas.
- Seleção por disponibilidade: Rifle/Shotgun/Musket → Revolver → somente visual.
- Sons gratuitos de Sword, Spear, Light/Heavy Swoosh e Longbow; Acha e Montante
  usam Heavy. As variantes permanecem sob controle do Sequencer.
- Uma sequência por acionamento, com visual antes do áudio e sem espera sonora
  para iniciar o visual; falha de montagem sonora usa uma sequência visual nova,
  ainda não iniciada. Nenhuma tentativa de recuperação repete um visual iniciado.
- Armas automáticas usam 20 disparos a cada 100 ms e ganho de 0,5 por disparo.
  Isso independe da opção mecânica Rajada. Espingarda de Cano Duplo usa um som.
- Settings mundiais de ativação (ligado) e volume (50%), aplicados sem recarga.
  O mute individual usa os controles existentes do Foundry/Sequencer.
- PSFX opcional, consulta silenciosa e invalidação de cache por namespace.
- Pré-carregamento local em segundo plano dos arquivos dos perfis utilizados,
  incluindo variantes, faixas do Longbow e candidatos pagos registrados. Máximo
  de dois arquivos simultâneos, sem barra, reprodução ou socket próprio.
- Besta/Balestra usam Longbow, conforme ajuste solicitado pelo usuário;
  Bazuca/Lança-chamas não têm associação sonora nesta versão.
- Nenhuma mudança no Toolkit, Ordem, flags persistidas ou resultado dos ataques;
  nenhum asset redistribuído ou dependência npm acrescentada.

As responsabilidades estão divididas entre catálogo visual (associação), perfis
sonoros (dados), resolver (candidatos e volume), service (elegibilidade e reserva
do acionamento), banco (disponibilidade) e adapter (composição da sequência).
Os hooks e payloads públicos permanecem os mesmos.

### Validação automatizada

Em 21/10/2026, `npm run check` passou com typecheck, 329 testes em 19 suites e
build, com referências locais de JB2A Free 0.9.4, PSFX Free 0.18.0, Sequencer
4.3.0 e Ordem 8.0.2 habilitadas. As regressões abrangem perfis e fallbacks, rajadas,
fila limitada, deduplicação, candidatos pagos opcionais, falhas, registro tardio
do banco e pausa/retomada por configuração.

As referências de PSFX Free 0.18.0 e Sequencer 4.3.0 confirmam arquivos gratuitos,
coleções e faixas do Longbow. O runtime Foundry substituído cobre repetição nativa,
visual iniciado durante carregamento sonoro pendente, falha de execução sonora
injetada no agendador e propagação solicitada antes da reprodução local, inclusive
com o executor silenciado. Esses testes não reproduzem áudio nem usam sockets.
Rifle, Shotgun e Musket são candidatos não validados na edição paga; fixtures
unitárias verificam sua preferência quando presentes, sem afirmar acesso a assets.

### Validação manual e cenários de regressão

O usuário confirmou testes da funcionalidade no Foundry e aprovou o resultado
antes da release 0.5.0. A configuração final solicitada é de 20 tiros a cada 100 ms,
com Longbow também em Besta/Balestra. Essa confirmação não comprova individualmente
todos os cenários abaixo, especialmente multiplayer, cache frio e edição paga.
Mantê-los como regressões em Foundry v14 com GM, jogador executor e terceiro
cliente, usando Sequencer, JB2A Free e PSFX Free:

- Conferir todos os perfis, variantes e sincronização entre som e animação,
  incluindo Sword/Spear com seu silêncio inicial e Longbow nas cinco faixas.
- Validar o padrão solicitado de 20 disparos com intervalo de 100 ms, mantendo uma
  única animação e volume por disparo de 25% no padrão mundial de 50%.
  Avaliar transientes, caudas sobrepostas, volume e sincronização.
  Repetir com Rifle quando
  esse asset estiver legitimamente disponível.
- Conferir `psfx.ranged-weapons.longbow.v1` junto da animação existente
  `jb2a.bolt.physical.orange`, fornecendo origem/destino e `globalSound(true)`.
  Besta/Balestra agora recebem o perfil `longbow` no catálogo por solicitação
  do usuário; confirmar a reprodução e sincronização sonora em mesa.
- Verificar ausência/desativação do PSFX, datapath inexistente e arquivo registrado
  inválido: o visual permanece, sem replay. Não presumir que `softFail` resolve
  erros internos de carregamento do Sequencer/Foundry.
- Verificar volume mundial zero, ativação/desativação sem recarga, volume local e
  mute do executor sem silenciar os outros dois clientes.
- Entrar com cache frio e liberar o áudio do navegador antes de atacar; conferir
  o pré-carregamento dos 30 sons gratuitos e de cada candidato pago disponível,
  com até dois arquivos em andamento por cliente. Comparar a primeira rajada após
  o carregamento com as seguintes, incluindo um jogador que entra depois do GM.
- Conferir ausência de downloads de sons fora do catálogo ou vídeos; mudar volume
  de zero para positivo e registrar novamente o banco PSFX deve retomar a fila sem
  baixar novamente os arquivos já concluídos ou em andamento.
- Conferir uma reprodução por cliente, primeiro alvo válido em múltiplos ataques,
  duplicação do evento e atualização/reabertura do chat sem replay.
- Privado/cego/pessoal, alvo ausente, referências ambíguas, outra cena, tokens
  ocultos inclusive em ataques do GM, fog e níveis: conferir ausência de vazamento.
- Revalidar as três formas de Eletrocussão, intervalo de 500 ms e feedback de
  dano/cura, sem alterações em custos, rolagens, dano, munição ou recursos.
- Em instalação paga autorizada, confirmar os datapaths exatos de Rifle, Shotgun
  e Musket sob `psfx`, suas variantes, reprodução e prioridade sobre Revolver.

O áudio é agendado na mesma sequência do visual, mas cache frio, latência de rede
e bloqueio de áudio do navegador podem afetar o primeiro uso. Os testes automatizados
e a aprovação geral do usuário não substituem a conferência dos cenários individuais.

## 0.4.0 — animações automáticas de armas v1

- Catálogo fechado de 38 armas, com 26 datapaths do JB2A Free; sete armas sem associação.
- Hook local `paranormal-toolkit.attack.published` v1 para ataques nativos e gerenciados.
- Requisito mínimo de Paranormal Toolkit 0.48.0 declarado no manifesto.
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

### Validação manual e cenários de regressão

O usuário confirmou os testes manuais da funcionalidade no Foundry antes da
release 0.4.0. A lista abaixo permanece como referência para futuras regressões
em Foundry v14 com GM, jogador executor e um terceiro jogador; testes com fontes
do Foundry/Ordem não substituem um mundo real.

- Pistola, Fuzil de Assalto, Espingarda e Bazuca: um efeito por acionamento.
- Snipe em distâncias diferentes e Katana em ataques sucessivos, conferindo variantes.
- Melee, Acha/halberd, Corrente/flail e largura/orientação da linha do Lança-chamas.
- Ataques nativos, do card Toolkit, diretos, de jogador e GM; cancelamento do diálogo.
- Vários ataques/alvos, inclusive primeira entrada cancelada/sem alvo: primeiro válido somente.
- Reações e acerto/erro/crítico: nenhum resultado exposto pelo efeito ou duplicação.
- Privado/cego/pessoal, tokens ocultos, fog e níveis: nenhum vazamento visual ao terceiro cliente.
- Alvo removido ou ambíguo e arma sem associação: silêncio; reload do chat: nenhum replay.
- Eletrocussão Padrão, Discente e Verdadeira (500 ms entre raios), além de dano/cura flutuantes.

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
