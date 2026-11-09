# Rezepte

## Modul ergänzen

1. In `data/modules.json` einen Eintrag mit einer neuen, stabilen ID anlegen.
2. Credit-Anteile, Gruppe und Hinweis mit der Quelle abgleichen.
3. Falls sich der Plan ändert, die Auswahl in `data/plan.json` entsprechend anpassen.
4. `npm run check` ausführen.

## Kategorie pflegen

1. Anzeigename und Beschreibung in `data/categories.json` anpassen.
2. Soll-Änderungen mit der Studienordnung belegen. Betroffene Credit-Anteile und die Prüfvorgaben in `scripts/validate-data.ts` gemeinsam prüfen.
3. `npm run check` ausführen.

## Farbe ändern

1. Den `colorToken` der Kategorie in `data/categories.json` nachsehen.
2. Die CSS-Variable in `src/styles/tokens.css` für beide Themes anpassen.
3. Textkontrast auf Hintergrund und Karten prüfen.
