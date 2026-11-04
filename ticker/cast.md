---
title: Ticker cast
type: note
stage: seedling
status: working
summary: The firms and residents that speak in the Linden Cove Courier. Placeholders; rename freely.
---

# Ticker cast

The ticker reads the model and never writes to it. A firm's health is `export * X/X0 + local * local/local0 + weather * W + service * G[key]`, and each row's four weights sum to 1, so a firm sits at 1.0 in the default town.

## Firms

| Firm | Sector | Export | Local | Weather | Service | Service key |
|---|---|---|---|---|---|---|
| Tidewater Freight | Export | 0.7 | 0.2 | 0.1 | 0 | none |
| Quay & Co. Chandlery | Export | 0.6 | 0.3 | 0.1 | 0 | none |
| Greenhouse Co-op | Farm | 0.2 | 0.3 | 0.5 | 0 | none |
| Kettle & Crumb Cafe | Local demand | 0 | 0.9 | 0 | 0.1 | transit |
| Linden Dental | Local services | 0 | 0.6 | 0 | 0.4 | health |
| Hollow Print Works | Local demand | 0 | 0.6 | 0 | 0.4 | just |
| Sunroof Solar | Infrastructure | 0.1 | 0.4 | 0.1 | 0.4 | infra |
| Harbour Bakery | Local demand | 0 | 1 | 0 | 0 | none |

## Residents

| Resident | Role | Cares about |
|---|---|---|
| Mina Perera | Renter, shop assistant | Rent as a share of take-home pay |
| Joss Okafor | Landlord, owns four flats | Rent level and tax |
| Dr Ines Moreau | Clinic doctor | Health and care |
| Tomas Reyes | Bus driver | Public transport and roads |
| Aya Tanaka | Teacher | Education |
| Old Bram | Retired fisher, on the council | Budget size and justice |
