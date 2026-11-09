# Vincents Plan · Physik × Informatik

Interaktiver Fortschrittstracker für den Göttinger Zwei-Fächer-Bachelor mit Lehramtsoption. Die Anwendung zeigt Vincents 180-C-Plan oder alle erfassten Moduloptionen und speichert Haken lokal im Browser.

## Lokal starten

Node.js ab 22.13 installieren, danach:

```sh
npm ci
npm run dev
npm run check
```

Der Entwicklungsserver meldet die Adresse. `npm run build` erzeugt die Pages-Version in `dist/`. Mit `npm run build:single` entsteht `dist-single/index.html`, die sich direkt und offline öffnen lässt. Browser behandeln lokal geöffnete Dateien und die Pages-Adresse als separate Speicherbereiche.

## GitHub Pages

In den Repository-Einstellungen unter **Pages → Build and deployment → Source** einmalig **GitHub Actions** auswählen. Der Workflow prüft Branches und Pull Requests. Auf `main` veröffentlicht er nach erfolgreicher Prüfung den Build unter [sl3ndrr.github.io/2-f-b-plan/](https://sl3ndrr.github.io/2-f-b-plan/). Die Offline-Datei steht im Workflow als Download bereit.

## Daten pflegen

Module, Kategorien, Gruppen, Plan-Auswahl und Quellenhinweis liegen in `data/`. [Datenmodell](docs/data-model.md) und [Rezepte](docs/recipes.md) erläutern die Felder. Die [Architektur](docs/architecture.md) zeigt den Weg von den JSON-Dateien zur Anzeige. Bei fachlichen Unklarheiten siehe [offene Fragen](docs/open-questions.md).

Animationen laufen mit normaler Geschwindigkeit. Bei systemweit reduzierter Bewegung sind sie deaktiviert.

## Browserprüfung und Screenshots

```sh
npm run build
npm run build:single
npx playwright install chromium
npm run screenshots
```

Das Skript erzeugt je eine helle und dunkle Ansicht für 390×844, 1280×800, 1920×1080, 2560×1440, 3440×1440 und 3840×2160 in `docs/screenshots/`. Es prüft außerdem horizontales Überlaufen, Spaltenpositionen und den Start der Einzeldatei ohne Netz. Der CI-Lauf stellt die Screenshots als ZIP bereit.

## Fortschritt sichern oder zurücksetzen

**Sichern** lädt eine JSON-Datei mit den gesetzten Haken herunter. **Laden** ersetzt die Haken durch die Sicherung und meldet verworfene unbekannte IDs. **Kopieren** übernimmt Gruppenstände und offene Pflichtmodule in die Zwischenablage. Die Druckansicht enthält denselben Bericht.

**Zurücksetzen** löscht nach Bestätigung ausschließlich die Haken. Modus und Theme (`zfb2_theme`) bleiben gespeichert.

## Contributors

- **GPT Codex (OpenAI)** – Repository-Umbau, Weiterentwicklung der Oberfläche, Tests und Dokumentation.
