# Bestand vor dem Umbau

- Eine HTML-Datei enthält Daten, Styles, DOM-Rendering und Fortschrittslogik.
- Der Plan und die Ansicht aller Optionen teilen Modul-IDs und gespeicherte Haken. Fremde IDs werden beim Laden verworfen. Wahlpflicht und Datenbanken schließen jeweils andere Optionen derselben Gruppe aus.
- Suche, Status- und Kategoriefilter begrenzen die sichtbaren Zeilen. Der Gesamtstand deckelt jede Kategorie separat.
- Kacheln und Gesamtanzeige zeigen den Stand. Abschnittsköpfe zeigen nur das Soll. Der Bedarf für Informatik-Wahlmodule verwendet die Konstante 47.
- Das Oszilloskop zeichnet pro Frame neu. Das Layout endet bei 1080 px. Theme-Wahl und Fortschrittsexport fehlen.
- Die unveränderte Vorlage liegt unter [legacy/index.original.html](legacy/index.original.html). Der Referenztest führt ihre ursprünglichen Berechnungen mit leerem und vollständigem Plan aus.

| Zustand     | Physik | Informatik | Fachdidaktik | Bildungswiss. | Optionalbereich | Bachelorarbeit | Gesamt |
| ----------- | -----: | ---------: | -----------: | ------------: | --------------: | -------------: | -----: |
| Leer        |      0 |          0 |            0 |             0 |               0 |              0 |      0 |
| Vollständig |     66 |         66 |            6 |            20 |              10 |             12 |    180 |
