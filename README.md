# Paranormal FX

**Paranormal FX** é um módulo não oficial para Foundry VTT focado em efeitos visuais e sonoros para automações do sistema não oficial de Ordem Paranormal.

O módulo foi pensado para funcionar junto com o **Paranormal Toolkit**, escutando eventos públicos de rituais, ataques, áreas e workflows para disparar animações via **Sequencer** e bibliotecas **JB2A** instaladas pelo usuário.

> Este é um conteúdo não oficial e não possui afiliação, aprovação ou endosso dos detentores da marca Ordem Paranormal.

## Status

Projeto em fase inicial.

Versão atual:

```txt
0.5.0
```

## Objetivo

O Paranormal FX não implementa regras. Ele apenas reage a eventos de automação e toca efeitos visuais/sonoros.

Responsabilidades:

- escutar hooks públicos do Paranormal Toolkit;
- identificar preset, forma, área e alvos;
- escolher um preset visual compatível;
- tocar animações via Sequencer;
- usar assets JB2A instalados pelo usuário;
- manter efeitos opcionais e configuráveis no futuro.

## Animações automáticas de armas

O catálogo da versão 0.4.0 reconhece 38 nomes originais do compêndio
Armamentos do Ordem, sem configurar itens, importar associações ou modificar o
compêndio. O reconhecimento aceita diferenças de caixa, acentos e espaços externos;
nomes com sufixos, pontuação alterada ou modificações adicionadas ao nome não correspondem.

Com **Animações automáticas de armas** habilitado nas configurações do mundo
(padrão), um ataque público publicado com origem e alvo válidos reproduz um único
efeito. Em acionamentos com vários ataques/alvos, somente o primeiro ataque válido
é animado. Acerto, erro, crítico e reação pendente usam a mesma animação.
Abrir ou cancelar o configurador não inicia efeitos; rolar/aplicar dano e
recarregar o chat também não os repetem.

Armas de fogo, arcos, bestas e bazuca usam projéteis entre os tokens. O Sequencer
resolve as variantes de distância. As armas corpo a corpo são orientadas ao alvo,
com seleção nativa das variantes da coleção. Lança-chamas usa uma linha visual,
sem área mecânica. Acha usa halberd e Corrente usa flail como aproximação visual.

Picareta, Gancho de Carne, Nunchaku, Motoserra, Pregador Pneumático, Estilingue e
Shuriken não têm associação na v1 e são ignorados silenciosamente. O catálogo
completo está em `src/features/weapon-fx/weapon-fx-catalog.ts`.

Ataques privados, cegos ou pessoais, tokens ocultos, outra cena, canvas indisponível
e alvos ausentes/ambíguos não produzem animação. Em ataques nativos, múltiplos tokens
vinculados ao mesmo Actor podem impedir a resolução exata do alvo; o efeito é omitido.
O contexto gerenciado do Toolkit preserva o token original. O FX mantém a máscara
de visão do Sequencer e não usa resultados de ataque para decidir o efeito.

Somente o cliente executor inicia a sequência; o Sequencer a propaga aos demais.
Não há socket próprio nem fallback pelo HTML do chat. Esta versão requer
**Paranormal Toolkit 0.48.0 ou superior**, que publica o hook
`paranormal-toolkit.attack.published` v1 (consulte `docs/integration-with-ordem.md`
no Toolkit). A versão mínima também é declarada no manifesto do módulo.

Os 26 datapaths foram conferidos no JB2A Free 0.9.4 e o comportamento do banco foi
investigado no Sequencer 4.3.0. Assets ausentes afetam somente sua associação,
com diagnóstico no console e sem repetição automática. Nenhum asset é distribuído.
O usuário confirmou os testes manuais da funcionalidade no Foundry antes da release.
O roadmap conserva os cenários de regressão para futuras validações em mesa;
testes automatizados não substituem a verificação de renderização e sockets.

## Sons automáticos de armas

As animações de armas podem incluir áudio opcional do **PSFX** instalado pelo
usuário. O PSFX não é obrigatório e nenhum arquivo de áudio é distribuído pelo FX.
Se o banco não contiver um som compatível, a animação permanece funcionando.

Para usar os sons gratuitos, abra **Módulos complementares → Instalar módulo**
no Foundry e procure **PSFX - Peri's Sound Effects**, ou informe o manifesto:

```text
https://github.com/JimHPerry/psfx/releases/latest/download/module.json
```

