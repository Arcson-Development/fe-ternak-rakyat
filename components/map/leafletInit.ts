/**
 * Leaflet global init shared by every map component in the app.
 *
 * The leaflet-defaulticon-compatibility package patches
 * `L.Icon.Default` so the default marker icon URLs resolve when
 * Leaflet is bundled by webpack/Next.js. Without this import,
 * `<L.Marker>` instances in MapPicker / FarmersMap fall back to
 * `marker-icon-2x.png` / `marker-icon.png` / `marker-shadow.png`
 * resolved against the page origin — which 404s in production
 * because those files are not in `public/`.
 *
 * Import this module once before any map component mounts. The
 * patch is idempotent so multiple imports are safe.
 */

// Side-effect import: patches `L.Icon.Default.prototype._getIconUrl`
// at import time. Must run before the first L.marker() call.
import "leaflet-defaulticon-compatibility";
