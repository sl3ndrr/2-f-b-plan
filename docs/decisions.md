# Technische Entscheidungen

- **Vite** bündelt Vanilla DOM für Projekt-Pages. **TypeScript** prüft die Verträge im Strict-Modus. **@types/node** typisiert die lokalen Build-Skripte.
- **Ajv** validiert JSON-Schemas in Vite und beim separaten Datencheck. Die Browser-Version enthält nur die validierten Daten. `domain/types.ts` definiert die TypeScript-Verträge.
- **Vitest** prüft reine Logik. Der vor dem Umbau angelegte Referenztest verwendet die mit Node.js ausgelieferte VM und führt die unveränderten Berechnungen des Originals aus.
- **ESLint**, **@eslint/js** und **typescript-eslint** prüfen JavaScript und TypeScript. **Prettier** sorgt für einheitliche Formatierung.
- `plan.json` ist die einzige Quelle für die Plan-Zugehörigkeit. Die Reihenfolge der Modulliste bleibt bei den Moduldaten.
- Die Einzeldatei entsteht aus demselben Vite-Build. Ein kleines Build-Skript integriert die erzeugten CSS- und JS-Dateien. Vite integriert die lokal mitgelieferten Schriften. So ist kein zusätzliches Vite-Plugin nötig.
- IBM Plex Sans und JetBrains Mono stammen aus dem Google-Fonts-Repository. Die lokalen WOFF2-Dateien decken lateinische Zeichen und UI-Symbole ab. Die OFL-Lizenzen liegen daneben.
- Die beiden Oszilloskop-Pfade werden einmal erzeugt. CSS verschiebt jeden Pfad um seine Wellenlänge. Die festen SVG-Clips zeigen weiter den jeweiligen Credit-Anteil. Tab- und Hero-Sichtbarkeit steuern die Ruhephasen.
- CSS Grid steuert die Spalten an zentralen Viewport-Grenzen. Die Abschnittsköpfe passen sich mit Container Queries ihrer eigenen Spaltenbreite an. Die `rem`-Grenzen stehen zusammen in `layout.css`, da CSS-Variablen in nativen Abfragen nicht aufgelöst werden.
- **Playwright** erzeugt die Screenshots und prüft die Breakpoints und den Offline-Start in Chromium. Die PNGs entstehen in `docs/screenshots/` und werden im CI-Lauf als Artefakt abgelegt.
