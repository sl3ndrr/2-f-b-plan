# Einstieg für Agenten

Dieser Tracker zeigt den Studienfortschritt im Göttinger Zwei-Fächer-Bachelor Physik × Informatik. Er stellt Vincents 180-C-Plan und die verfügbaren Optionen gegenüber. Die Anwendung läuft statisch und speichert den Fortschritt im Browser.

## Befehle

- `npm ci` installiert die Entwicklungswerkzeuge. Node.js ab 22.13 verwenden.
- `npm run dev` startet Vite.
- `npm run check` prüft Typen, Lint, Format, Daten, Tests und beide Builds.
- `npm run build` baut die Pages-Version, `npm run build:single` die Offline-Datei.

## Orientierung

| Aufgabe                             | Ort                                                               |
| ----------------------------------- | ----------------------------------------------------------------- |
| Modul, Credits oder Hinweis pflegen | `data/modules.json`                                               |
| Plan-Auswahl pflegen                | `data/plan.json`                                                  |
| Kategorie oder Gruppenregel pflegen | `data/categories.json`, `data/groups.json`, `src/domain/rules.ts` |
| Typen und Datenvalidierung prüfen   | `src/domain/types.ts`, `data/schema/`, `scripts/`                 |
| Fortschritt oder Filter ändern      | `src/domain/`, `tests/domain/`                                    |
| Browserspeicher und Zustand ändern  | `src/state/`                                                      |
| Oberfläche und Interaktion ändern   | `src/ui/`, `src/main.ts`                                          |
| Farben und Schriften ändern         | `src/styles/tokens.css`                                           |
| Historisches Verhalten vergleichen  | `docs/legacy/`, `tests/legacy.test.mjs`                           |

## Invarianten

- Modulcodes, Titel, Credits, Hinweise, Gruppen und Quellenhinweis bleiben beim Umbau unverändert. Fachliche Unklarheiten in `docs/open-questions.md` dokumentieren.
- Modul-IDs und Speicherformate bleiben stabil. `zfb2_done_v2` enthält ein JSON-Array, `zfb2_mode` ist `plan` oder `all`. Beim Laden fremde IDs verwerfen.
- Der Plan ergibt exakt 180 C. Physik 66, Informatik 66, Fachdidaktik 6, Bildungswissenschaften 20, Optionalbereich 10, Bachelorarbeit 12.
- Geteilte Module zählen nur ihren jeweiligen Anteil. Der Gesamtwert deckelt jede Kategorie separat.
- UI und Doku auf Deutsch, technische Bezeichner und Kommentare auf Englisch. Domänenlogik bleibt rein und frei von DOM und Speicherzugriff.
- Studieninhalte stehen in den Daten, keine Laufzeitabhängigkeiten und kein Backend.

Fertig ist eine Änderung, wenn `npm run check` grün ist und die relevanten Invarianten erhalten sind.

`zfb2_theme` speichert `light` oder `dark`. Animationen folgen der Systemeinstellung für reduzierte Bewegung. Zurücksetzen betrifft nur die Haken.
