import { DesignSpecification } from '../types';

export interface VisualOutput {
  imageUrl: string;
  frontImage: string;
  backImage: string;
  sideImage?: string;
}

const visualCache = new Map<string, VisualOutput>();

/**
 * Generates photorealistic boutique garment visual representations for both Women's
 * and Men's collections (Kurtis, Anarkali, Blouse, Gown, Shirts, T-Shirts, Kurtas, Jackets, Trousers).
 */
export function generateKurtiDesignVisual(
  spec: DesignSpecification,
  uploadedFabricImgUrl?: string | null
): VisualOutput {
  const cacheKey = `${spec.garmentType}_${spec.silhouette}_${spec.primaryColorHex}_${spec.pattern}_${spec.neckline}_${spec.sleeveStyle}_${uploadedFabricImgUrl ? 'img' : 'noimg'}`;
  if (visualCache.has(cacheKey)) {
    return visualCache.get(cacheKey)!;
  }

  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 600;
  frontCanvas.height = 760;

  const backCanvas = document.createElement('canvas');
  backCanvas.width = 600;
  backCanvas.height = 760;

  const sideCanvas = document.createElement('canvas');
  sideCanvas.width = 600;
  sideCanvas.height = 760;

  renderGarmentOnCanvasWithImage(frontCanvas, spec, null, 'front');
  renderGarmentOnCanvasWithImage(backCanvas, spec, null, 'back');
  renderGarmentOnCanvasWithImage(sideCanvas, spec, null, 'side');

  const frontUrl = frontCanvas.toDataURL('image/jpeg', 0.92);
  const backUrl = backCanvas.toDataURL('image/jpeg', 0.92);
  const sideUrl = sideCanvas.toDataURL('image/jpeg', 0.92);

  const output: VisualOutput = {
    imageUrl: frontUrl,
    frontImage: frontUrl,
    backImage: backUrl,
    sideImage: sideUrl,
  };

  visualCache.set(cacheKey, output);
  return output;
}

/**
 * Asynchronously renders with uploaded fabric image if image element needs to be loaded
 */
