# App Italiano — Architettura

> ## ⚠️ REGOLA №1 — leggere prima di toccare qualsiasi cosa
> L'app installata sul telefono dell'utente è **solo `index.html`**. Le pagine `frasi.html`, `flashcard.html`, `fonetica.html`, `grammatica.html` sono **prototipi legacy non raggiungibili dall'app**: una funzionalità implementata lì **non sarà mai vista dall'utente** (è già successo: il toggle IT→EN/EN→IT era stato messo in `flashcard.html` e l'utente non lo ha mai visto). **Ogni nuova funzionalità va implementata in `index.html`.** Prima di scegliere il file, verifica con `grep` da dove viene caricata la funzionalità.

## Struttura del progetto

Questo è un **PWA statico** (niente build step, niente framework). Tutti i file sono production-ready così come sono.

## File principali

| File | Ruolo |
|------|-------|
| `index.html` | **L'intera app**. SPA che contiene tutto il JS e carica i dati da `knowledge.json`. Questo è il file da modificare per quasi ogni funzionalità. |
| `knowledge.json` | Database centrale — frasi, dizionario, grammatica, vocabolario. Unica sorgente di dati dell'app. |
| `sw.js` | Service Worker PWA **network-first** (cache usata solo come fallback offline): gli aggiornamenti arrivano automaticamente a ogni deploy, senza bump di versione obbligatorio. Quando si aggiungono nuovi file HTML/CSS/JS, aggiungerli all'array `ASSETS` perché funzionino offline. |
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

## Service Worker — come funzionano gli aggiornamenti

`sw.js` usa una strategia **network-first**: ogni richiesta prova prima la rete (con `cache: 'no-cache'`, che rivalida la cache HTTP) e usa la cache solo se offline. Quindi:

- **Non serve** incrementare la versione cache a ogni deploy: gli utenti ricevono le modifiche al primo caricamento online.
- Il bump di `CACHE` (`italiano-b2-vN`) serve solo quando cambia l'array `ASSETS` o si vuole forzare la pulizia delle cache vecchie.
- **Non tornare a cache-first** in `sw.js`: in passato causava app bloccate sulla versione vecchia per sempre (l'unico modo per aggiornare era il bump manuale, facile da dimenticare).
- Il bottone "Update app" in `index.html` (`forceUpdate`) deregistra il SW, svuota le cache e ricarica con query `?fresh=<timestamp>` per bypassare anche la CDN di GitHub Pages (che cachea per ~10 minuti). Non usare `location.reload(true)`: il parametro è ignorato dai browser moderni e ricarica dalla cache HTTP.

> Nota: dopo un push su `main`, il deploy su GitHub Pages (workflow `deploy.yml`) impiega ~1-2 minuti, e la CDN può servire file vecchi fino a ~10 minuti. Se un utente preme "Update app" subito dopo un push, il cache-buster aggira la CDN, ma il deploy deve comunque essere finito.
