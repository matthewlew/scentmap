## 2026-03-12 - [Performance Optimization: Pre-computing normalized notes]
**Learning:** Frequent `.toLowerCase()` and `.map()` operations on fragrance notes (top, mid, base) within loops (e.g. similarity scoring, layering scoring, searching) create a noticeable overhead.
**Action:** Normalize notes (to lowercase and cached as separate arrays/sets) once upon data loading to significantly improve the performance of repeated filtering, scoring, and searching logic.

## 2026-03-13 - [Performance Optimization: Memoize Scoring and Profiling]
**Learning:** Functions doing array operations on static catalog data (like similarity/layering scoring and computeProfile) get called frequently (e.g., in loops for suggestions) creating significant overhead.
**Action:** Memoize these functions using simple dictionary lookups or by attaching cached profiles directly to the static data objects (e.g., `frag._profile`) to turn O(N) operations into O(1) lookups.
