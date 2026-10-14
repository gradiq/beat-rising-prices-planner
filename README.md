# Beat Rising Prices Budget Planner — public demo (Grad-IQ)

Live demo: https://saletra40-a11y.github.io/beat-rising-prices-planner/

This is the **demo-only** edition. It runs on sample data, saves nothing, and has no export/import. The full planner (saves in your browser, JSON backup/restore, CSV export, print) is sold separately as a download.

Sections: monthly cash-flow map (income + bill due dates, running balance) · bill triage priority list (housing, utilities, transport to work, insurance, food first; call the creditor before you miss a payment) · weekly gas budget and trip-combining log · grocery tracker (store vs. name brand, compare stores) · savings wins tracker.

Static HTML/CSS/vanilla JS. Self-hosted fonts. No tracking, no outside requests. Shop link and price live in `config.js` (`BUY_URL`, `PRICE`).

For planning only. Not medical, legal, tax, or financial advice.

## Sources (checked Oct 14, 2026)
- U.S. Bureau of Labor Statistics, Consumer Price Index — September 2026 (released Oct 14, 2026): https://www.bls.gov/news.release/cpi.nr0.htm — all items +3.7% over 12 months (not seasonally adjusted); gasoline index +9.1% in September (seasonally adjusted).
- U.S. Energy Information Administration, Gasoline and Diesel Fuel Update (released Oct 14, 2026): https://www.eia.gov/petroleum/gasdiesel/ — U.S. regular $4.331/gal on Oct 12, 2026, +$1.270 vs. a year ago. (The brief's "$1.26" did not match the latest EIA figure, so the planner uses $1.27 with the date.)
- CFPB, Debt collection: https://www.consumerfinance.gov/consumer-tools/debt-collection/
- FuelEconomy.gov, Driving more efficiently: https://www.fueleconomy.gov/feg/driveHabits.jsp

© IQ Learning / Grad-IQ. Demo code is shown for preview; the planner design and copy are not licensed for reuse.
