## Scentmap UX Journal

## 2024-05-24 - Accessible Menu Toggles
**Learning:** Adding `aria-label` to icon-only buttons isn't enough when the button toggles a menu or popup. Screen readers won't know it's a menu toggle without `aria-haspopup` and `aria-expanded` attributes. A static `aria-expanded` doesn't work either; it must be updated dynamically when the element is toggled to keep screen readers properly informed.
**Action:** When creating toggleable popup menus or dropdowns, ensure the toggle button has `aria-haspopup="true"` and an `aria-expanded` attribute that is dynamically updated via JavaScript to reflect the actual visibility state of the menu (e.g., when clicking outside or making a selection).
## 2026-03-12 - Native App Feel on Mobile Web
**Learning:** To create a native app feel and prevent zooming on mobile browsers, the viewport meta tag should include `maximum-scale=1.0` and `user-scalable=no`, and the CSS should apply `touch-action: manipulation` to the `html` and `body` elements to disable double-tap-to-zoom.
**Action:** Apply this pattern when tasked with optimizing mobile web applications to function and feel more like native applications, specifically when preventing unwanted pinch and double-tap zoom interactions.
