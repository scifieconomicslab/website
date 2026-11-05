---
title: "How the Linden Cove model works"
type: model
stage: sapling
status: working
calibrated: false
summary: "A small town economy with twelve causal links: rent, tax and a shared budget on one side, weather and markets on the other."
repo: ""
---

Linden Cove is a toy model with no deep economic meaning. Its only purpose is to show that simulation models can be simple to build and interpret. It contains twelve causal links.

1. Higher rent moves money from workers to owners, who spend less of it in town, so shops sell less.
2. Higher rent also lowers what workers keep, so fewer people move in and some leave.
3. Rent above 30 draws builders in. Rent below 30 slowly starves the housing stock, so cheap rent first fills the town and then crowds it.
4. Higher income tax lowers take-home pay at once and funds services slowly.
5. Education works slowest, with a half-life of about 69 months, and lifts wages the most.
6. Infrastructure keeps output per worker up, and it is what storms damage.
7. Health and care keeps output per worker up at a smaller effect.
8. Justice cuts business overhead and makes the town safer to run a shop in.
9. Public transport lets the unemployed find jobs faster and helps exports.
10. Rain, sun and storms change how much the town can produce and sell.
11. A ship that leaves takes a slice of export demand with it for about a year.
12. More people dilute the budget per household, so growth is not free.

The mood number combines three things: what people keep after tax and rent (weight 0.4), how many have work (0.3) and how good the public services are (0.3), minus a penalty when there are more households than homes. The weights are our judgement, and nobody measured them.

The model keeps what the stories need and nothing more, in the spirit of [[The Simulation Dream]]. Its reference code and tests live in the repository under model/.
