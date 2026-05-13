# Recommended Build Flow

The current app loads React, ReactDOM, Babel, and individual source files
directly in `index.html`. That keeps the project simple, but it also creates
cache-busting chores, runtime JSX compilation, and fragile script ordering.

Recommended migration:

1. Add Vite with React.
2. Move JSX entrypoint wiring into `src/main.jsx`.
3. Keep canonical atlas data in `public/data/` or import it deliberately from
   `src/data/`, depending on whether the editor must still write JSON files.
4. Replace manual `?v=...` cache busting with hashed production assets from
   `vite build`.
5. Publish the generated `dist/` folder to GitHub Pages.
6. Keep source/reference materials out of the runtime path.

Suggested scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "validate": "node scripts/validate.js",
    "build": "npm run validate && vite build",
    "preview": "vite preview"
  }
}
```

This would make local development faster, eliminate browser Babel in production,
and let GitHub Pages serve immutable hashed assets without manual version bumps.
