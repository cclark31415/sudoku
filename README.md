# Sudoku

A no-ads, mobile-friendly Sudoku web app. Three difficulties, optional hard mode, pencil-mark notes, hint system, scoring, Google Sign-In, and a donation button. Hosted on Azure Static Web Apps at **sudoku.chrisclark.net**.

## Features

- 9x9 board, drawn as 3x3 boxes of 3x3 cells
- Beginner / Intermediate / Expert difficulty (controls clue count + uniqueness checked)
- **Hard mode** — no feedback until you click Submit
- **Easy mode** (hard mode off) — wrong placements are flagged immediately and counted as a mistake
- Notes mode toggle. Notes render as a 3x3 mini-grid in each empty cell
- Sticky number selection: pick a number once, click cells to drop it (works for values and notes)
- 3 hints per game. Select a cell with notes, click Hint, one incorrect note disappears
- Row / column / box completion flashes the cells through 1–9
- Solved board dissolves from upper-left to lower-right
- Scoring: difficulty base + time bonus − mistake/hint penalties
- Sign in with Google (OAuth 2.0) to namespace your scores
- "Buy me a Diet Pepsi" donation links (PayPal + Venmo)
- Mobile-friendly responsive layout, no framework — easy to wrap with Capacitor or a WKWebView for native apps

## Run locally

It's a static site. Any local server works:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Then open http://localhost:8080.

## Project layout

```
.
├── index.html                   # markup
├── styles.css                   # styles + animations
├── sudoku.js                    # puzzle generation/solving
├── app.js                       # game state, UI, scoring, auth
├── staticwebapp.config.json     # Azure SWA routing/headers
├── .github/workflows/
│   └── azure-static-web-apps.yml
└── README.md
```

## Configure Google Sign-In

1. Create an OAuth 2.0 Web client ID in Google Cloud Console.
2. Add authorized JavaScript origins:
   - `https://sudoku.chrisclark.net`
   - `http://localhost:8080` (or your dev origin)
3. Open `app.js` and set `GOOGLE_CLIENT_ID` to your client ID.

If `GOOGLE_CLIENT_ID` is empty the Sign-in button falls back to a local-only profile prompt — useful for development.

> Scores are saved to `localStorage`. Guests' scores live under `sudoku_scores_local`; once a user signs in, those local scores are merged into their account bucket (`sudoku_scores_<sub>`) and the local list is cleared. To persist scores remotely as well, add a backend endpoint and uncomment the `fetch("/api/scores", …)` call in `saveScore` in `app.js`. Validate the Google ID token (`state.user.idToken`) on the server.

## Configure donation links

Open `index.html` and replace the placeholder URLs in the footer:

```html
<a id="paypalBtn" href="https://paypal.me/yourhandle">…</a>
<a id="venmoBtn"  href="https://venmo.com/yourhandle">…</a>
```

## Deploy to Azure Static Web Apps

The repo deploys via the GitHub Actions workflow in `.github/workflows/azure-static-web-apps.yml`.

### One-time setup

1. In the Azure portal, create a **Static Web App** resource (Free tier is fine).
2. Choose **GitHub** as the source. Pick this repo and the `main` branch.
3. For build details select **Custom** with:
   - **App location:** `/`
   - **Api location:** *(leave empty)*
   - **Output location:** *(leave empty)*
4. Azure will commit a workflow file. Replace it with the one already in this repo (or let Azure overwrite — the contents are equivalent).
5. Grab the **deployment token** from the Azure Static Web App's overview page (`Manage deployment token`).
6. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: *(paste the deployment token)*
7. Push to `main` — the workflow runs and deploys.

### Custom domain: sudoku.chrisclark.net

1. In the Static Web App resource: **Settings → Custom domains → Add → Custom domain on other DNS**.
2. Enter `sudoku.chrisclark.net`. Azure shows a **CNAME** target (looks like `nice-name-1234.azurestaticapps.net`) and a **TXT validation** record.
3. In your `chrisclark.net` DNS provider, add:
   - **CNAME** `sudoku` → the Azure-supplied target
   - **TXT** record per the validation instructions (only required for the apex; subdomains can usually skip via the CNAME-only flow)
4. Click **Validate** in the portal. Once validated, Azure issues a managed TLS certificate automatically.

### Pull request previews

The workflow opens a staging environment for every PR (`build_and_deploy` runs on `pull_request: opened/synchronize/reopened`) and tears it down on `closed` via the `close_pull_request` job. The staging URL is posted as a PR comment.

## Mobile

The layout is responsive and the board uses `aspect-ratio: 1 / 1`, so it scales cleanly down to phones. To ship as a native app, wrap the static files with [Capacitor](https://capacitorjs.com/) — `npx cap add ios && npx cap add android`, copy the static files into `www/`, and you have iOS/Android shells with no code changes.

## Scoring

```
score = max(0, base + time_bonus − mistake_penalty − hint_penalty)
```

| Component        | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| `base`           | 1000 (beginner) / 2500 (intermediate) / 5000 (expert)  |
| `time_bonus`     | `max(0, 1800 − seconds_elapsed)` (zeroes out at 30 min)|
| `mistake_penalty`| `mistakes × 75`                                         |
| `hint_penalty`   | `hints_used × 100`                                      |

Tweak the constants in `computeScore` in `app.js` if you want a different curve.

## Keyboard shortcuts

| Key                        | Action                                  |
| -------------------------- | --------------------------------------- |
| `1`–`9`                    | Select that number (and apply if a cell is selected) |
| `Backspace` / `Delete` / `0` | Erase selected cell                   |
| `N`                        | Toggle notes mode                       |
| Arrow keys                 | Move selection                          |
