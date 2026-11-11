# Neue Inhalte hinzufügen

Die Website ist in einzelne HTML-Dateien aufgeteilt.

## Wo bearbeite ich Inhalte?

- Startseite und Kategorien: `index.html`
- Gemeinsames Design: `assets/style.css`
- Suche auf den Themenseiten: `assets/search.js`
- Fachinhalte: einzelne Dateien im Ordner `pages/`

## Einen Artikel ergänzen

1. Öffne die passende Datei unter `pages/`, zum Beispiel `pages/networking.html`.
2. Füge den neuen Artikel innerhalb von `<main>` vor dem abschließenden `</main>` ein.
3. Verwende die Vorlage unten.
4. Speichere und committe die Änderung.

## Artikel-Vorlage

```html
<article class="article">
  <span class="tag">Grundlagen</span>
  <h2>Titel des Artikels</h2>
  <p>Kurze und klare Erklärung.</p>
  <h3>Schritte</h3>
  <ol>
    <li>Erster Schritt</li>
    <li>Zweiter Schritt</li>
  </ol>
  <h3>Beispiel-Befehle</h3>
  <pre><code>example-command --option</code></pre>
  <div class="note">Wichtiger Hinweis oder Best Practice.</div>
</article>
```

## Eine neue Kategorie anlegen

1. Erstelle eine HTML-Datei im Ordner `pages/`.
2. Kopiere den Aufbau einer bestehenden Themenseite.
3. Passe Titel, Beschreibung und Inhalte an.
4. Ergänze einen Link in der Navigation der Themenseiten und eine Karte in `index.html`.

**Tipp:** Für normale Ergänzungen musst du keine neue Kategorie erstellen. Füge den Artikel einfach in die passende Themendatei ein.
