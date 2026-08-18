---
description: Builds out a HospoGrad content section (education, careers, or medical) with web-researched content. Usage: /build-section <education|careers|medical|all>
agent: section-content-builder
---

Research and build out the following section(s) of the HospoGrad codebase
using real, verified information from the web: $ARGUMENTS

Follow the Section Content Builder workflow: read the target section first,
research on the web, decide what to build, write researched content into the
lib data files and pages following the existing education-section patterns,
verify with `npm run build:next` and `npm test`, and report what you added,
your sources, and anything unverified.

If $ARGUMENTS is empty or "all", work through every section (education,
careers, medical) one at a time.