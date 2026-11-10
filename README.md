# Mutqaan Engineering & Construction: website

Static site plus Vercel serverless functions, with **no npm dependencies**.

- `public/`: the website (`index.html`, `content.json`, `media/`)
- `api/`: Vercel functions (inquiry inbox, admin, CMS, media, optional AI)
- `lib/`: shared server helpers and the workflow rules
- `source/`: editable source (styles, app scripts, 3D engine, content). Run `python3 source/build.py` to rebuild `public/index.html`.
- `test/`: run `npm test` (server tests); `node test/dev-server.js` starts a local stand-in for Vercel at http://127.0.0.1:8777

See **HANDOVER.md** for deployment, admin setup, security notes and how to extend the site.
