# Paranormal FX

**Paranormal FX** é um módulo não oficial para Foundry VTT focado em efeitos visuais e sonoros para automações do sistema não oficial de Ordem Paranormal.

O módulo foi pensado para funcionar junto com o **Paranormal Toolkit**, escutando eventos públicos de rituais, ataques, áreas e workflows para disparar animações via **Sequencer** e bibliotecas **JB2A** instaladas pelo usuário.

> Este é um conteúdo não oficial e não possui afiliação, aprovação ou endosso dos detentores da marca Ordem Paranormal.

## Status

Projeto em fase inicial.

Versão atual:

```txt
0.1.0
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

## Licença

Código distribuído sob a licença MIT. Veja o arquivo `LICENSE`.

Assets, animações e sons de terceiros não são redistribuídos por este módulo.
