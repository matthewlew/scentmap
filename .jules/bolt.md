## 2026-03-12 - [Performance Optimization: Pre-computing normalized notes]
**Learning:** Frequent `.toLowerCase()` and `.map()` operations on fragrance notes (top, mid, base) within loops (e.g. similarity scoring, layering scoring, searching) create a noticeable overhead.
**Action:** Normalize notes (to lowercase and cached as separate arrays/sets) once upon data loading to significantly improve the performance of repeated filtering, scoring, and searching logic.
