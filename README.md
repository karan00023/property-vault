# PropertyVault

PropertyVault is a React rental-inventory dashboard for NYC and Downtown Jersey City high-rise buildings. It combines public building inventory, known leasing links, rent-band estimates, map search, CSV export, and visible data-quality flags.

Live site: https://karan00023.github.io/property-vault/

## What it does

- Loads public high-rise residential inventory from NYC Open Data MapPLUTO.
- Loads Downtown Jersey City high-rise candidates from OpenStreetMap/Overpass.
- Shows grid, table, and map views in one searchable dashboard.
- Flags missing live unit availability, exact asking rents, unit counts, and parcel cross-checks.
- Exports the current filtered result set to CSV.
- Lets users queue missing leasing/source links for follow-up.

## Data notes

Public building inventory is a coverage backbone, not a guaranteed live rental feed. Exact unit availability and asking rents require direct leasing feeds, owner data, or compliant backend scraping. PropertyVault flags those gaps visibly instead of pretending the data is complete.

## Deployment

The published site is self-contained in `index.html` so GitHub Pages can serve it directly from the existing repo link.
