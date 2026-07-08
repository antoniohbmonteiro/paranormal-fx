# Paranormal FX

**Paranormal FX** é um módulo não oficial para Foundry VTT focado em efeitos visuais e sonoros para automações do sistema não oficial de Ordem Paranormal.

O módulo foi pensado para funcionar junto com o **Paranormal Toolkit**, escutando eventos públicos de rituais, ataques, áreas e workflows para disparar animações via **Sequencer** e bibliotecas **JB2A** instaladas pelo usuário.

> Este é um conteúdo não oficial e não possui afiliação, aprovação ou endosso dos detentores da marca Ordem Paranormal.

## Status

Projeto em fase inicial.

Versão atual:

```txt
0.1.4
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

### Eletrocussão Discente

O primeiro preset visual acompanha o evento público de ritual do Paranormal Toolkit:

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

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Valide o projeto:

```bash
npm run check
```

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
    ritual-fx/
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
