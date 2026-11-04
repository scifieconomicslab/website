---
title: "How we work with a place"
type: method
stage: sapling
status: working
summary: "Our process is called generative ethnography. A place works through nine steps, and we keep the test and the story ahead of the decision."
---

An economy is a set of rules a society chose. We help a place see its options, test them and tell the story of living in them before it commits.

We call the way we work **generative ethnography**. It brings together complexity economic theory, speculative futures thinking and inclusive community-building. The theory gives us models that behave like a real economy. Futures thinking lets a place imagine rules it does not have yet. Community-building makes sure the people who will live under those rules help write them. See [[generative-ethnography]].

The steps: [[problem]], [[options]], [[model]], then either [[failure]] and back to the options, or [[holds]] (the model shows different paths), [[table]] (the people with a stake argue over them), [[story]] (each path told as fiction), [[commit]] and [[living]].

We checked the core of the process formally in TLA+, before the table and the per-path stories were added as separate steps. Two rules hold along the main path, [[test-before-commit]] and [[story-before-commit]], and a shortcut that skips the test and the story breaks both in two steps.
