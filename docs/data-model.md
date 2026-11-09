# Datenmodell

| Datei             | Felder                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `categories.json` | Stabile `id`, `name`, `symbol`, `required` in C, `colorToken`, `tileDescription`, `band`, `checklistLabel`.   |
| `groups.json`     | Stabile `id`, `labels` nach Modus, `exclusive` im Alle-Modus, optional belegte `fixedCredits` nach Kategorie. |
| `modules.json`    | Stabile `id`, sichtbarer `code` und `title`, `credits` nach Kategorie, `group`, `offered`, sichtbare `note`.  |
| `plan.json`       | Liste stabiler Modul-IDs. Die Liste ist die einzige Quelle für die Plan-Mitgliedschaft.                       |
| `meta.json`       | Dokumenttitel, Quellenhinweis und Erläuterung der Plan-Auswahl.                                               |

Die Reihenfolge in Kategorien, Gruppen und Modulen bestimmt die Anzeige. `offered` kennt `WiSe`, `SoSe`, `both` und `null`. Beim Umbau wurden die expliziten Hinweise „nur WiSe“ und „nur SoSe“ übernommen. Die ursprüngliche Notiz bleibt sichtbar.

## Beispiele

- `p2701` führt `{"phy": 3, "did": 3}`. In jeder Kategorie erscheint der jeweilige Anteil, beide Zeilen teilen einen Haken.
- `i1601a` und `i1601b` stehen für die beiden unabhängig gespeicherten Seminare von B.Inf.1601. Jeweils 3 C gehen in Informatik bzw. Fachdidaktik.
- `i1605` steht im Plan, `i1206` ist eine Alternative im Alle-Modus. Beide gehören zur exklusiven Gruppe `db`.

Die JSON-Schemas beschreiben erlaubte Werte. TypeScript-Verträge liegen in `src/domain/types.ts`. Der Vite-Datenloader gibt erst nach erfolgreicher Schema-Prüfung einen typisierten Datensatz an die Anwendung weiter.
