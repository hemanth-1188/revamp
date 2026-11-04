import { ColorExtraction } from '../types';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface NamedEthnicColor {
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

export const ETHNIC_COLOR_PALETTE: NamedEthnicColor[] = [
  { name: 'Terracotta', hex: '#B5563E', r: 181, g: 86, b: 62 },
  { name: 'Blush Pink', hex: '#F2C3B9', r: 242, g: 195, b: 185 },
  { name: 'Dusty Rose', hex: '#D8A499', r: 216, g: 164, b: 153 },
  { name: 'Cream / Ivory', hex: '#FAF2EE', r: 250, g: 242, b: 238 },
  { name: 'Indigo Blue', hex: '#264653', r: 38, g: 70, b: 83 },
  { name: 'Navy Blue', hex: '#1D3557', r: 29, g: 53, b: 87 },
  { name: 'Mustard Yellow', hex: '#E9C46A', r: 233, g: 196, b: 106 },
  { name: 'Olive Green', hex: '#606C38', r: 96, g: 108, b: 56 },
  { name: 'Deep Maroon', hex: '#6B1724', r: 107, g: 23, b: 36 },
  { name: 'Brick Rust', hex: '#9C4530', r: 156, g: 69, b: 48 },
  { name: 'Antique Gold', hex: '#D4AF37', r: 212, g: 175, b: 55 },
  { name: 'Off White', hex: '#FDFAF9', r: 253, g: 250, b: 249 },
  { name: 'Jet Black', hex: '#1C1917', r: 28, g: 25, b: 23 },
  { name: 'Charcoal Grey', hex: '#4A433E', r: 74, g: 67, b: 62 },
  { name: 'Sage Green', hex: '#8A9A5B', r: 138, g: 154, b: 91 },
  { name: 'Coral Orange', hex: '#E76F51', r: 231, g: 111, b: 81 },
  { name: 'Cerulean Blue', hex: '#0077B6', r: 0, g: 119, b: 182 },
  { name: 'Royal Purple', hex: '#582C4D', r: 88, g: 44, b: 77 },
  { name: 'Lavender', hex: '#CDB4DB', r: 205, g: 180, b: 219 },
  { name: 'Emerald Green', hex: '#2D6A4F', r: 45, g: 106, b: 79 },
  { name: 'Turmeric Yellow', hex: '#F4A261', r: 244, g: 162, b: 97 },
];

/**
 * Euclidean RGB distance
 */
export function colorDistance(c1: RgbColor, c2: RgbColor): number {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}

/**
 * Convert RGB values to 6-digit hex code
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Map RGB triplet to closest natural Indian ethnic color description
 */
export function matchClosestEthnicColor(r: number, g: number, b: number): { name: string; hex: string } {
  let minDistance = Infinity;
  let closest = ETHNIC_COLOR_PALETTE[0];
  const target: RgbColor = { r, g, b };

  for (const item of ETHNIC_COLOR_PALETTE) {
    const dist = colorDistance(target, { r: item.r, g: item.g, b: item.b });
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  return { name: closest.name, hex: closest.hex };
}

/**
 * Perform deterministic K-Means color clustering on an uploaded image via HTML5 Canvas
 */
export async function extractDominantColors(imageSrc: string, k: number = 4): Promise<ColorExtraction[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(getFallbackPalette());
        }

        // Downsample to 120px for rapid, stable clustering
        const width = 120;
        const height = Math.floor((img.height / img.width) * width) || 120;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sample pixels, discarding transparent and near-pure white background
        const pixels: RgbColor[] = [];
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Filter out transparent and blown-out studio white backgrounds
          const isWhiteBackground = r > 248 && g > 248 && b > 248;
          if (a > 180 && !isWhiteBackground) {
            pixels.push({ r, g, b });
          }
        }

        if (pixels.length === 0) {
          return resolve(getFallbackPalette());
        }

        // Initialize K centroids evenly spaced across the pixel set
        const centroids: RgbColor[] = [];
        const step = Math.floor(pixels.length / k);
        for (let i = 0; i < k; i++) {
          centroids.push({ ...pixels[i * step] });
        }

        // Run 8 K-Means iterations
        const maxIterations = 8;
        let clusterCounts = new Array(k).fill(0);

        for (let iter = 0; iter < maxIterations; iter++) {
          const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0 }));
          clusterCounts = new Array(k).fill(0);

          for (const pixel of pixels) {
            let bestIdx = 0;
            let minDist = Infinity;
            for (let c = 0; c < k; c++) {
              const d = colorDistance(pixel, centroids[c]);
              if (d < minDist) {
                minDist = d;
                bestIdx = c;
              }
            }
            sums[bestIdx].r += pixel.r;
            sums[bestIdx].g += pixel.g;
            sums[bestIdx].b += pixel.b;
            clusterCounts[bestIdx]++;
          }

          // Update centroids to mean of assigned pixels
          for (let c = 0; c < k; c++) {
            if (clusterCounts[c] > 0) {
              centroids[c] = {
                r: Math.round(sums[c].r / clusterCounts[c]),
                g: Math.round(sums[c].g / clusterCounts[c]),
                b: Math.round(sums[c].b / clusterCounts[c]),
              };
            }
          }
        }

        const totalPoints = pixels.length;
        const results: ColorExtraction[] = [];
        const seenNames = new Set<string>();

        // Sort centroids by cluster count descending
        const sortedCentroids = centroids
          .map((c, i) => ({ centroid: c, count: clusterCounts[i] }))
          .sort((a, b) => b.count - a.count);

        for (const item of sortedCentroids) {
          const { r, g, b } = item.centroid;
          const actualHex = rgbToHex(r, g, b);
          const matched = matchClosestEthnicColor(r, g, b);
          const percentage = Math.max(10, Math.round((item.count / totalPoints) * 100));

          // Use the actual extracted hex with ethnic name classification
          const displayName = matched.name;
          if (!seenNames.has(displayName)) {
            seenNames.add(displayName);
            results.push({
              name: displayName,
              hex: actualHex,
              percentage,
            });
          }
          if (results.length >= 4) break;
        }

        if (results.length === 0) {
          return resolve(getFallbackPalette());
        }

        // Normalize sum of percentages to 100
        const totalPct = results.reduce((acc, c) => acc + c.percentage, 0);
        if (totalPct > 0) {
          results.forEach((c) => {
            c.percentage = Math.round((c.percentage / totalPct) * 100);
          });
        }

        resolve(results);
      } catch (err) {
        console.warn('Direct canvas pixel extraction error, using fallback palette:', err);
        resolve(getFallbackPalette());
      }
    };

    img.onerror = () => {
      resolve(getFallbackPalette());
    };

    img.src = imageSrc;
  });
}

function getFallbackPalette(): ColorExtraction[] {
  return [
    { name: 'Terracotta', hex: '#B5563E', percentage: 50 },
    { name: 'Cream / Ivory', hex: '#FAF2EE', percentage: 30 },
    { name: 'Olive Green', hex: '#606C38', percentage: 20 },
  ];
}
