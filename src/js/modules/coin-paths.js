/* Site build only (build.py --target site): coins are loaded from assets/coins/ instead of embedded. Relative paths, so it works under /repo-name/ on GitHub Pages. */
const COIN_IMG = {
  penny: { c: 'assets/coins/penny.jpg', g: 'assets/coins/penny-grey.jpg' },
  nickel: { c: 'assets/coins/nickel.jpg', g: 'assets/coins/nickel-grey.jpg' },
  dime: { c: 'assets/coins/dime.jpg', g: 'assets/coins/dime-grey.jpg' },
  quarter: { c: 'assets/coins/quarter.jpg', g: 'assets/coins/quarter-grey.jpg' }
};
