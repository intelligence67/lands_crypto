# Baraja Landing

`baraja.cuatrobet.com` keeps its own campaign design and now supports the standalone CuatroBet server deployment flow.

## What stays unchanged

- the existing Patricio layout, hero, modal, and visual styling
- the current bonus selection UI
- the current phone-entry interaction and background assets

## What was added

- Vite build and local preview commands
- the CuatroBet registration payload contract
- MTFEF-aware marketing metadata collection
- shared main-repo export through `../../template/scripts/build-repo.mjs`
- standalone server export through `../../template/scripts/build-server.mjs`
- direct MTFEF bootstrap plus marketing-link propagation for dedicated-host deployment

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Export into the main repo

```bash
npm run build:repo
```

That command:

1. builds the landing
2. resolves the target main repo
3. switches the target repo to `main`
4. pulls with `--ff-only`
5. creates or switches branch `patricio`
6. writes the integrated landing into `patricio/`
7. stages only the Patricio landing files

`landing.export.json` sets this landing to the standard Bono-style integrated shell, so the exported version includes:

- `marketing_lib_script.inc`
- `/common/css/landing-email-hint-fix.css`
- `/common/js/auth-helper-v2.js`
- `/common/js/landing-welcome-adapter.js`
- `window.nnbonus`
- `window.landing_type = "registration_on_landing"`

## Repo override

```bash
npm run build:repo -- --repo-dir /abs/path/to/inicio.cuatrobet.com
CUATRO_MAIN_REPO_DIR=/abs/path/to/inicio.cuatrobet.com npm run build:repo
```

## Integration notes

- In the raw repo, Patricio can submit directly to the registration API for local testing.
- In the integrated repo, Patricio detects `window.sendApiRequest` and uses the shared CuatroBet submit path instead.
- The visual DOM is Patricio-specific, so this landing ships its own bridge logic while still using the same backend/auth/MTFEF stack as Bono after export.

## Standalone server export

```bash
npm run build:server
```

This landing's `landing.export.json` defines:

- `serverHost: "baraja.cuatrobet.com"`
- `nnbonus: "3"`

`build:server` copies the built files into `/Volumes/DATA/Work/cuatro/landings/server/baraja.cuatrobet.com` for direct sync to `/var/www/baraja.cuatrobet.com`.
