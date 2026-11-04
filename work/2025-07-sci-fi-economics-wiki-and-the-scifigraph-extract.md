---
title: "Sci-fi economics wiki and the scifigraph extractor"
type: work
stage: sapling
status: working
period: "2024 to 2025"
start: 2025-07
kind: data
who: "Alberto Cottica"
motif: graph
featured: true
source_url: "https://edgeryders.eu/t/what-if-we-turned-the-sci-fi-economics-wiki-into-data/19688"
source_label: "Edgeryders, What if we turned the sci-fi economics wiki into data?"
tags: [showcase]
summary: "A community wiki of economically minded science fiction, turned by an LLM extractor into a network of 25 works and 135 economic concepts."
why_it_matters: "Proof that the wiki can become a linked graph of concepts and books. For writers it is a map of which ideas appear where, and which books share them."
confirm:
  - "The extraction run and its counts come from the later replies in the thread, which opens with the February 2024 plan. Confirm the public home of the scifigraph repository before presenting it as a finished tool."
---
## What it is

The Science Fiction Economics wiki, "Economic Science Fiction: a selection of works and authors", is a community-maintained list on Edgeryders that covers authors such as Butler, Le Guin, Doctorow and Robinson. By February 2024 it ran to about 5,000 words and was hard to navigate, so Alberto Cottica proposed treating it as data. The scifigraph extractor is that idea carried out.

## What we did

The original plan, posted in February 2024, was to code each work with Open Ethnographer, the Lab's tool for reading community conversations as networks, and link concepts by how often they appear in the same works. In 2025 Yudhanjaya Wijeratne wrote a Python script that sends each book's review to a language model, which extracts the economic concepts it finds and writes them to a JSON file. The run covered 25 works, mostly novels, and produced 140 concepts, merged to 135. The result is a two-mode network, books on one side and concepts on the other, visualised in Tulip.

## How it turned out

Most of the books share features in one large connected structure, and three form separate islands. Community detection could reveal families of concepts that scholars might not see. The extraction was inconsistent: social credit scoring was found in two books and missed in a third, which Wijeratne put down to the review text and the model's coverage, and a test on the full text of the novel recovered the expected concepts. Cottica expects the islands to merge as the dataset grows. Code and the input and output files are on GitHub under yudhanjaya/scifigraph, and the thread links the related method paper on simplifying networks of ethnographic codes.

## Sources

- [What if we turned the sci-fi economics wiki into data?](https://edgeryders.eu/t/what-if-we-turned-the-sci-fi-economics-wiki-into-data/19688)
- [The wiki, a more machine-readable version](https://edgeryders.eu/t/the-science-fiction-economics-wiki-a-more-machine-readable-version/19727)
- [Economic science fiction: a selection of works and authors (the wiki)](https://edgeryders.eu/t/economic-science-fiction-a-selection-of-works-and-authors/8582)
- [Scifigraph code and data](https://github.com/yudhanjaya/scifigraph)
- [Method paper on simplifying networks of ethnographic codes](https://doi.org/10.1007/s41109-023-00547-6)