Ative PSFX no mundo junto de Paranormal FX, Paranormal Toolkit, Sequencer e JB2A
Free. Os sons já ficam habilitados nas configurações do FX, sem configurar cada
arma ou escolher uma edição do PSFX. Consulte o [projeto PSFX](https://github.com/JimHPerry/psfx)
para instalação, documentação e acesso legítimo aos sons adicionais.

Os perfis sonoros ficam associados ao catálogo visual existente. Pistolas e
revólveres usam `psfx.ranged-weapons.guns.single-fire.revolver`. Armas automáticas
preferem `psfx.ranged-weapons.guns.single-fire.rifle`, espingardas preferem
`psfx.ranged-weapons.guns.single-fire.shotgun`, e fuzis de caça/precisão preferem
`psfx.ranged-weapons.guns.single-fire.musket`. Cada um desses três perfis usa
Revolver como fallback quando o candidato específico está ausente. A seleção
consulta somente os datapaths registrados no Sequencer; não verifica edição,
assinatura ou licença.

Espada, Katana, Machete e Florete usam `psfx.weapon-attacks.sword.v1`; Lança usa
`psfx.weapon-attacks.spear.v1`. Faca, Faca Tática, Punhal, Baioneta, Machadinha e
Bastão Policial usam `psfx.weapon-swooshes.light.v1.group01`. Machado, Acha,
Martelo, Marreta, Maça, Gadanho, Corrente, Bastão, Cajado e Montante usam
`psfx.weapon-swooshes.heavy.v1.group01`. O Sequencer sorteia as variantes dessas
coleções, sem fixar índices. Não há variação por acerto, erro ou crítico.

Arco, Arco Composto, Besta e Balestra usam `psfx.ranged-weapons.longbow.v1`, com origem e destino
para selecionar sua versão por distância. O som é global na cena, no canal de
interface, sem atenuação por distância ou paredes. Bazuca e Lança-chamas
permanecem somente visuais. O catálogo
automático continua com 38 armas; as sete armas anteriormente sem associação
não foram acrescentadas.

Fuzil de Assalto, Submetralhadora e Metralhadora usam uma rajada sonora de
**20 disparos com intervalo de 100 ms**, com metade do ganho por disparo. Isso
vale para cada acionamento dessas armas, independentemente da opção mecânica
Rajada do Toolkit. Não são criados ataques nem efeitos visuais adicionais.
Espingarda de Cano Duplo reproduz um único som.

Nas configurações do mundo, **Sons automáticos de armas** começa habilitado e
**Volume dos sons de armas** começa em 50%. As mudanças valem nos próximos
acionamentos, sem recarga. Desativar sons ou definir volume zero preserva os
efeitos visuais. Com o padrão de 50%, cada disparo de rajada usa volume 25%.
Cada participante também pode ajustar o áudio de interface no Foundry ou
desabilitar sons no Sequencer, respeitando a recarga solicitada por esse módulo.
Silenciar localmente o atacante não suprime o envio do som aos outros clientes.

Som e visual são montados na mesma sequência, iniciada somente pelo executor.
Os filtros de privacidade, tokens ocultos, contexto e duplicação são os mesmos
das animações. Uma falha ao montar áudio descarta a sequência ainda não iniciada
e monta somente o visual. Após iniciar a reprodução, o FX não repete a animação
para tentar recuperar um som. O efeito visual é agendado antes do áudio, sem
aguardar seu carregamento ou conclusão. Erros de carregamento do próprio
Sequencer/Foundry podem gerar diagnósticos desses módulos.

O cache de disponibilidade é invalidado quando os namespaces `psfx` ou `jb2a`
são registrados novamente; isso vale para os próximos ataques e não reproduz
ações anteriores. Não é necessário reiniciar o FX para reconhecer novos registros.

Cada cliente também pré-carrega em segundo plano os arquivos dos perfis sonoros
usados pelo catálogo, incluindo todas as variantes e distâncias. São considerados
os candidatos gratuitos e Rifle/Shotgun/Musket quando registrados na instalação.
Não é carregada a biblioteca PSFX inteira nem as animações JB2A. No PSFX Free
0.18.0, esse conjunto tem 30 arquivos, cerca de 0,6 MiB de download.

O pré-carregamento usa o cache local nativo do Sequencer/Foundry, sem reproduzir
sons, sem barra de progresso e com no máximo dois arquivos simultâneos. Começa
ao entrar no mundo; novos registros do PSFX e alterações nas configurações de
sons/volume/animações retomam a busca por arquivos ainda não carregados. Arquivos
concluídos ou em andamento não são solicitados novamente pelo FX. Com animações
ou sons desativados, ou volume mundial zero, novos carregamentos ficam pausados.
Falhas são isoladas e podem ser tentadas novamente em uma solicitação posterior.

Cada participante faz seu próprio carregamento ao entrar, sem depender de um GM
forçar downloads para os outros. Ataques não aguardam essa fila. O navegador pode
aguardar a primeira interação para liberar áudio; a melhora no primeiro uso depende
de o carregamento já ter terminado e não elimina possíveis atrasos do vídeo JB2A.

Referências verificadas: PSFX Free 0.18.0 e Sequencer 4.3.0. Revolver, Sword,
Spear, Light/Heavy Swoosh e Longbow foram conferidos no banco e nos arquivos
locais. **Rifle, Shotgun e Musket ainda não foram validados na edição paga.**
Testes com runtime substituído verificam seleção, agendamento e propagação
solicitada; não comprovam reprodução real em navegador ou sockets entre clientes.
O usuário confirmou testes da funcionalidade no Foundry e aprovou o resultado
antes da release 0.5.0. Essa confirmação não detalha todos os cenários de rede,
cache frio, privacidade ou da biblioteca paga; eles seguem como regressões no roadmap.

## Texto flutuante de dano e cura

A versão 0.3.0 exibe números nativos sobre Tokens quando o valor real de PV/HP de
um Actor muda: reduções aparecem em vermelho como dano (`-12`) e aumentos em
verde como cura (`+8`). Agentes usam `system.PV.value` e ameaças usam
`system.attributes.hp.value`; PE, PD e SAN não são observados.

A detecção acompanha atualizações reais do Actor no Foundry. Por isso, edições
manuais, macros, regras do sistema e outros módulos — inclusive o Paranormal
Toolkit — podem produzir o feedback sem integração específica.

O GM pode ver o feedback de todos os Tokens na cena ativa. Para jogadores, o
Paranormal FX só renderiza o texto quando o Actor concede OBSERVER ou nível
superior, o Token não está oculto e está visualmente disponível no canvas. A
filtragem acontece localmente antes da renderização e não registra visualmente o
valor ou a posição de Tokens bloqueados.

O setting de cliente **Texto flutuante de dano e cura** vem habilitado por padrão.
Desabilitá-lo interrompe somente a renderização; os snapshots continuam
atualizados para não produzir um delta acumulado ao reativá-lo.

## Dependências

Dependências atuais:

- Paranormal Toolkit 0.48.0 ou superior
- Sequencer
- JB2A Free (`JB2A_DnD5e`)

A biblioteca JB2A deve estar instalada e ativa no Foundry. Este módulo não empacota assets da JB2A.

PSFX é uma integração **opcional** para áudio. Sua ausência não impede as animações.

## Compatibilidade

- Foundry VTT v14+
- Sistema alvo: `ordemparanormal`


## Presets iniciais

### Eletrocussão Padrão

Preset visual para o evento público de ritual do Paranormal Toolkit:

```txt
ritual.eletrocussao
form: standard
```

O efeito usa o caminho do banco do Sequencer/JB2A:

```txt
jb2a.chain_lightning.primary.blue.60ft
```

A animação é posicionada como uma linha do conjurador até o alvo único. O ponto inicial é calculado na borda do token do conjurador, no lado voltado para o alvo, sem depender da rotação visual/facing do token.

### Eletrocussão Discente

Preset visual para o evento público de ritual do Paranormal Toolkit:

```txt
ritual.eletrocussao
form: student
areaType: rectangleRay
```

O efeito usa o caminho do banco do Sequencer/JB2A:

```txt
jb2a.chain_lightning.primary.blue.60ft
```

A animação é posicionada como uma linha de área: começa no início da `rectangleRay` resolvida pelo Toolkit e estica até o fim da linha. Os alvos não definem o caminho visual; eles apenas são consequência dos quadrados cobertos pela área.

### Eletrocussão Verdadeira

Preset visual para o evento público de ritual do Paranormal Toolkit:

```txt
ritual.eletrocussao
form: true
```

O efeito usa o caminho do banco do Sequencer/JB2A:

```txt
jb2a.chain_lightning.primary.blue.60ft
```

A animação é posicionada do conjurador até cada alvo confirmado. Cada disparo sai da borda do token do conjurador voltada para o alvo correspondente e começa com atraso de 500 ms entre um raio e o próximo.

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Valide o projeto:

```bash
npm run check
```

Os testes de referência opcionais leem instalações locais, sem modificar seus arquivos:

| Variável de ambiente | Diretório esperado |
|---|---|
| `PARANORMAL_FX_JB2A_REFERENCE` | Módulo `JB2A_DnD5e`, contendo `scripts/jb2a_sequencer.js` e `Library/` |
| `PARANORMAL_FX_PSFX_REFERENCE` | Módulo PSFX Free, contendo `scripts/psfx_sequencer.js` e `library/` |
| `PARANORMAL_FX_SEQUENCER_REFERENCE` | Módulo `sequencer`, contendo `dist/sequencer.js.map` |
| `PARANORMAL_FX_ORDEM_REFERENCE` | Checkout do sistema, contendo `packs/_source/armaments/` |

Defina essas variáveis antes de `npm run check` para incluir conferência dos 45
armamentos, arquivos das 38 associações, registro dos datapaths e resolução nativa
de variantes/distância. A referência PSFX com Sequencer também exercita as seções
sonoras, intervalos de rajada e o agendamento visual antes do áudio. As rotinas
rodam em memória com infraestrutura simulada, sem canvas, reprodução de áudio ou
socket. Sem as variáveis, somente as respectivas suites de
referência são ignoradas; a cobertura unitária continua ativa.

Gere o bundle:

```bash
npm run build
```

Modo watch:

```bash
npm run dev
```

## Estrutura

```txt
src/
  main.ts
  config/
  adapters/
    toolkit/
    sequencer/
  core/
  features/
    resource-feedback/
    ritual-fx/
    weapon-fx/
  types/
```

## Fluxo inicial

```txt
Paranormal Toolkit hook
↓
Ritual FX listener
↓
Ritual FX orchestrator
↓
Preset registry
↓
Sequencer adapter
```

## Publicação

O manifesto do Foundry aponta para o asset versionado da release mais recente:

```txt
https://github.com/antoniohbmonteiro/paranormal-fx/releases/latest/download/module.json
```

O pacote instalável deve ser publicado na release como:

```txt
paranormal-fx.zip
```

## Licença

Código distribuído sob a licença MIT. Veja o arquivo `LICENSE`.

Assets, animações e sons de terceiros não são redistribuídos por este módulo.


### 0.1.2

- Corrige o posicionamento da linha de FX ao rotacionar `rectangleRay`, usando o início real da forma retangular e sua direção para calcular o fim da área.

### 0.1.3

- Adiciona logs diagnósticos detalhados para investigar o posicionamento da `rectangleRay` rotacionada.
- Os logs mostram payload bruto do Toolkit, resumo da área, direção recebida, start/end calculados, delta, distância e ângulo final enviado ao Sequencer.

### 0.1.4

- Configura `manifest` e `download` para publicação via GitHub Releases.
- Não altera comportamento, presets, hooks, Sequencer ou integração JB2A.

### 0.2.0

- Adiciona FX para Eletrocussão Padrão em alvo único.
- A animação parte da borda do token do conjurador no lado do alvo e estica até o centro do alvo.
- Mantém Eletrocussão Discente usando a linha da `rectangleRay`.

### 0.2.1

- Adiciona FX para Eletrocussão Verdadeira com múltiplos alvos.
- Cada raio parte da borda do token do conjurador até o centro do alvo correspondente.
- Aplica atraso de 500 ms entre o início de cada disparo.

### 0.3.0

- Adiciona texto flutuante nativo para dano e cura pela variação real de PV/HP.
- Suporta agentes e ameaças, incluindo Actors vinculados e sintéticos.
- Aplica regras locais de permissão e visibilidade para evitar feedback indevido.
- Adiciona setting de cliente e testes unitários para resolução, snapshots,
  Tokens, policy e service.

### 0.4.0

- Adiciona animações automáticas para 38 armas do compêndio Armamentos, sem configuração por item.
- Consome o hook público de ataques do Toolkit 0.48.0+, com uma animação por acionamento público e referências válidas de origem/alvo.
- Delega variantes e distâncias ao Sequencer, mantém sete armas sem associação e preserva Eletrocussão e o feedback de dano/cura.
- Inclui setting mundial de ativação e testes de regressão; testes manuais no Foundry confirmados pelo usuário antes da release.
