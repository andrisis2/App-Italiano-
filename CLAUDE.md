# App Italiano — Architettura

## ⚙️ Workflow merge (preferenza dell'utente)
Quando l'utente chiede una modifica, dopo aver finito (commit + push + apertura PR) **fai tu il merge della PR senza chiedere conferma**: porta la PR da draft a "ready" e fai squash-merge su `main`. **Non chiedere "vuoi che faccia il merge?"** — è già autorizzato in modo permanente. Comunica solo l'esito (PR mergiata + link). Se invece qualcosa è ambiguo o rischioso nel *contenuto* della modifica, chiedi pure prima di procedere; l'auto-merge riguarda solo il passaggio finale di integrazione.

> ## ⚠️ REGOLA №1 — leggere prima di toccare qualsiasi cosa
> L'app installata sul telefono dell'utente è **solo `index.html`**: ogni funzionalità va implementata lì. In passato esistevano pagine prototipo standalone (`frasi.html`, `flashcard.html`, `fonetica.html`, `grammatica.html` + `app.js`/`style.css`): una feature finì per sbaglio lì dentro e l'utente non la vide mai, quindi sono state **eliminate**. **Non ricrearle** e non aggiungere nuove pagine HTML separate: tutto vive in `index.html`.

## Struttura del progetto

Questo è un **PWA statico** (niente build step, niente framework). Tutti i file sono production-ready così come sono.

## File principali

| File | Ruolo |
|------|-------|
| `index.html` | **L'intera app**. SPA che contiene tutto il JS e carica i dati da `knowledge.json`. Questo è il file da modificare per quasi ogni funzionalità. |
| `knowledge.json` | Database centrale — frasi, dizionario, grammatica, vocabolario. Unica sorgente di dati dell'app. |
| `sw.js` | Service Worker PWA **network-first** (cache usata solo come fallback offline): gli aggiornamenti arrivano automaticamente a ogni deploy, senza bump di versione obbligatorio. Se si aggiungono nuovi file, aggiungerli all'array `ASSETS` perché funzionino offline (e incrementare la versione cache). |

## Struttura di `index.html`

L'app è interamente in questo file. Le funzioni principali:

| Funzione | Cosa fa |
|----------|---------|
| `renderHome()` | Disegna la home con i tile |
| `start(mode)` | Router: smista verso la funzione giusta in base al mode |
| `pickFlashTopic()` | Schermata selezione topic per le flashcard |
| `runTopicList(pool, label)` | Lista parole di un topic con tasto Study |
| `runFlash(pool, label)` | Sessione flashcard con spaced repetition |
| `runPhrase(level)` | Picker difficoltà + esercizio fill-in-the-blank (usa `DB.frasi`) |
| `runVocabolario()` | Dizionario locale + ricerca online |
| `runSofia()` | Chat con l'AI tutor |
| `runReference()` | Riferimento grammaticale |

## Struttura di `knowledge.json`

```
{
  "meta": { "project", "level", "version", "updated" },
  "frasi": [{ "id", "it", "en", "tag", "difficolta" (1|2|3), "aggiunto" }],
  "dizionario": [{ "id", "it", "en", "pos", "tag" }],
  "riferimento": [...],   // sezioni grammatica
  "voci": [],             // non usato
  "dizionario": [...]     // 1723 voci con pos/tag
}
```

## Service Worker — come funzionano gli aggiornamenti

`sw.js` usa una strategia **network-first**: ogni richiesta prova prima la rete (con `cache: 'no-cache'`, che rivalida la cache HTTP) e usa la cache solo se offline. Quindi:

- **Non serve** incrementare la versione cache a ogni deploy: gli utenti ricevono le modifiche al primo caricamento online.
- Il bump di `CACHE` (`italiano-b2-vN`) serve solo quando cambia l'array `ASSETS` o si vuole forzare la pulizia delle cache vecchie.
- **Non tornare a cache-first** in `sw.js`: in passato causava app bloccate sulla versione vecchia per sempre (l'unico modo per aggiornare era il bump manuale, facile da dimenticare).
- Il bottone "Update app" in `index.html` (`forceUpdate`) deregistra il SW, svuota le cache e ricarica con query `?fresh=<timestamp>` per bypassare anche la CDN di GitHub Pages (che cachea per ~10 minuti). Non usare `location.reload(true)`: il parametro è ignorato dai browser moderni e ricarica dalla cache HTTP.

> Nota: dopo un push su `main`, il deploy su GitHub Pages (workflow `deploy.yml`) impiega ~1-2 minuti, e la CDN può servire file vecchi fino a ~10 minuti. Se un utente preme "Update app" subito dopo un push, il cache-buster aggira la CDN, ma il deploy deve comunque essere finito.
