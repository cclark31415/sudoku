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

## Build versioning

The page displays a build stamp (version + timestamp) in the footer for debugging/testing. It's stored in `version.json`:

```json
{
  "version": "1.0.0",
  "buildTime": "2026-04-26T15:30:00Z"
}
```

Update this file before each release or configure your CI/CD to generate it with the commit hash and current timestamp.

## Run locally

It's a static site. Any local server works from the `www` directory:

```bash
# Python
python3 -m http.server 8080 --directory www

# Node
npx serve www
```

Then open http://localhost:8080.

## Project layout

All web-related assets are stored in the `www/` directory. This structure was adopted to support a "single-repo" strategy for both the web app and future native mobile apps (using Capacitor). The root of the repository is reserved for native project folders (`android/`, `ios/`) and configuration files.

```
.
├── www/                         # All web assets
│   ├── index.html               # markup
│   ├── styles.css               # styles + animations
│   ├── sudoku.js                # puzzle generation/solving
│   ├── app.js                   # game state, UI, scoring, auth
│   └── staticwebapp.config.json # Azure SWA routing/headers
├── .github/workflows/
│   └── azure-static-web-apps.yml
├── design.md                    # Planning and migration notes
└── README.md
```

## Google Sign-In

Google OAuth 2.0 is configured for `sudoku.chrisclark.net`. The Client ID is in `app.js` (`GOOGLE_CLIENT_ID`).

If the OAuth consent screen is still in **Testing** mode in Google Cloud Console, only added test users can sign in. To allow any Google user, publish the consent screen.

If `GOOGLE_CLIENT_ID` is empty the Sign-in button falls back to a local-only profile prompt — useful for development.

> Scores are saved to `localStorage`. Guests' scores live under `sudoku_scores_local`; once a user signs in, those local scores are merged into their account bucket (`sudoku_scores_<sub>`) and the local list is cleared. To persist scores remotely as well, add a backend endpoint and uncomment the `fetch("/api/scores", …)` call in `saveScore` in `app.js`. Validate the Google ID token (`state.user.idToken`) on the server.

## Configure donation links

The donation links in the footer of `index.html` are currently set to:

- **PayPal:** `paypal@chrisclark.net` (Personal account link)
- **Venmo:** `@Christopher-Clark-1140`

```html
<a id="paypalBtn" href="https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=paypal@chrisclark.net&...">…</a>
<a id="venmoBtn"  href="https://venmo.com/Christopher-Clark-1140">…</a>
```

## Deploy to Azure Static Web Apps

The repo deploys via the GitHub Actions workflow in `.github/workflows/azure-static-web-apps.yml`.

### One-time setup

1. In the Azure portal, create a **Static Web App** resource (Free tier is fine).
2. Choose **GitHub** as the source. Pick this repo and the `main` branch.
3. For build details select **Custom** with:
   - **App location:** `/www`
   - **Api location:** *(leave empty)*
   - **Output location:** *(leave empty)*
4. Azure will commit a workflow file. Replace it with the one already in this repo (or let Azure overwrite — the contents are equivalent).
5. Grab the **deployment token** from the Azure Static Web App's overview page (`Manage deployment token`).
6. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: *(paste the deployment token)*
7. Push to `main` — the workflow runs and deploys.

### Custom domain: sudoku.chrisclark.net

1. In the Static Web App resource: **Settings → Custom domains → Add**.
2. Enter `sudoku.chrisclark.net`. Azure will guide you through validation based on where your domain is hosted.
3. Since `chrisclark.net` is in Azure (DNS or App Service):
   - If in **Azure DNS**, create a CNAME record: `sudoku` → the Azure-supplied target (e.g., `gentle-pond-xxx.azurestaticapps.net`)
   - If in **App Service custom domains**, follow the Azure portal's validation steps
4. Click **Validate**. Azure automatically issues a managed TLS certificate.

### Pull request previews

The workflow opens a staging environment for every PR (`build_and_deploy` runs on `pull_request: opened/synchronize/reopened`) and tears it down on `closed` via the `close_pull_request` job. The staging URL is posted as a PR comment.

## Mobile

The layout is responsive and the board uses `aspect-ratio: 1 / 1`, so it scales cleanly down to phones. To ship as a native app, we use [Capacitor](https://capacitorjs.com/). The project is structured with a `www/` directory to make it easy for Capacitor to wrap the web assets into native iOS/Android projects while keeping the native code separate from the web logic.

## Scoring

```
score = max(0, base + time_bonus − mistake_penalty − hint_penalty)
```

| Component         | Value                                                   |
|-------------------|---------------------------------------------------------|
| `base`            | 1000 (beginner) / 2500 (intermediate) / 5000 (expert)   |
| `time_bonus`      | `max(0, 1800 − seconds_elapsed)` (zeroes out at 30 min) |
| `mistake_penalty` | `mistakes × 75`                                         |
| `hint_penalty`    | `hints_used × 100`                                      |

Tweak the constants in `computeScore` in `app.js` if you want a different curve.

## Keyboard shortcuts

| Key                          | Action                                               |
|------------------------------|------------------------------------------------------|
| `1`–`9`                      | Select that number (and apply if a cell is selected) |
| `Backspace` / `Delete` / `0` | Erase selected cell                                  |
| `N`                          | Toggle notes mode                                    |
| Arrow keys                   | Move selection                                       |
| `U`                          | Undo last move                                       |
| `H`                          | Use a hint                                           |
| `S`                          | Submit board (Hard mode)                             |
