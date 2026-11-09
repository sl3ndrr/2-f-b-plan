# Architektur

1. Vite lädt die JSON-Dateien über `scripts/data-loader.ts`, prüft ihre Schemas mit Ajv und stellt die Daten als virtuelles Modul bereit.
2. Die Domäne filtert den Modulbestand, bestimmt exklusive Auswahlen und berechnet Credit-Anteile. Sie kennt weder DOM noch Browserspeicher.
3. Der Store lädt Modus und Haken aus dem Browserspeicher. Er aktualisiert den Zustand und benachrichtigt seine Subscriber.
4. `src/main.ts` verbindet den Store mit den UI-Komponenten. Der Fortschritt wird einmal pro Änderung ermittelt und an Hero, Kacheln und Checkliste gereicht.
5. Die Modulliste hat eigene Render- und Aktualisierungspfade. Ein Haken in einem geteilten Modul wird an beiden Stellen aus demselben Zustand angezeigt.

`npm run check` prüft zusätzlich die Konsistenz zwischen den Dateien, die verbindlichen Plan-Summen und die Referenzwerte der Originalanwendung.
