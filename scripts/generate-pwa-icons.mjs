// Generate holding-state PWA icons for Alchemille.
//
// Renders four PNG sizes from a single master SVG into /public:
//   - apple-icon.png        (180×180, iOS Add-to-Home-Screen)
//   - icon-192.png          (Android home + Lighthouse minimum)
//   - icon-512.png          (Android splash)
//   - icon-maskable-512.png (Android adaptive icon; safe-zone padded)
//
// Usage: node scripts/generate-pwa-icons.mjs
// Re-run after editing the master SVG below to refresh outputs.

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "public");

// Master SVG — Alchemille palette.
// Forest leaf on cream, terracotta inner stem. Holding state.
// A real wordmark/symbol pass happens later.
function masterSvg({ maskable } = { maskable: false }) {
  // Maskable icons need their content inside an 80% safe zone (per W3C
  // Web App Manifest spec) so Android can clip them into circles/squircles.
  const inset = maskable ? 64 : 0;
  const vb = 512;
  const cx = vb / 2;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}" fill="none">
  <rect width="${vb}" height="${vb}" fill="#F4EFE3"/>
  <g transform="translate(${inset}, ${inset}) scale(${(vb - inset * 2) / vb})">
    <!-- Forest leaf body -->
    <path d="
      M ${cx} 80
      C ${cx - 110} 200, ${cx - 150} 330, ${cx - 90} 400
      C ${cx - 40} 450, ${cx + 40} 450, ${cx + 90} 400
      C ${cx + 150} 330, ${cx + 110} 200, ${cx} 80
      Z"
      fill="#2E4332"/>
    <!-- Terracotta inner stem / heartline -->
    <path d="
      M ${cx} 150
      C ${cx - 36} 240, ${cx - 50} 320, ${cx - 22} 380
      C ${cx - 8} 400, ${cx + 8} 400, ${cx + 22} 380
      C ${cx + 50} 320, ${cx + 36} 240, ${cx} 150
      Z"
      fill="#C06B47"/>
    <!-- Subtle highlight along the spine -->
    <path d="M ${cx} 110 L ${cx} 420"
      stroke="#F4EFE3" stroke-width="3" stroke-linecap="round" opacity="0.35"/>
  </g>
</svg>`.trim();
}

async function render(svg, size) {
  return sharp(Buffer.from(svg))
    .resize(size, size, {
      fit: "contain",
      background: { r: 244, g: 239, b: 227, alpha: 1 }, // cream
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  await mkdir(out, { recursive: true });

  const base = masterSvg({ maskable: false });
  const maskable = masterSvg({ maskable: true });

  const jobs = [
    { name: "apple-icon.png", size: 180, svg: base },
    { name: "icon-192.png", size: 192, svg: base },
    { name: "icon-512.png", size: 512, svg: base },
    { name: "icon-maskable-512.png", size: 512, svg: maskable },
  ];

  for (const job of jobs) {
    const png = await render(job.svg, job.size);
    const path = resolve(out, job.name);
    await writeFile(path, png);
    // eslint-disable-next-line no-console
    console.log(`wrote ${job.name} (${job.size}px)`);
  }

  // Also refresh the small favicon SVG so it matches the master art.
  await writeFile(resolve(out, "icon.svg"), masterSvg({ maskable: false }));
  // eslint-disable-next-line no-console
  console.log("wrote icon.svg");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
