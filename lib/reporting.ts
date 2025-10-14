// Shared reporting utilities
// Provides helper functions used across reporting-related components

export function formatIdentifier(name: string): string {
  const singularize = (w: string) => {
    if (w.endsWith("ies") && w.length > 3) return w.slice(0, -3) + "y"; // cities -> city
    if (/(sses|ses|xes|zes)$/.test(w)) return w.slice(0, -2); // classes -> class, boxes -> box
    if (w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1); // volunteers -> volunteer
    return w;
  };
  const hasDot = name.includes(".");
  return name
    .split(/[._-]/)
    .filter(Boolean)
    .map((part, idx) => {
      const base = hasDot && idx === 0 ? singularize(part) : part;
      return base.charAt(0).toUpperCase() + base.slice(1);
    })
    .join(" ");
}
