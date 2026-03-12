/**
 * Module-level mutable container for the current accessibility text style.
 * Updated synchronously by ThemeProvider on every render.
 * Read synchronously by the patched Text component on every render.
 *
 * Using a plain object (not React state) avoids circular-dependency and
 * lets the patched Text access the latest value without subscribing.
 */
const a11yStyleRef = { current: {} };

export default a11yStyleRef;
