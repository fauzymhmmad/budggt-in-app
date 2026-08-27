# 💎 Budggt.in — Modern Personal Finance & Budget Manager

> A sleek, privacy-focused, and accessible personal finance web application with fluid transitions, smart budget guardrails, goal tracking, and built for 100% zero-configuration hosting on **GitHub Pages (`github.io`)**.

![Budggt.in Banner](./public/favicon.svg)

---

## ✨ Features & Highlights

- 📊 **Dynamic Financial Dashboard**:
  - Net balance, monthly income, monthly expenses, and net savings rate with health score indicators.
  - Interactive SVG Cashflow trends chart with timeframe filters (7D, 14D, 30D).
  - Animated SVG Donut category expense breakdown with center hover drilldowns.
  - Proactive smart alerts (budget overrun warnings, upcoming bills due in 7 days).

- 💳 **Complete Transactions Ledger**:
  - Full CRUD operations: Add, Edit, Delete, Duplicate transactions.
  - Multi-faceted filtering by search query, transaction type, category, account, and date range.
  - Batch operations: Multi-select transactions for bulk deletion or spreadsheet CSV export.
  - Transaction tagging and merchant descriptions.

- 🎯 **Category Budgets & Envelope Limits**:
  - Set monthly spending ceilings per category with custom warning thresholds (50%–95%).
  - Real-time animated progress bars with automatic color transitions (🟢 Healthy, 🟡 Warning, 🔴 Exceeded).
  - Projected burn rate calculation estimating month-end overrun.

- 🏆 **Savings Goals & Sinking Funds**:
  - Milestone trackers with target dates, completion percentages, and monthly required deposits.
  - Interactive Deposit & Withdraw modals linked directly to financial accounts.
  - Confetti milestone celebration on reaching 100% target!

- 🔄 **Recurring Subscriptions & Bills Tracker**:
  - Automated tracking for Netflix, Spotify, Rent, Gym, and cloud services.
  - Renewal countdown timers and amortized monthly cost calculation.
  - One-click "Mark Paid" button to log expense and schedule next billing cycle.

- 📈 **Analytics & Projections**:
  - 6-Month Month-over-Month historical comparison tables & bar charts.
  - 5-Year Net Worth and wealth compounding growth projection tool.

- 🧮 **Financial Planning Calculators**:
  - **50/30/20 Rule Optimizer** (Needs, Wants, Savings allocation).
  - **Compound Interest Calculator** (Principal, monthly additions, annual ROI %, and compounding schedule).
  - **Loan & Debt Payoff Estimator** (APR, term duration, monthly repayments, total interest).

- 🎨 **Design System & Privacy**:
  - 🌓 Dark, Light, and OLED Pure Black modes.
  - 🕶️ **Privacy Mode (`Cmd+Shift+P`)**: Instant 1-click blur for all balances when working in public spaces or screensharing.
  - ⚡ **Command Palette (`Cmd+K` / `Ctrl+K`)**: Rapid navigation, quick search, and instant commands.
  - 🔊 **Procedural Web Audio Haptics**: Subtle sound synthesizer chimes on actions (toggleable in settings).
  - 🌐 **30+ Global Currencies**: Instant locale formatting (USD, EUR, GBP, JPY, IDR, CAD, AUD, SGD, INR, etc.).
  - 💾 **Local-First & Data Backup**: Full JSON backup export/import, CSV spreadsheet export/import, and 1-click Demo Data restore.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Navigate to the project directory
cd <your-project-directory>

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Run automated unit test suite
npm test

# 5. Build production bundle
npm run build
```

---

## 🌐 Deploying to GitHub Pages (`github.io`)

Budggt.in is configured with relative base paths (`base: './'`) in `vite.config.ts`, which makes it work flawlessly on any GitHub Pages subpath (e.g. `https://<username>.github.io/<repo-name>/`).

### Option 1: Automated Deployment via GitHub Actions (Recommended)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial Budggt.in release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The included workflow `.github/workflows/deploy.yml` will automatically build, test, and deploy the application upon every push to `main`!

### Option 2: Manual Build & Deploy
```bash
npm run build
# Upload or push the contents of the `dist/` directory to your `gh-pages` branch
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘K` or `Ctrl+K` | Open Command Palette |
| `⌘+Shift+P` or `Ctrl+Shift+P` | Toggle Privacy Mode (Mask Balances) |
| `N` | Open New Transaction Modal |
| `1` – `7` | Switch navigation tabs (Dashboard, Ledger, Budgets, Goals, etc.) |
| `Esc` | Close any active modal or command bar |

---

## 🔒 Privacy & Local-First Architecture

Budggt.in respects your privacy:
- **No Remote Servers or Trackers**: All financial transactions and account balances stay strictly stored in your browser's `localStorage`.
- **Offline Ready**: Operates completely without an active internet connection.
- **Portability**: Export full JSON backups or CSV files anytime to keep your data safe.
