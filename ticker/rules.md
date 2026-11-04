---
title: Ticker rules
type: note
stage: seedling
status: working
summary: Channel, cooldown and priority for each ticker rule. The trigger conditions live in ticker.js; this table sets how loud and how often.
---

# Ticker rules

Cooldown is in months (ticks). Priority runs 1 to 10; at most two items queue per tick, highest first. Priority 8 and above is announced to screen readers.

| id | channel | cooldown | priority | trigger |
|---|---|---|---|---|
| ev_drought | news | 0 | 10 | the event fired this tick |
| ev_storm | news | 0 | 10 | the event fired this tick |
| ev_bumper | news | 0 | 10 | the event fired this tick |
| ev_cargo | news | 0 | 10 | the event fired this tick |
| u_high | news | 12 | 8 | unemployment above 12% and up 2 points in 6 months |
| u_low | biz | 18 | 5 | unemployment below 3% |
| rent_squeeze | voice | 12 | 7 | rent above 45% of take-home pay |
| rent_easy | voice | 18 | 4 | rent below 30% of take-home pay |
| landlord_happy | voice | 18 | 5 | owner to worker income ratio above 1.4 |
| landlord_sour | voice | 18 | 5 | ratio below 0.7 |
| tax_bite | voice | 12 | 6 | income tax above 30% |
| tax_low_services | news | 12 | 6 | tax below 12% and service level below 0.8 |
| svc_low_infra | voice | 12 | 7 | infrastructure stock below 0.7 |
| svc_low_edu | voice | 12 | 7 | education stock below 0.7 |
| svc_low_just | voice | 12 | 7 | justice stock below 0.7 |
| svc_low_transit | voice | 12 | 7 | public transport stock below 0.7 |
| svc_low_health | voice | 12 | 7 | health stock below 0.7 |
| svc_high_infra | voice | 18 | 4 | infrastructure stock above 1.3 |
| svc_high_edu | voice | 18 | 4 | education stock above 1.3 |
| svc_high_just | voice | 18 | 4 | justice stock above 1.3 |
| svc_high_transit | voice | 18 | 4 | public transport stock above 1.3 |
| svc_high_health | voice | 18 | 4 | health stock above 1.3 |
| budget_swing_up | news | 12 | 6 | budget up more than 15% in 6 months |
| budget_swing_down | news | 12 | 6 | budget down more than 15% in 6 months |
| pop_growth | news | 18 | 5 | people up more than 3% in 12 months |
| pop_loss | news | 18 | 6 | people down more than 3% in 12 months |
| crowding | news | 12 | 7 | more households than homes |
| empty_flats | news | 18 | 5 | more than 25% of homes empty |
| firm_cut | biz | 12 | 6 | a firm's health below 0.85 |
| firm_close | biz | 12 | 6 | a firm's health below 0.75 for 6 months |
| firm_reopen | biz | 12 | 6 | a closed firm's health above 0.95 for 6 months |
| firm_boom | biz | 18 | 6 | a firm's health above 1.10 for 3 months |
| mood_high | news | 24 | 6 | mood above 65 |
| mood_low | news | 24 | 6 | mood below 30 |
| filler | news | 6 | 1 | nothing else for 4 months |
