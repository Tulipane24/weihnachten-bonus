# Landing del bonus – Weihnachten weitererzählen (Annelie Hartwig)

Pagina in tedesco, nei colori della copertina (verde abete, oro, crema) dove i lettori lasciano **nome, cognome ed email** e solo dopo ricevono il link al bonus. C'è anche una casella **facoltativa e non spuntata** per chi vuole ricevere notizie: nel foglio trovi "sì" o "no".

I contatti finiscono nel tuo Google Sheet **"Lead Weihnachten"**, nella scheda **"Lead"**.

Come funziona:
- `index.html` + `cover.jpg`: la pagina.
- `api/submit.js`: la funzione su Vercel. Salva il contatto nel foglio e **solo se il salvataggio riesce** restituisce il link del bonus. Il link non è mai nel codice della pagina: sta in una variabile di Vercel.
- `apps-script/Code.gs`: lo script da incollare nel foglio. Scrive nella scheda "Lead" (la crea da sola). Se la stessa email si iscrive di nuovo, aggiorna la riga invece di duplicarla.
- `.env.example`: le 3 variabili da copiare su Vercel. La password condivisa (`APPS_SCRIPT_SECRET`) è **già generata** e uguale a quella dentro `Code.gs`: non devi inventarla né cambiarla. È diversa da quella degli altri libri.

Già collegati: il foglio "Lead Weihnachten" (ID `1FzF4pa9ty86u3JR8L3sY2F62LrIMTeqp_tygKCPHyT8`) dentro `Code.gs` e il link del bonus in `.env.example`.

**È un progetto separato** dagli altri libri: ha il suo foglio, il suo script, il suo repository GitHub e il suo progetto Vercel, quindi anche un suo indirizzo.

---

## 1. Google Sheet + Apps Script (10 minuti)

1. Apri il foglio: https://docs.google.com/spreadsheets/d/1FzF4pa9ty86u3JR8L3sY2F62LrIMTeqp_tygKCPHyT8/edit
2. Menu **Estensioni → Apps Script**. Si apre una nuova scheda con un file `Codice.gs`.
3. Cancella tutto quello che c'è dentro e incolla l'intero contenuto di `apps-script/Code.gs` **così com'è**, senza modifiche. Premi l'icona del dischetto (Salva).
4. In alto a destra: **Esegui il deployment → Nuovo deployment**.
5. Clicca l'ingranaggio accanto a "Seleziona tipo" e scegli **Applicazione web**. Imposta:
   - Esegui come: **Me**
   - Chi ha accesso: **Chiunque**
6. Clicca **Esegui il deployment**, poi **Autorizza accesso** e scegli il tuo account Google.
7. Comparirà la schermata **"Google non ha verificato questa app"**: è normale per uno script personale. Clicca **Avanzate → Vai a … (non sicuro) → Consenti**.
8. Copia l'**URL dell'applicazione web**: finisce con `/exec`. Ti serve al punto 3.

## 2. GitHub (5 minuti)

1. Scompatta lo zip sul computer.
2. Su https://github.com clicca **New repository**, chiamalo per esempio `weihnachten-weitererzaehlen-bonus`, lascialo **Private** e crealo.
3. Clicca **uploading an existing file** e trascina **tutto il contenuto** della cartella scompattata: `index.html`, `cover.jpg`, le cartelle `api` e `apps-script`, `README.md`, `package.json`, `.gitignore`, `.env.example`.
   - Su Windows i file che iniziano con il punto possono essere nascosti: in Esplora file attiva **Visualizza → Elementi nascosti**.
4. Clicca **Commit changes**.

## 3. Vercel (5 minuti)

1. Su https://vercel.com accedi con GitHub e clicca **Add New → Project**.
2. Importa il repository appena creato. Framework Preset: **Other**. Non toccare i comandi di build.
3. **Prima di cliccare Deploy**, apri **Environment Variables** e aggiungi queste 3 variabili (i valori sono in `.env.example`):
   - `GOOGLE_SCRIPT_URL` = l'URL `/exec` copiato al punto 1.8
   - `APPS_SCRIPT_SECRET` = il valore già scritto in `.env.example` (copialo identico)
   - `BONUS_DRIVE_URL` = il link Drive del bonus (già scritto in `.env.example`)
4. Clicca **Deploy**. Alla fine Vercel ti dà l'indirizzo pubblico (es. `weihnachten-weitererzaehlen-bonus.vercel.app`).

**Attenzione:** se aggiungi o cambi le variabili *dopo* il primo deploy, la funzione non le vede finché non rifai il deploy: **Deployments → … sull'ultimo → Redeploy**.

## 4. Prova finale

1. Apri l'indirizzo pubblico, compila il form con un tuo indirizzo email e invia.
2. Deve comparire "Deine Vorlagen sind bereit" con il pulsante che apre il PDF. Prima dell'invio il link non deve esserci.
3. Apri il foglio "Lead Weihnachten" e guarda la scheda **"Lead"** (in basso, accanto a "Foglio1"): deve esserci la tua riga. Non cercarla nella prima scheda: lo script scrive solo in "Lead".
4. Se compare un errore o la riga non c'è: su Vercel apri il progetto → **Logs** (i Runtime Logs della funzione, non i log di build) e leggi il messaggio. Le cause tipiche sono una variabile mancante (rifai il deploy), un URL che non finisce in `/exec`, o lo script pubblicato senza "Chiunque" come accesso.

## Se un giorno modifichi Code.gs

Ripubblica da **Esegui il deployment → Gestisci deployment → matita (Modifica) → Versione: Nuova versione → Esegui il deployment**. Non fare un "Nuovo deployment": creerebbe un URL `/exec` diverso e dovresti aggiornarlo su Vercel.

## Dati raccolti

La scheda "Lead" contiene: Data, Nome, Cognome, Email, Libro, Ultimo accesso, Accessi, Lingua, Consenso notizie. È già l'elenco dei contatti, aggiornato in tempo reale.

## Dopo la pubblicazione

Il QR stampato nel libro oggi apre direttamente il PDF su Drive, quindi chi lo scansiona salta il form. Quando la pagina è online, il QR va rifatto con l'indirizzo Vercel.

## Attenzione (non è consulenza legale)

- In Germania un sito con scopo commerciale di solito deve avere un **Impressum** e una **Datenschutzerklärung** (informativa privacy) raggiungibili da ogni pagina. La pagina non le contiene perché servono i tuoi dati reali di titolare: falle verificare a un professionista o con un generatore affidabile e aggiungi i link in fondo alla pagina.
- Scrivi solo a chi ha **"sì"** in "Consenso notizie", e per le newsletter usa il **double opt-in** (email di conferma prima del primo invio), che in Germania è la prassi.
- I dati sono salvati in Google Sheets: indicalo nell'informativa.
