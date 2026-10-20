# Paranormal FX

**Paranormal FX** é um módulo não oficial para Foundry VTT focado em efeitos visuais e sonoros para automações do sistema não oficial de Ordem Paranormal.

O módulo foi pensado para funcionar junto com o **Paranormal Toolkit**, escutando eventos públicos de rituais, ataques, áreas e workflows para disparar animações via **Sequencer** e bibliotecas **JB2A** instaladas pelo usuário.

> Este é um conteúdo não oficial e não possui afiliação, aprovação ou endosso dos detentores da marca Ordem Paranormal.

## Status

Projeto em fase inicial.

Versão atual:

```txt
0.3.0
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

O catálogo de armas em desenvolvimento reconhece 38 nomes originais do compêndio
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
Não há socket próprio nem fallback pelo HTML do chat. A integração requer uma
versão do Toolkit com o hook `paranormal-toolkit.attack.published` v1 (consulte
`docs/integration-with-ordem.md` no Toolkit). Versões antigas não iniciam esta
automação; os listeners existentes de rituais permanecem independentes.

Os 26 datapaths foram conferidos no JB2A Free 0.9.4 e o comportamento do banco foi
investigado no Sequencer 4.3.0. Assets ausentes afetam somente sua associação,
com diagnóstico no console e sem repetição automática. Nenhum asset é distribuído.
Enquadramento final e privacidade em três clientes ainda exigem a validação manual
registrada no roadmap; testes automatizados não comprovam renderização ou sockets.

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

- Paranormal Toolkit
- Sequencer
- JB2A

A biblioteca JB2A deve estar instalada e ativa no Foundry. Este módulo não empacota assets da JB2A.

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
| `PARANORMAL_FX_SEQUENCER_REFERENCE` | Módulo `sequencer`, contendo `dist/sequencer.js.map` |
| `PARANORMAL_FX_ORDEM_REFERENCE` | Checkout do sistema, contendo `packs/_source/armaments/` |

Defina essas variáveis antes de `npm run check` para incluir conferência dos 45
armamentos, arquivos das 38 associações, registro dos datapaths e resolução nativa
de variantes/distância. As rotinas do banco rodam em memória com infraestrutura
simulada, sem canvas ou socket. Sem as variáveis, somente as respectivas suites de
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