export async function generateKurtiDesignVisualAsync(
  spec: DesignSpecification,
  uploadedFabricImgUrl?: string | null
): Promise<VisualOutput> {
  const cacheKey = `${spec.garmentType}_${spec.silhouette}_${spec.primaryColorHex}_${spec.pattern}_${spec.neckline}_${spec.sleeveStyle}_${uploadedFabricImgUrl ? 'img_async' : 'noimg'}`;
  if (visualCache.has(cacheKey)) {
    return visualCache.get(cacheKey)!;
  }

  let fabricImageEl: HTMLImageElement | null = null;
  if (uploadedFabricImgUrl && (uploadedFabricImgUrl.startsWith('data:') || uploadedFabricImgUrl.startsWith('http') || uploadedFabricImgUrl.startsWith('blob:'))) {
    try {
      fabricImageEl = await loadImage(uploadedFabricImgUrl);
    } catch {
      fabricImageEl = null;
    }
  }

  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 600;
  frontCanvas.height = 760;

  const backCanvas = document.createElement('canvas');
  backCanvas.width = 600;
  backCanvas.height = 760;

  const sideCanvas = document.createElement('canvas');
  sideCanvas.width = 600;
  sideCanvas.height = 760;

  renderGarmentOnCanvasWithImage(frontCanvas, spec, fabricImageEl, 'front');
  renderGarmentOnCanvasWithImage(backCanvas, spec, fabricImageEl, 'back');
  renderGarmentOnCanvasWithImage(sideCanvas, spec, fabricImageEl, 'side');

  const frontUrl = frontCanvas.toDataURL('image/jpeg', 0.92);
  const backUrl = backCanvas.toDataURL('image/jpeg', 0.92);
  const sideUrl = sideCanvas.toDataURL('image/jpeg', 0.92);

  const output: VisualOutput = {
    imageUrl: frontUrl,
    frontImage: frontUrl,
    backImage: backUrl,
    sideImage: sideUrl,
  };

  visualCache.set(cacheKey, output);
  return output;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export function renderGarmentOnCanvasWithImage(
  canvas: HTMLCanvasElement,
  spec: DesignSpecification,
  fabricImg: HTMLImageElement | null,
  view: 'front' | 'back' | 'side'
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // 1. Luxury Boutique Studio Lighting Background
  const bgGrad = ctx.createRadialGradient(W / 2, H * 0.45, 80, W / 2, H / 2, W * 0.75);
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(0.5, '#FAF6F4');
  bgGrad.addColorStop(1, '#EDE4DF');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Soft pedestal floor shadow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(W / 2, H * 0.93, W * 0.35, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(74, 55, 45, 0.12)';
  ctx.filter = 'blur(12px)';
  ctx.fill();
  ctx.restore();

  // Highlight spotlight
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.38, W * 0.42, H * 0.38, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.fill();
  ctx.restore();

  // Pattern canvas preparation
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 240;
  patternCanvas.height = 240;
  const pctx = patternCanvas.getContext('2d');
  if (pctx) {
    if (fabricImg && fabricImg.complete && fabricImg.naturalWidth > 0) {
      pctx.drawImage(fabricImg, 0, 0, 240, 240);
      pctx.fillStyle = spec.primaryColorHex;
      pctx.globalAlpha = 0.12;
      pctx.fillRect(0, 0, 240, 240);
      pctx.globalAlpha = 1.0;
    } else {
      drawProceduralFabricTexture(pctx, spec);
    }
  }

  const garmentPattern = ctx.createPattern(patternCanvas, 'repeat');
  const baseColor = spec.primaryColorHex || '#264653';

  // Normalize Garment Identification
  const gType = (spec.garmentType || '').toLowerCase();
  const isShirt = gType.includes('shirt') && !gType.includes('tshirt') && !gType.includes('t-shirt');
  const isTshirt = gType.includes('tshirt') || gType.includes('t-shirt');
  const isMenKurta = gType.includes('kurta') && (gType.includes('men') || spec.silhouette.toLowerCase().includes('men'));
  const isJacket = gType.includes('jacket') || gType.includes('nehru') || gType.includes('vest') || gType.includes('bandhgala');
  const isTrousers = gType.includes('trouser') || gType.includes('pant') || gType.includes('chino');
  const isBlouse = gType.includes('blouse') || gType.includes('crop');
  const isAnarkali = gType.includes('anarkali') || spec.silhouette.toLowerCase().includes('anarkali');
  const isGown = gType.includes('gown') || gType.includes('dress');
  const isShort = gType.includes('short') || spec.length.toLowerCase().includes('short') || spec.length.toLowerCase().includes('hip');
  const isAline = spec.silhouette.toLowerCase().includes('a-line');

  if (isTrousers) {
    renderTrousers(ctx, W, H, spec, garmentPattern || baseColor, view);
  } else if (isShirt) {
    renderMenShirt(ctx, W, H, spec, garmentPattern || baseColor, view);
  } else if (isTshirt) {
    renderMenTshirt(ctx, W, H, spec, garmentPattern || baseColor, view);
  } else if (isJacket) {
    renderNehruJacket(ctx, W, H, spec, garmentPattern || baseColor, view);
  } else if (isMenKurta) {
    renderMenKurta(ctx, W, H, spec, garmentPattern || baseColor, view);
  } else if (isBlouse) {
    renderBlouse(ctx, W, H, spec, garmentPattern || baseColor, view);
  } else if (isGown) {
    renderGown(ctx, W, H, spec, garmentPattern || baseColor, view);
  } else {
    // Kurti / Anarkali / Short Kurti
    renderKurtiGarment(ctx, W, H, spec, garmentPattern || baseColor, view, { isShort, isAline, isAnarkali });
  }

  // Garment Badge Label at top-left
  ctx.save();
  ctx.fillStyle = 'rgba(38, 32, 28, 0.88)';
  ctx.beginPath();
  const labelWidth = 140;
  ctx.roundRect(24, 24, labelWidth, 30, 8);
  ctx.fill();

  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#FAF2EE';
  const cleanTitle = (spec.garmentType || 'GARMENT').toUpperCase();
  ctx.fillText(cleanTitle.slice(0, 14), 36, 43);

  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillText(view.toUpperCase(), 125, 43);
  ctx.restore();
}

/**
 * 1. KURTI / ANARKALI / SHORT KURTI RENDERER
 */
function renderKurtiGarment(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  spec: DesignSpecification,
  fillPattern: CanvasPattern | string,
  view: 'front' | 'back' | 'side',
  opts: { isShort: boolean; isAline: boolean; isAnarkali: boolean }
) {
  const neckCenterX = W / 2;
  const neckY = 100;
  const shoulderY = 160;
  const bustY = 240;
  const waistY = 320;
  const hipY = 410;
  const hemY = opts.isShort ? 490 : opts.isAnarkali ? 710 : 680;

  const waistHalfWidth = 72;
  let hemHalfWidth = 85;
  if (opts.isAnarkali) hemHalfWidth = 220;
  else if (opts.isAline) hemHalfWidth = 140;

  if (view === 'side') {
    renderGarmentSideProfile(ctx, W, H, spec, fillPattern, { waistY, hemY, isFlared: opts.isAnarkali || opts.isAline });
    return;
  }

  // Sleeves
  const sleeveType = (spec.sleeveStyle || '').toLowerCase();
  const isSleeveless = sleeveType.includes('sleeveless');
  const isShortCap = sleeveType.includes('cap') || sleeveType.includes('short');
  const sleeveEndY = isSleeveless ? shoulderY + 30 : isShortCap ? shoulderY + 70 : shoulderY + 185;
  const sleeveWidth = isSleeveless ? 18 : 34;

  ctx.save();
  // Left Sleeve
  ctx.beginPath();
  ctx.moveTo(neckCenterX - 110, shoulderY - 8);
  ctx.lineTo(neckCenterX - 145, shoulderY + 30);
  ctx.lineTo(neckCenterX - 130 - sleeveWidth, sleeveEndY);
  ctx.lineTo(neckCenterX - 130, sleeveEndY + 8);
  ctx.lineTo(neckCenterX - 85, bustY - 10);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(neckCenterX - 130 - sleeveWidth, sleeveEndY);
  ctx.lineTo(neckCenterX - 130, sleeveEndY + 8);
  ctx.stroke();

  // Right Sleeve
  ctx.beginPath();
  ctx.moveTo(neckCenterX + 110, shoulderY - 8);
  ctx.lineTo(neckCenterX + 145, shoulderY + 30);
  ctx.lineTo(neckCenterX + 130 + sleeveWidth, sleeveEndY);
  ctx.lineTo(neckCenterX + 130, sleeveEndY + 8);
  ctx.lineTo(neckCenterX + 85, bustY - 10);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(neckCenterX + 130 + sleeveWidth, sleeveEndY);
  ctx.lineTo(neckCenterX + 130, sleeveEndY + 8);
  ctx.stroke();
  ctx.restore();

  // Main Bodice & Skirt
  ctx.save();
  ctx.beginPath();
  const neckRadiusX = 32;
  const neckDepth = view === 'back' ? 18 : 36;

  ctx.moveTo(neckCenterX - neckRadiusX, neckY + 28);
  ctx.quadraticCurveTo(neckCenterX, neckY + 28 + neckDepth, neckCenterX + neckRadiusX, neckY + 28);
  ctx.lineTo(neckCenterX + 110, shoulderY - 8);
  ctx.quadraticCurveTo(neckCenterX + 82, bustY - 30, neckCenterX + 86, bustY);
  ctx.quadraticCurveTo(neckCenterX + 80, (bustY + waistY) / 2, neckCenterX + waistHalfWidth, waistY);

  if (opts.isAnarkali) {
    ctx.bezierCurveTo(neckCenterX + 110, hipY, neckCenterX + 180, (hipY + hemY) / 2, neckCenterX + hemHalfWidth, hemY);
  } else if (opts.isAline) {
    ctx.lineTo(neckCenterX + 96, hipY);
    ctx.lineTo(neckCenterX + hemHalfWidth, hemY);
  } else {
    ctx.lineTo(neckCenterX + 84, hipY);
    ctx.lineTo(neckCenterX + hemHalfWidth, hemY);
  }

  // Hemline curve
  ctx.quadraticCurveTo(neckCenterX, hemY + (opts.isAnarkali ? 24 : 10), neckCenterX - hemHalfWidth, hemY);

  if (opts.isAnarkali) {
    ctx.bezierCurveTo(neckCenterX - 180, (hipY + hemY) / 2, neckCenterX - 110, hipY, neckCenterX - waistHalfWidth, waistY);
  } else if (opts.isAline) {
    ctx.lineTo(neckCenterX - 96, hipY);
    ctx.lineTo(neckCenterX - waistHalfWidth, waistY);
  } else {
    ctx.lineTo(neckCenterX - 84, hipY);
    ctx.lineTo(neckCenterX - waistHalfWidth, waistY);
  }

  ctx.quadraticCurveTo(neckCenterX - 80, (bustY + waistY) / 2, neckCenterX - 86, bustY);
  ctx.quadraticCurveTo(neckCenterX - 82, bustY - 30, neckCenterX - 110, shoulderY - 8);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  // Realistic drape shading
  apply3DShading(ctx, neckCenterX, hemHalfWidth, hemY);

  // Anarkali Kalis / Flared Pleat lines
  if (opts.isAnarkali) {
    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
    ctx.lineWidth = 1.2;
    for (let k = -3; k <= 3; k++) {
      if (k === 0) continue;
      ctx.beginPath();
      ctx.moveTo(neckCenterX + k * 18, waistY);
      ctx.quadraticCurveTo(neckCenterX + k * 35, (waistY + hemY) / 2, neckCenterX + k * 55, hemY);
      ctx.stroke();
    }
  }

  // Front vs Back specific details
  if (view === 'front') {
    // Neckline Gota / Piping
    ctx.beginPath();
    ctx.moveTo(neckCenterX - neckRadiusX, neckY + 28);
    ctx.quadraticCurveTo(neckCenterX, neckY + 28 + neckDepth, neckCenterX + neckRadiusX, neckY + 28);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center placket & gold buttons
    ctx.beginPath();
    ctx.moveTo(neckCenterX, neckY + 28 + neckDepth - 2);
    ctx.lineTo(neckCenterX, neckY + 28 + neckDepth + 150);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    for (let b = 0; b < 5; b++) {
      ctx.beginPath();
      ctx.arc(neckCenterX, neckY + 28 + neckDepth + 20 + b * 26, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#F3E5AB';
      ctx.fill();
      ctx.strokeStyle = '#9C7A22';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Hem Border
    ctx.beginPath();
    ctx.quadraticCurveTo(neckCenterX, hemY + (opts.isAnarkali ? 24 : 10), neckCenterX + hemHalfWidth, hemY);
    ctx.moveTo(neckCenterX - hemHalfWidth, hemY);
    ctx.quadraticCurveTo(neckCenterX, hemY + (opts.isAnarkali ? 24 : 10), neckCenterX + hemHalfWidth, hemY);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.stroke();
  } else {
    // Back neck & Latkan ties
    ctx.beginPath();
    ctx.moveTo(neckCenterX - 8, neckY + 44);
    ctx.quadraticCurveTo(neckCenterX - 22, neckY + 80, neckCenterX - 16, neckY + 115);
    ctx.moveTo(neckCenterX + 8, neckY + 44);
    ctx.quadraticCurveTo(neckCenterX + 22, neckY + 80, neckCenterX + 16, neckY + 115);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 2. MEN'S FORMAL / CASUAL SHIRT RENDERER
 */
function renderMenShirt(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  spec: DesignSpecification,
  fillPattern: CanvasPattern | string,
  view: 'front' | 'back' | 'side'
) {
  const cX = W / 2;
  const collarY = 110;
  const shoulderY = 150;
  const chestY = 240;
  const waistY = 340;
  const hemY = 530; // shirt curved hem

  if (view === 'side') {
    renderGarmentSideProfile(ctx, W, H, spec, fillPattern, { waistY, hemY, isFlared: false });
    return;
  }

  ctx.save();
  // Sleeves
  ctx.beginPath();
  ctx.moveTo(cX - 120, shoulderY);
  ctx.lineTo(cX - 175, shoulderY + 40);
  ctx.lineTo(cX - 145, 360);
  ctx.lineTo(cX - 110, 355);
  ctx.lineTo(cX - 95, chestY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cX + 120, shoulderY);
  ctx.lineTo(cX + 175, shoulderY + 40);
  ctx.lineTo(cX + 145, 360);
  ctx.lineTo(cX + 110, 355);
  ctx.lineTo(cX + 95, chestY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  // Torso
  ctx.beginPath();
  ctx.moveTo(cX - 38, collarY + 18);
  ctx.lineTo(cX + 38, collarY + 18);
  ctx.lineTo(cX + 120, shoulderY);
  ctx.lineTo(cX + 95, chestY);
  ctx.lineTo(cX + 90, waistY);
  // Curved shirt tail hem
  ctx.quadraticCurveTo(cX + 92, hemY - 15, cX, hemY);
  ctx.quadraticCurveTo(cX - 92, hemY - 15, cX - 90, waistY);
  ctx.lineTo(cX - 95, chestY);
  ctx.lineTo(cX - 120, shoulderY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  apply3DShading(ctx, cX, 100, hemY);

  if (view === 'front') {
    // Shirt Collar with points
    ctx.beginPath();
    ctx.moveTo(cX - 42, collarY + 15);
    ctx.lineTo(cX - 28, collarY + 52); // left collar point
    ctx.lineTo(cX, collarY + 36);
    ctx.lineTo(cX + 28, collarY + 52); // right collar point
    ctx.lineTo(cX + 42, collarY + 15);
    ctx.closePath();
    ctx.fillStyle = fillPattern;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center button placket
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(cX - 11, collarY + 36, 22, hemY - (collarY + 36));
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.strokeRect(cX - 11, collarY + 36, 22, hemY - (collarY + 36));

    // Pearl buttons
    for (let b = 0; b < 6; b++) {
      const bY = collarY + 65 + b * 55;
      ctx.beginPath();
      ctx.arc(cX, bY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Chest pocket
    ctx.beginPath();
    ctx.rect(cX + 24, chestY - 30, 48, 54);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else {
    // Back Yoke seam
    ctx.beginPath();
    ctx.moveTo(cX - 115, shoulderY + 28);
    ctx.lineTo(cX + 115, shoulderY + 28);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 3. MEN'S T-SHIRT / POLO RENDERER
 */
function renderMenTshirt(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  spec: DesignSpecification,
  fillPattern: CanvasPattern | string,
  view: 'front' | 'back' | 'side'
) {
  const cX = W / 2;
  const neckY = 115;
  const shoulderY = 150;
  const chestY = 240;
  const waistY = 340;
  const hemY = 510;

  if (view === 'side') {
    renderGarmentSideProfile(ctx, W, H, spec, fillPattern, { waistY, hemY, isFlared: false });
    return;
  }

  ctx.save();
  // Short sleeves
  ctx.beginPath();
  ctx.moveTo(cX - 120, shoulderY);
  ctx.lineTo(cX - 160, shoulderY + 45);
  ctx.lineTo(cX - 135, 255);
  ctx.lineTo(cX - 95, chestY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cX + 120, shoulderY);
  ctx.lineTo(cX + 160, shoulderY + 45);
  ctx.lineTo(cX + 135, 255);
  ctx.lineTo(cX + 95, chestY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  // Torso
  ctx.beginPath();
  ctx.moveTo(cX - 38, neckY + 12);
  ctx.quadraticCurveTo(cX, neckY + (view === 'front' ? 44 : 22), cX + 38, neckY + 12);
  ctx.lineTo(cX + 120, shoulderY);
  ctx.lineTo(cX + 95, chestY);
  ctx.lineTo(cX + 92, hemY);
  ctx.lineTo(cX - 92, hemY);
  ctx.lineTo(cX - 95, chestY);
  ctx.lineTo(cX - 120, shoulderY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  apply3DShading(ctx, cX, 95, hemY);

  // Ribbed collar trim
  ctx.beginPath();
  ctx.moveTo(cX - 38, neckY + 12);
  ctx.quadraticCurveTo(cX, neckY + (view === 'front' ? 44 : 22), cX + 38, neckY + 12);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Sleeve and hem double topstitching
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cX - 92, hemY - 14);
  ctx.lineTo(cX + 92, hemY - 14);
  ctx.stroke();
  ctx.restore();
}

/**
 * 4. MEN'S KURTA RENDERER
 */
function renderMenKurta(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  spec: DesignSpecification,
  fillPattern: CanvasPattern | string,
  view: 'front' | 'back' | 'side'
) {
  const cX = W / 2;
  const neckY = 105;
  const shoulderY = 155;
  const chestY = 240;
  const waistY = 330;
  const hipY = 420;
  const hemY = 660; // Knee-length traditional straight kurta

  if (view === 'side') {
    renderGarmentSideProfile(ctx, W, H, spec, fillPattern, { waistY, hemY, isFlared: false });
    return;
  }

  ctx.save();
  // Full sleeves
  ctx.beginPath();
  ctx.moveTo(cX - 118, shoulderY);
  ctx.lineTo(cX - 165, shoulderY + 45);
  ctx.lineTo(cX - 150, 410);
  ctx.lineTo(cX - 116, 405);
  ctx.lineTo(cX - 92, chestY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cX + 118, shoulderY);
  ctx.lineTo(cX + 165, shoulderY + 45);
  ctx.lineTo(cX + 150, 410);
  ctx.lineTo(cX + 116, 405);
  ctx.lineTo(cX + 92, chestY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.moveTo(cX - 34, neckY + 18);
  ctx.lineTo(cX + 34, neckY + 18);
  ctx.lineTo(cX + 118, shoulderY);
  ctx.lineTo(cX + 92, chestY);
  ctx.lineTo(cX + 88, waistY);
  ctx.lineTo(cX + 92, hipY);
  ctx.lineTo(cX + 94, hemY);
  ctx.lineTo(cX - 94, hemY);
  ctx.lineTo(cX - 92, hipY);
  ctx.lineTo(cX - 88, waistY);
  ctx.lineTo(cX - 92, chestY);
  ctx.lineTo(cX - 118, shoulderY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  apply3DShading(ctx, cX, 95, hemY);

  // Mandarin Stand Collar
  ctx.beginPath();
  ctx.rect(cX - 34, neckY + 6, 68, 14);
  ctx.fillStyle = fillPattern;
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (view === 'front') {
    // Placket slit with buttons
    ctx.beginPath();
    ctx.moveTo(cX, neckY + 20);
    ctx.lineTo(cX, neckY + 180);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();

    for (let b = 0; b < 4; b++) {
      ctx.beginPath();
      ctx.arc(cX, neckY + 50 + b * 35, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#F3E5AB';
      ctx.fill();
      ctx.strokeStyle = '#9C7A22';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Side slits
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cX - 92, hipY);
    ctx.lineTo(cX - 94, hemY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cX + 92, hipY);
    ctx.lineTo(cX + 94, hemY);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 5. MEN'S NEHRU JACKET / BANDHGALA VEST
 */
function renderNehruJacket(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  spec: DesignSpecification,
  fillPattern: CanvasPattern | string,
  view: 'front' | 'back' | 'side'
) {
  const cX = W / 2;
  const neckY = 110;
  const shoulderY = 150;
  const chestY = 240;
  const waistY = 340;
  const hemY = 475; // Hip-length waistcoat

  if (view === 'side') {
    renderGarmentSideProfile(ctx, W, H, spec, fillPattern, { waistY, hemY, isFlared: false });
    return;
  }

  ctx.save();
  // Body (sleeveless vest)
  ctx.beginPath();
  ctx.moveTo(cX - 35, neckY + 15);
  ctx.lineTo(cX + 35, neckY + 15);
  ctx.lineTo(cX + 115, shoulderY);
  ctx.quadraticCurveTo(cX + 86, chestY - 20, cX + 90, chestY);
  ctx.lineTo(cX + 86, waistY);
  ctx.lineTo(cX + 90, hemY);
  ctx.lineTo(cX - 90, hemY);
  ctx.lineTo(cX - 86, waistY);
  ctx.lineTo(cX - 90, chestY);
  ctx.quadraticCurveTo(cX - 86, chestY - 20, cX - 115, shoulderY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  apply3DShading(ctx, cX, 90, hemY);

  // Mandarin Stand Collar
  ctx.beginPath();
  ctx.rect(cX - 35, neckY + 4, 70, 16);
  ctx.fillStyle = fillPattern;
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  if (view === 'front') {
    // Center button line
    ctx.beginPath();
    ctx.moveTo(cX, neckY + 20);
    ctx.lineTo(cX, hemY);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Metallic Brass / Silver Kurta buttons
    for (let b = 0; b < 6; b++) {
      ctx.beginPath();
      ctx.arc(cX, neckY + 45 + b * 42, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();
      ctx.strokeStyle = '#644A14';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Breast pocket welt
    ctx.beginPath();
    ctx.rect(cX + 22, chestY - 25, 42, 8);
    ctx.fillStyle = '#D4AF37';
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 6. BLOUSE / CROP TOP RENDERER
 */
function renderBlouse(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  spec: DesignSpecification,
  fillPattern: CanvasPattern | string,
  view: 'front' | 'back' | 'side'
) {
  const cX = W / 2;
  const neckY = 110;
  const shoulderY = 160;
  const bustY = 240;
  const hemY = 330; // Above or at waist level

  if (view === 'side') {
    renderGarmentSideProfile(ctx, W, H, spec, fillPattern, { waistY: hemY, hemY, isFlared: false });
    return;
  }

  ctx.save();
  // Short sleeves
  ctx.beginPath();
  ctx.moveTo(cX - 110, shoulderY - 8);
  ctx.lineTo(cX - 140, shoulderY + 30);
  ctx.lineTo(cX - 120, 240);
  ctx.lineTo(cX - 85, bustY - 10);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cX + 110, shoulderY - 8);
  ctx.lineTo(cX + 140, shoulderY + 30);
  ctx.lineTo(cX + 120, 240);
  ctx.lineTo(cX + 85, bustY - 10);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  // Torso
  ctx.beginPath();
  const neckRadiusX = 35;
  const neckDepth = view === 'front' ? 42 : 28;
  ctx.moveTo(cX - neckRadiusX, neckY + 28);
  ctx.quadraticCurveTo(cX, neckY + 28 + neckDepth, cX + neckRadiusX, neckY + 28);
  ctx.lineTo(cX + 110, shoulderY - 8);
  ctx.quadraticCurveTo(cX + 82, bustY - 30, cX + 86, bustY);
  ctx.lineTo(cX + 75, hemY);
  ctx.lineTo(cX - 75, hemY);
  ctx.lineTo(cX - 86, bustY);
  ctx.quadraticCurveTo(cX - 82, bustY - 30, cX - 110, shoulderY - 8);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  apply3DShading(ctx, cX, 85, hemY);

  // Border trim
  ctx.beginPath();
  ctx.moveTo(cX - 75, hemY);
  ctx.lineTo(cX + 75, hemY);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  if (view === 'back') {
    // Back dori tie
    ctx.beginPath();
    ctx.moveTo(cX - 8, neckY + 45);
    ctx.quadraticCurveTo(cX - 18, neckY + 80, cX - 12, neckY + 110);
    ctx.moveTo(cX + 8, neckY + 45);
    ctx.quadraticCurveTo(cX + 18, neckY + 80, cX + 12, neckY + 110);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 7. GOWN / MAXI DRESS RENDERER
 */
function renderGown(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  spec: DesignSpecification,
  fillPattern: CanvasPattern | string,
  view: 'front' | 'back' | 'side'
) {
  const cX = W / 2;
  const neckY = 100;
  const shoulderY = 158;
  const bustY = 240;
  const waistY = 310;
  const hemY = 720; // Floor sweeping
  const hemHalfWidth = 230;

  if (view === 'side') {
    renderGarmentSideProfile(ctx, W, H, spec, fillPattern, { waistY, hemY, isFlared: true });
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cX - 34, neckY + 28);
  ctx.quadraticCurveTo(cX, neckY + 55, cX + 34, neckY + 28);
  ctx.lineTo(cX + 105, shoulderY - 8);
  ctx.quadraticCurveTo(cX + 80, bustY - 20, cX + 82, bustY);
  ctx.lineTo(cX + 68, waistY);
  ctx.bezierCurveTo(cX + 120, 430, cX + 190, 580, cX + hemHalfWidth, hemY);
  ctx.quadraticCurveTo(cX, hemY + 20, cX - hemHalfWidth, hemY);
  ctx.bezierCurveTo(cX - 190, 580, cX - 120, 430, cX - 68, waistY);
  ctx.lineTo(cX - 82, bustY);
  ctx.quadraticCurveTo(cX - 80, bustY - 20, cX - 105, shoulderY - 8);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  apply3DShading(ctx, cX, hemHalfWidth, hemY);

  // Empire waist sash
  ctx.beginPath();
  ctx.rect(cX - 68, waistY - 6, 136, 12);
  ctx.fillStyle = '#D4AF37';
  ctx.fill();
  ctx.restore();
}

/**
 * 8. TROUSERS / PANTS RENDERER
 */
function renderTrousers(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  _spec: DesignSpecification,
  fillPattern: CanvasPattern | string,
  view: 'front' | 'back' | 'side'
) {
  const cX = W / 2;
  const waistY = 280;
  const hipY = 360;
  const crotchY = 420;
  const hemY = 710;

  ctx.save();
  ctx.beginPath();
  // Waistband
  ctx.moveTo(cX - 80, waistY);
  ctx.lineTo(cX + 80, waistY);
  // Outer right hip & leg
  ctx.quadraticCurveTo(cX + 90, hipY, cX + 65, 520);
  ctx.lineTo(cX + 55, hemY);
  // Right leg hem
  ctx.lineTo(cX + 15, hemY);
  // Inseam up to crotch
  ctx.lineTo(cX + 5, crotchY);
  // Left inseam down to hem
  ctx.lineTo(cX - 15, hemY);
  // Left leg hem
  ctx.lineTo(cX - 55, hemY);
  // Outer left leg & hip
  ctx.lineTo(cX - 65, 520);
  ctx.quadraticCurveTo(cX - 90, hipY, cX - 80, waistY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  apply3DShading(ctx, cX, 85, hemY);

  if (view === 'front') {
    // Fly front crease
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cX, waistY);
    ctx.lineTo(cX, crotchY - 15);
    ctx.stroke();

    // Side slash pockets
    ctx.beginPath();
    ctx.moveTo(cX - 70, waistY);
    ctx.lineTo(cX - 85, waistY + 60);
    ctx.moveTo(cX + 70, waistY);
    ctx.lineTo(cX + 85, waistY + 60);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Side Profile Renderer (For 360° inspection preview)
 */
function renderGarmentSideProfile(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  _spec: DesignSpecification,
  fillPattern: CanvasPattern | string,
  opts: { waistY: number; hemY: number; isFlared: boolean }
) {
  const cX = W / 2;
  const shoulderY = 160;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cX - 25, shoulderY);
  // Front bust / chest curve
  ctx.quadraticCurveTo(cX + 45, 230, cX + 25, opts.waistY);
  if (opts.isFlared) {
    ctx.quadraticCurveTo(cX + 80, (opts.waistY + opts.hemY) / 2, cX + 110, opts.hemY);
    ctx.lineTo(cX - 65, opts.hemY);
    ctx.quadraticCurveTo(cX - 45, (opts.waistY + opts.hemY) / 2, cX - 25, opts.waistY);
  } else {
    ctx.lineTo(cX + 30, opts.hemY);
    ctx.lineTo(cX - 30, opts.hemY);
    ctx.lineTo(cX - 25, opts.waistY);
  }
  // Back contour
  ctx.quadraticCurveTo(cX - 38, 230, cX - 25, shoulderY);
  ctx.closePath();
  ctx.fillStyle = fillPattern;
  ctx.fill();

  apply3DShading(ctx, cX, 70, opts.hemY);
  ctx.restore();
}

/**
 * Volumetric 3D Shading Gradient (Provides depth, light highlights, and seam shadow)
 */
function apply3DShading(ctx: CanvasRenderingContext2D, cX: number, halfW: number, hemY: number) {
  const shadeGrad = ctx.createLinearGradient(cX - halfW, 0, cX + halfW, 0);
  shadeGrad.addColorStop(0, 'rgba(0,0,0,0.22)');
  shadeGrad.addColorStop(0.2, 'rgba(0,0,0,0.04)');
  shadeGrad.addColorStop(0.48, 'rgba(255,255,255,0.18)');
  shadeGrad.addColorStop(0.55, 'rgba(255,255,255,0.06)');
  shadeGrad.addColorStop(0.82, 'rgba(0,0,0,0.05)');
  shadeGrad.addColorStop(1, 'rgba(0,0,0,0.24)');
  ctx.fillStyle = shadeGrad;
  ctx.fill();

  // Subtle perimeter seam outline
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Procedurally draws rich textile patterns matching detected characteristics
 */
function drawProceduralFabricTexture(ctx: CanvasRenderingContext2D, spec: DesignSpecification) {
  const W = 240;
  const H = 240;
  const pName = (spec.pattern || '').toLowerCase();
  const baseColor = spec.primaryColorHex || '#264653';

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, W, H);

  // Micro-weave overlay
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let x = 0; x < W; x += 4) {
    ctx.fillRect(x, 0, 1, H);
  }
  for (let y = 0; y < H; y += 4) {
    ctx.fillRect(0, y, W, 1);
  }

  const accent1 = spec.secondaryHexes?.[0] || '#D4AF37';
  const accent2 = spec.secondaryHexes?.[1] || '#FAF2EE';

  if (pName.includes('floral') || pName.includes('botanical')) {
    const grid = 60;
    for (let gx = 15; gx < W; gx += grid) {
      for (let gy = 15; gy < H; gy += grid) {
        ctx.save();
        ctx.translate(gx, gy);
        ctx.fillStyle = accent2;
        for (let p = 0; p < 6; p++) {
          ctx.beginPath();
          const ang = (p * Math.PI) / 3;
          ctx.arc(Math.cos(ang) * 9, Math.sin(ang) * 9, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = accent1;
        ctx.fill();
        ctx.restore();
      }
    }
  } else if (pName.includes('geometric') || pName.includes('chevron')) {
    ctx.strokeStyle = accent1;
    ctx.lineWidth = 1.8;
    for (let d = -W; d < W * 2; d += 24) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + H, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(d + H, 0);
      ctx.lineTo(d, H);
      ctx.stroke();
    }
  } else if (pName.includes('stripe')) {
    ctx.fillStyle = accent1;
    for (let s = 0; s < W; s += 16) {
      ctx.fillRect(s, 0, 3, H);
    }
  } else if (pName.includes('block') || pName.includes('ajrakh') || pName.includes('traditional')) {
    for (let bx = 20; bx < W; bx += 48) {
      for (let by = 20; by < H; by += 48) {
        ctx.save();
        ctx.translate(bx, by);
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = accent1;
        ctx.fill();
        ctx.restore();
      }
    }
  } else {
    // Solid textured fabric with slub weave highlights
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 40; i++) {
      const rx = (i * 37) % W;
      const ry = (i * 59) % H;
      ctx.fillRect(rx, ry, 18, 1.5);
    }
  }
}
