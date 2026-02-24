# Initial Backlog Tickets

Diese Datei enthaelt die 8 priorisierten Start-Tickets aus der Analyse.
Jeder Abschnitt kann direkt als GitHub-Issue angelegt werden.

## 1. [P0][Security] Secrets aus Client-Code entfernen und Konfiguration haerten
- Type: `Security`
- Area: `Storage`
- Labels: `type: security`, `priority: p0`, `area: storage`
- Problem:
  - API-Token und Firebase-IDs stehen im Frontend-Code.
- Scope:
  - `js/storage.js`
- Acceptance Criteria:
  - [ ] Keine produktiven Secrets mehr im Frontend-Repository.
  - [ ] Konfiguration erfolgt ueber sichere Runtime- oder Build-Umgebung.
  - [ ] Dokumentation fuer lokale Entwicklungs-Konfiguration vorhanden.

## 2. [P0][Security] Passwort-Handling ueberarbeiten (kein Klartext)
- Type: `Security`
- Area: `Auth`
- Labels: `type: security`, `priority: p0`, `area: auth`
- Problem:
  - Passwoerter werden als Klartext gespeichert und verglichen.
  - Neue Kontakte bekommen ein Default-Passwort aus dem Vornamen.
- Scope:
  - `js/signUp.js`
  - `js/login.js`
  - `js/contact_popups.js`
- Acceptance Criteria:
  - [ ] Keine Klartext-Passwoerter mehr in Storage/Firebase.
  - [ ] Login verifiziert nur gehashte/sichere Credentials.
  - [ ] Kontaktanlage erzeugt keine unsicheren Default-Passwoerter.

## 3. [P1][Bug] Mobile Greeting in Summary stabilisieren
- Type: `Bug`
- Area: `Summary`
- Labels: `type: bug`, `priority: p1`, `area: summary`
- Problem:
  - In `hideMobileGreeting()` wird `subMainSummary` ausserhalb des Scopes verwendet.
  - Das fuehrt je nach Ablauf zu Laufzeitfehlern.
- Scope:
  - `js/summary.js`
- Acceptance Criteria:
  - [ ] Kein `ReferenceError` mehr beim Schliessen des Mobile Greeting.
  - [ ] Greeting-Verhalten ist auf Mobile konsistent reproduzierbar.

## 4. [P1][Bug] Firebase-Nullfaelle und Fehlerbehandlung absichern
- Type: `Bug`
- Area: `Storage`
- Labels: `type: bug`, `priority: p1`, `area: storage`
- Problem:
  - Mehrere Flows gehen davon aus, dass `firebaseGetItem()` immer ein valides Array liefert.
  - Bei `null` oder Fehlern sind Folgefehler wahrscheinlich.
- Scope:
  - `js/addTask_tasks.js`
  - `js/contacts.js`
  - `js/login.js`
- Acceptance Criteria:
  - [ ] Alle Lesezugriffe auf Firebase behandeln `null`/Fehler robust.
  - [ ] UI zeigt sinnvolle Fehlermeldungen statt stiller Folgefehler.

## 5. [P1][Bug] Fetch-Wrapper korrigieren (`headers`) und Responses pruefen
- Type: `Bug`
- Area: `Storage`
- Labels: `type: bug`, `priority: p1`, `area: storage`
- Problem:
  - In Fetch-Aufrufen wird `header` statt `headers` genutzt.
  - Responses und Fehlercodes werden nicht ausgewertet.
- Scope:
  - `js/storage.js`
- Acceptance Criteria:
  - [ ] Alle Requests nutzen korrekte Fetch-Optionen.
  - [ ] Nicht-OK Responses fuehren zu kontrollierter Fehlerbehandlung.
  - [ ] Aufrufer koennen Fehler sauber behandeln.

## 6. [P2][Refactor] Login/Signup-Logik entkoppeln und Duplikate entfernen
- Type: `Refactor`
- Area: `Auth`
- Labels: `type: refactor`, `priority: p2`, `area: auth`
- Problem:
  - Signup-Validierungen existieren doppelt in `signUp.js` und `login.js`.
  - Die Login-Seite laedt Signup-Skripte und umgekehrt.
- Scope:
  - `index.html`
  - `signUp.html`
  - `js/login.js`
  - `js/signUp.js`
- Acceptance Criteria:
  - [ ] Keine doppelte Validierungslogik mehr.
  - [ ] Login und Signup haben klar getrennte Verantwortlichkeiten.
  - [ ] Seite laedt nur die wirklich benoetigten Skripte.

## 7. [P2][Refactor] Implizite globale Variablen entfernen
- Type: `Refactor`
- Area: `Tooling`
- Labels: `type: refactor`, `priority: p2`, `area: tooling`
- Problem:
  - Mehrere Dateien schreiben auf nicht deklarierte Variablen.
  - Das erhoeht Seiteneffekte und Debug-Aufwand.
- Scope:
  - `script.js`
  - `js/contacts.js`
  - `js/summary.js`
- Acceptance Criteria:
  - [ ] Alle Variablen sind mit `const`/`let` sauber deklariert.
  - [ ] Keine unbeabsichtigten Globals mehr im Runtime-Kontext.

## 8. [P3][Chore] Debug-Logs bereinigen und minimalen CI-Check einrichten
- Type: `Chore`
- Area: `Tooling`
- Labels: `type: chore`, `priority: p3`, `area: tooling`
- Problem:
  - Mehrere `console.log`-Ausgaben sind noch im Produktivcode.
  - Es gibt keinen einfachen automatischen Syntax-/Qualitaetscheck.
- Scope:
  - `js/filepicker.js`
  - `js/board.js`
  - `.github/workflows/*`
- Acceptance Criteria:
  - [ ] Ueberfluessige Debug-Logs entfernt.
  - [ ] GitHub Action prueft mindestens JS-Syntax bei Push/PR.
  - [ ] Fehlende Checks blockieren fehlerhafte Aenderungen fruehzeitig.
