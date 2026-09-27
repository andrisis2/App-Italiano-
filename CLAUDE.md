# App Italiano — Architettura

## ⚙️ Workflow merge (preferenza dell'utente)
Quando l'utente chiede una modifica, dopo aver finito (commit + push + apertura PR) **fai tu il merge della PR senza chiedere conferma**: porta la PR da draft a "ready" e fai squash-merge su `main`. **Non chiedere "vuoi che faccia il merge?"** — è già autorizzato in modo permanente. Comunica solo l'esito (PR mergiata + link). Se invece qualcosa è ambiguo o rischioso nel *contenuto* della modifica, chiedi pure prima di procedere; l'auto-merge riguarda solo il passaggio finale di integrazione.

> ## ⚠️ REGOLA №1 — leggere prima di toccare qualsiasi cosa
> L'app installata sul telefono dell'utente è **solo `index.html`**: ogni funzionalità va implementata lì. In passato esistevano pagine prototipo standalone (`frasi.html`, `flashcard.html`, `fonetica.html`, `grammatica.html` + `app.js`/`style.css`): una feature finì per sbaglio lì dentro e l'utente non la vide mai, quindi sono state **eliminate**. **Non ricrearle** e non aggiungere nuove pagine HTML separate: tutto vive in `index.html`.

## Cos'è
PWA per imparare l'italiano a livello **B2–C1**, per chi parla inglese: l'interfaccia è in
inglese, i contenuti in italiano con traduzione. È costruita sul modello dell'app di russo
(`andrisis2/russo`): ripasso quotidiano misto, SRS, XP e livelli, analisi parola per parola
(«Explain»), tocca-e-traduci su ogni testo, tutor AI a voce.

L'estetica è quella dell'Italia: in testa alla home un panorama dipinto di Firenze da Piazzale
Michelangelo che cambia con l'ora (alba, giorno, tramonto, notte; nel tema scuro sempre notte),
sullo sfondo la Val d'Orcia dipinta, motivi decorativi (maiolica, rosone, meandro, cotto) e 55
illustrazioni **realistiche ad acquarello leggero** di monumenti, paesaggi e piatti (vedi
«Immagini»). L'utente **non** vuole né la striscia tricolore né l'orlo ad archi («grechina»)
sotto la testata o sulla scheda del ripasso: non rimetterli.

## File

| File | Ruolo |
|------|-------|
| `index.html` | **L'intera app**: CSS, sprite SVG (icone + illustrazioni) e tutto il JS. Carica i dati da `knowledge.json`. |
| `knowledge.json` | Unica sorgente dei contenuti (vedi sotto). |
| `sw.js` | Service Worker **network-first**. Se cambia l'elenco `ASSETS`, incrementare `CACHE` (`italiano-b2-vN`). |
| `manifest.json` | Manifest PWA (tema crema `#f6f2ec`). |
| `icon.png` / `apple-touch-icon.png` / `icon.svg` | Icona: lo stivale color crema su fondo terracotta. |
| `splash.jpg`, `splash-desktop.jpg`, `splash-ios/` | Schermata d'avvio (web e iOS). |
| `andrea.jpg` | Avatar del tutor AI «Andrea». |
| `img/` | Illustrazioni dipinte (`luoghi/`, `cielo/`, `sfondo.webp`) e `credits.json` (vedi «Immagini»). |
| `tools/dipingi.py` | Strumento offline (Python) che trasforma una foto di Wikimedia Commons in un'illustrazione dell'app. Non fa parte dell'app. |

## Struttura di `index.html`
Il JS è diviso in sezioni, nell'ordine in cui compaiono nel file:

