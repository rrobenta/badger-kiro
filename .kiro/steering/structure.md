# Project Structure

```
badger-kiro/
├── index.html      # App shell, all pages and modals (single HTML file)
├── styles.css      # All styles — dark theme, mobile-first layout
├── app.js          # All logic — state, rendering, CRUD, localStorage
├── manifest.json   # PWA manifest for "Add to Home Screen"
├── icon.svg        # App icon
└── .kiro/
    └── steering/   # Kiro context docs
```

## Conventions

- Single-page app: all four "pages" (Dashboard, Members, Classes, Payments) live in `index.html` and are shown/hidden via CSS
- State lives in a single `state` object, persisted to `localStorage`
- All rendering functions are named `render<Page>()` and called on navigation
- Modals are bottom-sheet style, toggled with `openModal()` / `closeModal()`
- No build step — edit files and refresh the browser
