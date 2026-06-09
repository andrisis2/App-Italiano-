# App Italiano — Architettura

## Struttura del progetto

Questo è un **PWA statico** (niente build step, niente framework). Tutti i file sono production-ready così come sono.

## File principali

| File | Ruolo |
|------|-------|
| `index.html` | **L'intera app**. SPA che contiene tutto il JS e carica i dati da `knowledge.json`. Questo è il file da modificare per quasi ogni funzionalità. |
| `knowledge.json` | Database centrale — frasi, dizionario, grammatica, vocabolario. Unica sorgente di dati dell'app. |
| `sw.js` | Service Worker PWA con cache-first. Quando si aggiungono nuovi file HTML/CSS/JS, aggiungerli all'array `ASSETS` e **incrementare la versione** (`italiano-b2-vN`) — altrimenti gli utenti vedranno la versione vecchia dalla cache. |
| `app.js` | Utility condivise (TTS, navigazione) usate dalle pagine standalone. |
| `style.css` | Stili condivisi per le pagine standalone. |

## Pagine standalone (NON usate dall'app principale)

Le seguenti pagine esistono ma **non sono raggiungibili dal tile grid** di `index.html`. Sono accessibili solo navigando direttamente all'URL:

- `frasi.html` — lista statica di frasi hardcoded (non aggiornata automaticamente)
- `flashcard.html` — vecchio prototipo flashcard
- `fonetica.html` — guida alla pronuncia
- `grammatica.html` — riferimento grammaticale statico

> **Attenzione:** modificare queste pagine non cambia nulla di quello che l'utente vede nell'app principale.

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

## Regola pratica

**Prima di modificare qualsiasi cosa**, verifica sempre da quale file viene caricata la funzionalità:

```bash
grep -n "funzione_o_keyword" index.html
```

Se è in `index.html` → modifica `index.html`.  
Se è in una pagina standalone → probabile che l'utente non la veda mai dall'app.

## Service Worker — regola importante

Ogni volta che si modificano file inclusi nell'array `ASSETS` di `sw.js`, o si aggiungono nuovi file, bisogna **incrementare la versione cache**:

```js
// sw.js
const CACHE = 'italiano-b2-v5'; // incrementa ogni deploy
const ASSETS = ['/', '/index.html', '/frasi.html', ...];
```

Senza questo bump, gli utenti con l'app installata (PWA) continueranno a vedere la versione vecchia.