| Sezione | Contenuto principale |
|---------|----------------------|
| core | `$`, `esc`, `ic()` (icone), `speak`/`pickVoice` (TTS), SRS (`italiano_srs_v1`), impostazioni, XP (`xpTotale`), attività giornaliera, errori |
| lingua | articoli (`articolo`, `articoloInd`), genere/plurale (`genereDi`, `pluraleDi`), motore di coniugazione (`conjForm`, `coniugaRegolare` per i verbi regolari -are/-ire), indice di tutte le forme (`indiceForme`), `analizzaParola` (forme, clitici, superlativi -issimo, avverbi -mente, numeri in lettere, nomi propri), `tokenizza`, `PAROLE_FUNZIONE` |
| ui | `renderHome()` (tab Practice/Theory), `start(mode)` (router), `header`, `navigateTo` (back), `illIMG(id, piccola)` (le illustrazioni), `aggiornaCielo()` (panorama in testa secondo l'ora e il tema) |
| spiega | `spiega(it, en)`: il bottom-sheet «Explain» con l'analisi parola per parola e i perché del modo verbale |
| vocab | `runVocabolario()` (dizionario + ricerca online), `runVerbi()`, `runVerboDetail()` |
| esercizi | flashcard (`pickFlashTopic`, `runFlash`), scrittura, coniugazione (`runConjugation`), frasi (`runPhrase`, `runComponi`, `runDettatoFrasi`), «My exercises» |
| daily | `runDaily()`: ripasso quotidiano misto (parole, verbo, frasi, grammatica, articoli, falso amico, atlante) |
| dialoghi | `runDialoghi`, `runDialogo`, `runRecita` (recita col microfono), `runDlgQuiz`, frasario (`runFrasario`) |
| cultura | `testoCliccabile` + `popParola` (tocca-e-traduci), letture (`runLetture`, `runLettura`, `runAscolto`), `runCultura`, proverbi, parole trappola, modi di dire, pop, `runAnatomia` |
| atlante | `runAtlante(cat)` (monumenti, paesaggi, cibo), `runLuogo`, `runAtlasQuiz` |
| palestra | `runPalestra`, `runGymTopic`, `runGymQuiz`, `runArticoli`, giochi (`runGiochi`, memory, `runLampo`) |
| percorso | «Grand Tour d'Italia»: 12 tappe da Torino a Palermo (`runPercorso`, `runTappa`, `avviaPasso`, `passoCompletato`) |
| progressi | `runProgressi` (statistiche, traguardi), `runImpostazioni` (tema, voce, backup, aggiornamento), `runCrediti` (crediti delle immagini) |
| andrea | tutor AI «Andrea» (Gemini, chiave in `sofia_gemini_key`): `runAndrea`, `AndreaSession` |
| boot | carica `knowledge.json`, `montaVoci`, registra il SW |

Modalità di `start(mode)`: `daily, esercizi, flash, write, conj, frasi, palestra, ascolto, giochi,
stats, andrea, vocab, verbi, dialoghi, frasario, cultura, atlante, ref, idiomi, pop, anatomia,
percorso, settings, proverbi, memory, lampo, articoli, phrase, compose, letture`.

### Chiavi localStorage (da non rinominare: contengono i progressi dell'utente)
`italiano_srs_v1`, `italiano_user_items`, `italiano_esercizi_v1`, `italiano_settings_v1`,
`italiano_extra_v1`, `italiano_activity_v1`, `italiano_errori_v1`, `italiano_memory_best_v1`,
`sofia_*` (tutor: il nome storico è rimasto), `flashDir`, `scritturaModo`. Il backup
esporta tutto ciò che inizia con `italiano_` / `sofia_` tranne la chiave API.

## Struttura di `knowledge.json`

```
{
  "meta":        { project, level, version, updated },
  "dizionario":  [{ id, it, en, pos, tag[], g ('m'|'f'|'mf'), pl?, gpl?, livello? ('C1') }],  // parole da studiare (flashcard)
  "lessico":     [{ id 'x…', it, en, pos, g?, pl? }],   // parole di base e specialistiche: solo per l'analisi, NON nelle flashcard
  "verbi":       [{ inf, en, gruppo, coniugazioni{ 'indic.pres': [6 forme], … }, pp, aux, ger?, rifl? }],
  "frasi":       [{ id, it, en, tag, difficolta (1|2|3) }],
  "riferimento": [ sezioni di grammatica ],
  "palestra":    [{ id, titolo, livello, ref, teoria[], domande[] }],   // palestra di grammatica
  "percorso":    [{ id, citta, tema, passi[{ t, … }] }],               // Grand Tour
  "letture":     [{ id, titolo, frasi[{it,en}], glossario{}, domande[] }],
  "dialoghi":    [{ id, titolo, ruoli, battute[], parole[], nota }],
  "frasario":    [{ id, it, en, cat, reg, nota }],
  "luoghi":      [{ id, cat ('monumento'|'natura'|'cibo'), nome, dove, regione, ill, testo, en, parole, curiosita }],
  "cultura", "proverbi", "falsiAmici", "anatomia", "modididire", "pop"
}
```
- In app `DB.voci` è costruito da `montaVoci()`: `dizionario` + le parole salvate dall'utente.
- I verbi regolari del dizionario e del lessico che non sono in `verbi` vengono coniugati
  automaticamente (`verbiAuto()`); i verbi in -ere e gli irregolari vanno messi in `verbi`.
- `luoghi[].ill` e `percorso[].ill` sono id di illustrazioni presenti in `index.html` (`ill-<id>`).

## Immagini
Le illustrazioni sono **acquarelli leggeri ricavati da foto libere di Wikimedia Commons**
(richiesta dell'utente: «molto più realistiche delle vecchie SVG minimali, ma non foto» e poi
«devono essere **nitide**, l'effetto acquarello ci sta ma non troppo»): un piccolo filtro di
Kuwahara generalizzato + i dettagli fini della foto + nitidezza, partendo da foto a 1920 px.
**Non** tornare a un effetto pittura pesante né a file piccoli: sul telefono (3×) risultano sfocati.
- `img/luoghi/<ill>.webp` (1200×750) e `<ill>-s.webp` (480×300, per miniature e schede):
  `<ill>` è `luoghi[].ill` / `percorso[].ill` di `knowledge.json`. `piazza.webp` è la scena di Cultura.
- `img/cielo/{alba,giorno,tramonto,notte}.webp`: il panorama in testa alla home.
- `img/sfondo.webp`: la Val d'Orcia sullo sfondo (nel tema scuro scurita via CSS).
- `img/credits.json`: autore, licenza e link di ogni immagine, mostrati in Settings → Image credits.
  **Obbligatorio** per le licenze CC BY / CC BY-SA: ogni immagine nuova deve avere la sua voce.

Per aggiungere o rifare un'immagine (scrive anche la voce in `credits.json`):
```
pip install numpy opencv-python-headless
python3 tools/dipingi.py "File:<titolo su Commons>.jpg" <ill> --nome "Nome del luogo" [--focus X Y]
python3 tools/dipingi.py "File:<...>.jpg" giorno --cielo
```
Usare solo foto con licenza libera (CC0, pubblico dominio, CC BY, CC BY-SA), orizzontali e
senza folla. Se si aggiunge un luogo nuovo, aggiungere la sua miniatura `-s.webp` all'elenco
`ASSETS` di `sw.js` e incrementare `CACHE`.

## Service Worker: come arrivano gli aggiornamenti

`sw.js` usa una strategia **network-first**: ogni richiesta prova prima la rete (con `cache: 'no-cache'`, che rivalida la cache HTTP) e usa la cache solo se offline. Quindi:

- **Non serve** incrementare la versione cache a ogni deploy: gli utenti ricevono le modifiche al primo caricamento online.
- Il bump di `CACHE` (`italiano-b2-vN`) serve solo quando cambia l'array `ASSETS` o si vuole forzare la pulizia delle cache vecchie.
- **Non tornare a cache-first** in `sw.js`: in passato causava app bloccate sulla versione vecchia per sempre (l'unico modo per aggiornare era il bump manuale, facile da dimenticare).
- Il bottone "Update app" nelle impostazioni (`forceUpdate`) deregistra il SW, svuota le cache e ricarica con query `?fresh=<timestamp>` per bypassare anche la CDN di GitHub Pages (che cachea per ~10 minuti). Non usare `location.reload(true)`: il parametro è ignorato dai browser moderni e ricarica dalla cache HTTP.

> Nota: dopo un push su `main`, il deploy su GitHub Pages (workflow `deploy.yml`) impiega ~1-2 minuti, e la CDN può servire file vecchi fino a ~10 minuti. Se un utente preme "Update app" subito dopo un push, il cache-buster aggira la CDN, ma il deploy deve comunque essere finito.
