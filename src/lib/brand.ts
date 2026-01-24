// Brand assets are in public/ folder, paths set via env variables
// Usage: Create .env.loomi and .env.daydreamer files, then:
//   npm run build -- --mode loomi
//   npm run build -- --mode daydreamer

export const brand = {
  name: import.meta.env.VITE_BRAND_NAME || "Loomi",
  logo: import.meta.env.VITE_LOGO || "/loomi-logo.png",
  favicon: import.meta.env.VITE_FAVICON || "/loomi-favicon.ico",
  domain: import.meta.env.VITE_BASE_DOMAIN || "loomi.asia",
};

export function initBrand(): void {
  // Update favicon
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) {
    favicon.href = brand.favicon;
  }

  // Update page title
  document.title = `${brand.name} - HRMS`;
}
