import {
  AIAnalysisResult,
  ColorExtraction,
  CustomizationPreferences,
  DesignSpecification,
  FabricQuantity,
  InputType,
  KurtiDesign,
  PatternCategory,
  Tailor,
} from '../types';
import { ImageAnalysisService } from './imageAnalysisService';
import { extractDominantColors } from './colorExtractor';
import { generateKurtiDesignVisual } from './designVisualizer';

export { extractDominantColors as extractDominantColorsFromImage };

/**
 * Full Pipeline: Analyze Uploaded Kurti / Fabric
 * Uses ImageAnalysisService with deterministic K-Means Canvas extraction,
 * Input Type classification (Fabric Only vs Finished Garment vs Unclear),
 * and CrispAIService integration.
 */
export async function runAIAnalysis(
  imageSrc: string,
  filename?: string,
  options?: {
    declaredInputType?: InputType;
    fabricQuantity?: FabricQuantity;
  }
): Promise<AIAnalysisResult> {
  return ImageAnalysisService.analyzeImage(imageSrc, {
    filename,
    sourceType: 'upload',
    declaredInputType: options?.declaredInputType,
    fabricQuantity: options?.fabricQuantity,
  });
}

// Helper for color distance
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

function computeHexSimilarity(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0.5;
  const dist = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
  return Math.max(0, 1 - dist / 441.67);
}

const COLOR_FAMILIES: Record<string, string[]> = {
  pink: ['pink', 'rose', 'blush', 'dusty rose', 'peach', 'coral', 'mauve', 'magenta', 'salmon'],
  green: ['green', 'sage', 'olive', 'mint', 'emerald', 'forest', 'pista', 'lime'],
  blue: ['blue', 'indigo', 'navy', 'sky', 'royal', 'teal', 'cyan', 'powder blue'],
  yellow: ['yellow', 'mustard', 'ochre', 'gold', 'haldi', 'lemon', 'amber'],
  red: ['red', 'terracotta', 'maroon', 'rust', 'brick', 'crimson', 'wine', 'burgundy'],
  neutral: ['cream', 'ivory', 'white', 'off white', 'beige', 'sand', 'tan', 'ecru'],
  dark: ['black', 'charcoal', 'grey', 'gray', 'slate'],
};

function getColorFamilies(name: string): string[] {
  const lower = name.toLowerCase();
  const matched: string[] = [];
  for (const [family, keywords] of Object.entries(COLOR_FAMILIES)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(family);
    }
  }
  return matched;
}

export interface AvoidedDesignItem {
  designName: string;
  category: string;
  reason: string;
  requiredMeters: string;
}

export interface FabricSuitabilityAssessment {
  recommendedDesigns: KurtiDesign[];
  avoidedDesigns: AvoidedDesignItem[];
  isFabricOnly: boolean;
  fabricQuantityLabel: string;
}

/**
 * Builds tailored, fabric-grounded Kurti & Short Kurti designs using the uploaded fabric
 * as the strict source of truth for color, pattern, and texture.
 */
export function buildTailoredFabricRecommendations(
  analysis: AIAnalysisResult,
  uploadedImage?: string | null
): KurtiDesign[] {
  const primaryColorName = analysis.dominantColors?.[0]?.name || 'Royal Blue';
  const primaryHex = analysis.dominantColors?.[0]?.hex || '#1E3A8A';
  const secondaryNames = analysis.dominantColors?.slice(1).map((c) => c.name) || ['Gold Accent'];
  const secondaryHexes = analysis.dominantColors?.slice(1).map((c) => c.hex) || ['#D4AF37'];
  const pattern = analysis.pattern || 'Floral';
  const fabricName = analysis.materialIdentified || analysis.likelyFabric || 'Cotton';
  const craft = analysis.pattern || 'Artisan Weave';
  const isFabricOnly = analysis.inputType === 'fabric_only';

  const specs: Array<{
    id: string;
    name: string;
    category: string;
    collection: 'women' | 'men';
    gender: 'women' | 'men';
    garmentType: string;
    silhouette: string;
    style: string;
    neckline: string;
    sleeves: string;
    length: string;
    occasion: string;
    baseScore: number;
    badge: 'Best Match' | 'Highly Similar' | 'Popular Style' | 'Trending';
    reasons: string[];
    minMeters: number;
    suitabilityNote: string;
    price: number;
    tailors: number;
    details: string;
  }> = [
    // WOMEN'S COLLECTION
    {
      id: 'REC-ALINE-KURTI',
      name: `${primaryColorName} ${pattern} A-Line Kurti`,
      category: 'kurti',
      collection: 'women',
      gender: 'women',
      garmentType: 'Kurti',
      silhouette: 'A-line',
      style: 'A-line',
      neckline: 'Round Neck with V-Slit',
      sleeves: 'Three-Quarter Sleeves',
      length: 'Calf Length (44")',
      occasion: 'Daily & Casual Wear',
      baseScore: 95,
      badge: 'Best Match',
      reasons: [
        `Uses the detected ${primaryColorName} and ${pattern} characteristics from your fabric.`,
        `The gradual A-line flare gives the ${pattern} motifs natural movement while maintaining clean draping.`,
        `Comfortable side slits with three-quarter sleeves ideal for everyday ethnic elegance.`,
      ],
      minMeters: 2.2,
      suitabilityNote: 'Perfect for standard fabric cuts (2.0–2.5m). Requires ~2.2m for size M.',
      price: 850,
      tailors: 16,
      details: 'Round neck with subtle V-slit, side slits, matching gold hem piping',
    },
    {
      id: 'REC-STRAIGHT-KURTI',
      name: `${primaryColorName} ${pattern} Straight Cut Kurti`,
      category: 'kurti',
      collection: 'women',
      gender: 'women',
      garmentType: 'Kurti',
      silhouette: 'Straight Cut',
      style: 'Straight Cut',
      neckline: 'Mandarin Collar with Slit',
      sleeves: 'Elbow Length Sleeves',
      length: 'Knee Length (42")',
      occasion: 'Office & Work Wear',
      baseScore: 92,
      badge: 'Popular Style',
      reasons: [
        `Highlights the motif alignment of your ${pattern} ${primaryColorName} fabric.`,
        `Classic straight cut with side slits is ideal for standard yardage and structured drape.`,
        `Tailored mandarin collar frames the neckline with refined symmetry.`,
      ],
      minMeters: 2.0,
      suitabilityNote: 'Optimized for linear motif flow. Requires ~2.0m for standard fit.',
      price: 750,
      tailors: 18,
      details: 'Chinese band collar with vertical slit placket and brass buttons',
    },
    {
      id: 'REC-ANARKALI-KURTI',
      name: `${primaryColorName} ${pattern} Flared Anarkali Kurti`,
      category: 'kurti',
      collection: 'women',
      gender: 'women',
      garmentType: 'Anarkali',
      silhouette: 'Anarkali',
      style: 'Anarkali',
      neckline: 'Sweetheart Neckline',
      sleeves: 'Full Sleeves',
      length: 'Floor Length (52")',
      occasion: 'Festive & Celebration',
      baseScore: 89,
      badge: 'Trending',
      reasons: [
        `High-volume pleated kali flare showcases the rich ${pattern} textile sweep.`,
        `Fitted sweetheart bodice with dramatic cascading flare for royal festive occasions.`,
        `Contrasting gold hem piping accentuates every spin and stride.`,
      ],
      minMeters: 3.5,
      suitabilityNote: 'Requires generous fabric yardage (~3.5–4.0m) to achieve voluminous pleating.',
      price: 1350,
      tailors: 12,
      details: 'Pleated kalidar panels, sweetheart bust cut, heavy gold hem border',
    },
    {
      id: 'REC-ALINE-SHORT-KURTI',
      name: `${primaryColorName} ${pattern} A-Line Short Kurti`,
      category: 'short-kurti',
      collection: 'women',
      gender: 'women',
      garmentType: 'Short Kurti',
      silhouette: 'A-line',
      style: 'A-line',
      neckline: 'Sweetheart Neckline',
      sleeves: 'Three-Quarter Sleeves',
      length: 'Hip Length (30")',
      occasion: 'College & Casual Fusion',
      baseScore: 94,
      badge: 'Trending',
      reasons: [
        `Chic Short Kurti tailored from your ${pattern} ${primaryColorName} fabric.`,
        `Pairs effortlessly with jeans, cigarette pants, or palazzos.`,
        `Compact yardage (~1.4–1.6m) allows creation even from smaller fabric pieces.`,
      ],
      minMeters: 1.5,
      suitabilityNote: 'Compact yardage requirement (~1.5m). Versatile indo-western fusion styling.',
      price: 680,
      tailors: 14,
      details: 'Sweetheart neck cut, hip-length hemline with side slits, three-quarter sleeves',
    },
    {
      id: 'REC-BLOUSE-CROP',
      name: `${primaryColorName} ${pattern} Designer Blouse / Crop Top`,
      category: 'blouse',
      collection: 'women',
      gender: 'women',
      garmentType: 'Blouse',
      silhouette: 'Slim Fit',
      style: 'Classic Fit',
      neckline: 'Boat Neck with Keyhole Back',
      sleeves: 'Elbow Length Sleeves',
      length: 'Waist Length (15")',
      occasion: 'Festive & Ethnic Fusion',
      baseScore: 91,
      badge: 'Highly Similar',
      reasons: [
        `Perfect for small cuts or remnant lengths (~0.8–1.2m) of ${fabricName}.`,
        `Structured princess seam tailoring provides bespoke flattering support.`,
        `Pairs with sarees, lehengas, or high-waisted ethnic skirts.`,
      ],
      minMeters: 1.0,
      suitabilityNote: 'Minimal yardage requirement (~0.8–1.0m). Excellent for compact fabric lengths.',
      price: 620,
      tailors: 22,
      details: 'Princess seams, padded cups support, back dori latkan tie-up',
    },
    {
      id: 'REC-GOWN-DRESS',
      name: `${primaryColorName} ${pattern} Indo-Western Maxi Gown`,
      category: 'gown',
      collection: 'women',
      gender: 'women',
      garmentType: 'Gown',
      silhouette: 'Flared',
      style: 'Flared',
      neckline: 'V-Neck with Empire Waist',
      sleeves: 'Sleeveless / Cap Sleeves',
      length: 'Floor Length (54")',
      occasion: 'Party & Evening Wear',
      baseScore: 87,
      badge: 'Popular Style',
      reasons: [
        `Modern Indo-western silhouette transforming the ${pattern} fabric into evening couture.`,
        `Sweeping floor-length drape emphasizes continuous textile elegance.`,
        `Gilded empire waistband flatters the silhouette while maintaining clean lines.`,
      ],
      minMeters: 3.2,
      suitabilityNote: 'Requires ~3.2m continuous fabric for seamless full-length drape.',
      price: 1450,
      tailors: 9,
      details: 'Empire waistline with gold sash, fluid floor-length flare, concealed side zipper',
    },

    // MEN'S COLLECTION
    {
      id: 'REC-MEN-SHIRT',
      name: `${primaryColorName} ${pattern} Tailored Button-Down Shirt`,
      category: 'men-shirt',
      collection: 'men',
      gender: 'men',
      garmentType: 'Men Shirt',
      silhouette: 'Classic Fit',
      style: 'Classic Fit',
      neckline: 'Spread Collar with Stand',
      sleeves: 'Full Sleeves with Cuffs',
      length: 'Hip Length (30")',
      occasion: 'Casual & Semi-Formal',
      baseScore: 94,
      badge: 'Best Match',
      reasons: [
        `Transforms your ${primaryColorName} ${pattern} ${fabricName} into a crisp modern shirt.`,
        `Tailored spread collar, curved shirt tail hem, and matching mother-of-pearl buttons.`,
        `Comfortable everyday fit with reinforced double-needle tailoring.`,
      ],
      minMeters: 2.0,
      suitabilityNote: 'Standard men shirt requires ~1.8–2.2m of fabric.',
      price: 850,
      tailors: 15,
      details: 'Spread collar with collar stays, front button placket, left chest pocket, button cuffs',
    },
    {
      id: 'REC-MEN-TSHIRT',
      name: `${primaryColorName} Casual Crewneck Tee`,
      category: 'men-tshirt',
      collection: 'men',
      gender: 'men',
      garmentType: 'Men TShirt',
      silhouette: 'Regular Fit',
      style: 'Classic Fit',
      neckline: 'Ribbed Crewneck',
      sleeves: 'Short Sleeves',
      length: 'Waist to Hip (28")',
      occasion: 'Casual & Lounge',
      baseScore: 88,
      badge: 'Popular Style',
      reasons: [
        `Minimalist everyday tee accentuating the soft texture of your ${fabricName}.`,
        `Clean crewneck collar with reinforced neckline taping and double-stitched hem.`,
        `Quick stitching turnaround with versatile styling options.`,
      ],
      minMeters: 1.4,
      suitabilityNote: 'Requires ~1.2–1.5m fabric for regular fit.',
      price: 490,
      tailors: 12,
      details: 'Ribbed neck band, twin-needle sleeve and hem stitching, relaxed modern cut',
    },
    {
      id: 'REC-MEN-KURTA',
      name: `${primaryColorName} ${pattern} Straight Bandhgala Kurta`,
      category: 'men-kurta',
      collection: 'men',
      gender: 'men',
      garmentType: 'Men Kurta',
      silhouette: 'Straight Cut',
      style: 'Straight Cut',
      neckline: 'Mandarin Stand Collar',
      sleeves: 'Full Sleeves',
      length: 'Knee Length (42")',
      occasion: 'Festive & Celebration',
      baseScore: 95,
      badge: 'Best Match',
      reasons: [
        `Refined ethnic silhouette emphasizing the rich ${pattern} textile motifs.`,
        `Mandarin band collar with concealed button placket and side slits for effortless movement.`,
        `Pairs authentically with white pyjamas, churidars, or denim trousers.`,
      ],
      minMeters: 2.4,
      suitabilityNote: 'Requires ~2.2–2.5m fabric for traditional knee-length straight cut.',
      price: 890,
      tailors: 19,
      details: 'Mandarin collar, four-button placket with antique metallic buttons, side seam pockets',
    },
    {
      id: 'REC-MEN-JACKET',
      name: `${primaryColorName} ${pattern} Royal Nehru Jacket`,
      category: 'men-jacket',
      collection: 'men',
      gender: 'men',
      garmentType: 'Men Jacket',
      silhouette: 'Structured Fit',
      style: 'Classic Fit',
      neckline: 'Mandarin Collar Stand',
      sleeves: 'Sleeveless Vest',
      length: 'Hip Length (28")',
      occasion: 'Festive & Formal Events',
      baseScore: 92,
      badge: 'Trending',
      reasons: [
        `Regal sleeveless Nehru jacket highlighting the woven texture and color of ${fabricName}.`,
        `Mandarin band collar, structured front welt pockets, and ornate brass buttons.`,
        `Layers elegantly over kurtas or formal shirts for festive occasions.`,
      ],
      minMeters: 1.6,
      suitabilityNote: 'Structured waistcoat requiring ~1.5–1.8m. Heavy fusing ensures crisp silhouette.',
      price: 990,
      tailors: 16,
      details: 'Structured canvas interlining, Mandarin stand collar, front breast welt pocket, brass buttons',
    },
    {
      id: 'REC-MEN-TROUSERS',
      name: `${primaryColorName} Tailored Pleated Trousers`,
      category: 'trousers',
      collection: 'men',
      gender: 'men',
      garmentType: 'Trousers',
      silhouette: 'Tapered Fit',
      style: 'Classic Fit',
      neckline: 'Waistband with Belt Loops',
      sleeves: 'N/A',
      length: 'Ankle Length (40")',
      occasion: 'Work & Formal',
      baseScore: 86,
      badge: 'Popular Style',
      reasons: [
        `Sharp tailored trousers complementing the drape and weave of ${fabricName}.`,
        `Curved waistband with sturdy belt loops, zip fly, and slant side pockets.`,
        `Clean tapered leg contour for refined everyday comfort.`,
      ],
      minMeters: 1.8,
      suitabilityNote: 'Requires ~1.6–1.9m of medium-to-heavyweight fabric.',
      price: 780,
      tailors: 14,
      details: 'Fly front with button closure, belt loops, side slant pockets, back welt pocket',
    },
  ];

  return specs.map((item) => {
    const designSpec: DesignSpecification = {
      garmentType: item.garmentType,
      silhouette: item.silhouette,
      primaryColor: primaryColorName,
      primaryColorHex: primaryHex,
      secondaryColors: secondaryNames,
      secondaryHexes: secondaryHexes,
      pattern,
      neckline: item.neckline,
      sleeveStyle: item.sleeves,
      length: item.length,
      fabricCharacteristics: `${fabricName} with ${pattern} print (${craft})`,
      designDetails: item.details,
      fabricImageUrl: uploadedImage || undefined,
      sourceOfTruth: isFabricOnly ? 'uploaded_fabric' : 'finished_garment_reference',
    };

    // Generate bespoke visual representation using the exact spec and uploaded fabric
    const visuals = generateKurtiDesignVisual(designSpec, uploadedImage);

    const kurtiDesign: KurtiDesign = {
      id: item.id,
      name: item.name,
      category: item.category,
      collection: item.collection,
      gender: item.gender,
      description: `Bespoke ${item.garmentType} tailored from your detected ${primaryColorName} ${pattern} fabric. Designed with a ${item.silhouette} cut, ${item.neckline}, and ${item.sleeves}.`,
      imageUrl: visuals.imageUrl,
      frontImage: visuals.frontImage,
      backImage: visuals.backImage,
      colors: [primaryColorName, ...secondaryNames],
      hexPalette: [primaryHex, ...secondaryHexes],
      pattern,
      fabric: fabricName,
      occasion: item.occasion,
      style: item.style,
      neckline: item.neckline,
      sleeves: item.sleeves,
      length: item.length,
      silhouette: item.silhouette,
      price: item.price,
      priceEstimate: item.price,
      popularityScore: item.baseScore,
      tags: [item.collection, item.garmentType, item.silhouette, primaryColorName, pattern, item.sleeves],
      availableTailorCount: item.tailors,
      matchScore: item.baseScore,
      matchReasons: item.reasons,
      badge: item.badge,
      specialInstructions: item.details,
      minFabricRequiredMeters: item.minMeters,
      fabricSuitabilityNote: item.suitabilityNote,
      garmentIdeaType: item.category,
      designSpecification: designSpec,
    };

    return kurtiDesign;
  });
}

/**
 * Recommendation Engine: Fabric-Aware & Kurti Feature-Based Retrieval & Preference Matching
 */
export function getRecommendedDesigns(
  catalog: KurtiDesign[],
  analysis: AIAnalysisResult | null,
  preferences?: CustomizationPreferences | null,
  filters?: {
    pattern?: string;
    color?: string;
    fabric?: string;
    occasion?: string;
    style?: string;
    category?: 'all' | 'kurti' | 'short-kurti' | string;
    collection?: 'all' | 'women' | 'men';
    sortBy?: 'match' | 'popular' | 'trending';
    fabricQuantity?: FabricQuantity;
  },
  uploadedImage?: string | null
): KurtiDesign[] {
  const assessment = getFabricSuitabilityAssessment(catalog, analysis, preferences, filters, uploadedImage);
  return assessment.recommendedDesigns;
}

/**
 * Comprehensive Fabric Suitability Assessment
 * Returns both recommended designs and designs to avoid (with explicit physical reasons)
 */
export function getFabricSuitabilityAssessment(
  catalog: KurtiDesign[],
  analysis: AIAnalysisResult | null,
  preferences?: CustomizationPreferences | null,
  filters?: {
    pattern?: string;
    color?: string;
    fabric?: string;
    occasion?: string;
    style?: string;
    category?: 'all' | 'kurti' | 'short-kurti' | string;
    collection?: 'all' | 'women' | 'men';
    sortBy?: 'match' | 'popular' | 'trending';
    fabricQuantity?: FabricQuantity;
  },
  uploadedImage?: string | null
): FabricSuitabilityAssessment {
  const isFabricOnly = analysis?.inputType === 'fabric_only';
  const effectiveQuantity: FabricQuantity =
    filters?.fabricQuantity ||
    analysis?.fabricQuantity || {
      category: 'unknown',
      label: 'Unmeasured / Not specified',
      userProvided: false,
    };

  const quantityCat = effectiveQuantity.category;

  // Source of Truth: When an analysis exists, use the fabric-grounded Kurti & Short Kurti catalog
  const baseCatalog: KurtiDesign[] = analysis
    ? buildTailoredFabricRecommendations(analysis, uploadedImage)
    : catalog;

  // Filter catalog:
  // - Never include Saree as a standard recommendation unless fabric is >= 5.5m
  // - Allow short-kurti and kurti
  const validCatalog = baseCatalog.filter((item) => {
    const title = (item.name || '').toLowerCase();
    // Strictly prevent Saree from appearing as a regular recommendation
    if (title.includes('saree')) {
      return quantityCat === 'saree_length' || (effectiveQuantity.meters && effectiveQuantity.meters >= 5.5);
    }
    return true;
  });

  const avoidedDesigns: AvoidedDesignItem[] = [];

  // If fabric is small (< 1.5m or 'small'):
  if (isFabricOnly && (quantityCat === 'small' || (effectiveQuantity.meters && effectiveQuantity.meters < 1.6))) {
    avoidedDesigns.push({
      designName: 'Full-Length Saree with Blouse',
      category: 'Saree',
      reason: 'Saree requires at least 5.5 – 6.0 meters of continuous woven fabric with pallu. Available fabric is insufficient.',
      requiredMeters: '5.5 – 6.0 meters',
    });
    avoidedDesigns.push({
      designName: 'Floor-Length Flared Anarkali Kurti',
      category: 'Anarkali',
      reason: 'Multi-tiered kalidar flares require 3.8 – 4.5 meters of continuous fabric. Available piece is insufficient.',
      requiredMeters: '3.8 – 4.5 meters',
    });
  } else if (isFabricOnly && (quantityCat === 'standard' || quantityCat === 'unknown')) {
    // Saree is avoided because standard kurti cut (2 - 2.5m) or unknown cut cannot stitch a saree
    avoidedDesigns.push({
      designName: 'Full-Length Saree with Blouse',
      category: 'Saree',
      reason: 'Saree requires at least 5.5 – 6.0 meters of continuous yardage with pallu. Standard kurti fabric cuts do not have enough length.',
      requiredMeters: '5.5 – 6.0 meters',
    });
    if (quantityCat === 'standard') {
      avoidedDesigns.push({
        designName: 'Grand 32-Kali Floor-Length Anarkali',
        category: 'Anarkali',
        reason: 'Requires 4.0 – 4.5 meters of continuous fabric for high volume flare. Standard 2.2m cut will fall short.',
        requiredMeters: '4.0 – 4.5 meters',
      });
    }
  } else if (isFabricOnly && quantityCat === 'large') {
    avoidedDesigns.push({
      designName: 'Full-Length Saree with Blouse',
      category: 'Saree',
      reason: 'Saree requires at least 5.5 – 6.0 meters of continuous woven fabric with pallu.',
      requiredMeters: '5.5 – 6.0 meters',
    });
  }

  const scoredList = validCatalog.map((design) => {
    let colorSim = 0.5;
    let patternSim = 0.5;
    let fabricSuitabilityBonus = 0.0;
    let prefBonus = 0.0;
    const popSim = (design.popularityScore || 80) / 100;
    const matchReasons: string[] = [];

    const minMeters = design.minFabricRequiredMeters || (design.category === 'short-kurti' ? 1.4 : 2.2);

    // 1. Color Matching
    if (analysis && analysis.dominantColors?.length > 0) {
      let totalColorSim = 0;
      let totalWeight = 0;
      const matchedColors: string[] = [];

      analysis.dominantColors.forEach((det) => {
        const weight = Math.max(0.2, (det.percentage || 25) / 100);
        let bestSimForDet = 0.45;
        const detFamilies = getColorFamilies(det.name);

        (design.hexPalette || []).forEach((desHex, idx) => {
          const desColorName = design.colors[idx] || '';
          let sim = computeHexSimilarity(det.hex, desHex);

          const desFamilies = getColorFamilies(desColorName);
          const hasSharedFamily = detFamilies.some((f) => desFamilies.includes(f));
          if (hasSharedFamily) {
            sim = Math.min(1.0, sim + 0.22);
            matchedColors.push(desColorName);
          }

          const detWords = det.name.toLowerCase().split(/\s+/);
          const desWords = desColorName.toLowerCase().split(/\s+/);
          if (detWords.some((w) => w.length > 3 && desWords.includes(w))) {
            sim = Math.min(1.0, sim + 0.18);
            matchedColors.push(desColorName);
          }

          if (sim > bestSimForDet) {
            bestSimForDet = sim;
          }
        });

        totalColorSim += bestSimForDet * weight;
        totalWeight += weight;
      });

      colorSim = totalWeight > 0 ? totalColorSim / totalWeight : 0.55;
      const uniqueMatched = Array.from(new Set(matchedColors)).slice(0, 2);
      if (uniqueMatched.length > 0) {
        matchReasons.push(`Matches your detected ${uniqueMatched.join(' & ')} palette`);
      } else {
        matchReasons.push('Harmonious color palette alignment');
      }
    }

    // 2. Pattern & Texture Matching
    if (analysis) {
      const anaPattern = (analysis.pattern || '').toLowerCase();
      const desPattern = (design.pattern || '').toLowerCase();

      if (anaPattern) {
        if (desPattern === anaPattern || desPattern.includes(anaPattern) || anaPattern.includes(desPattern)) {
          patternSim = 1.0;
          matchReasons.push(`Ideal for your detected ${design.pattern} print`);
        } else if (
          anaPattern.includes('embroider') &&
          (desPattern.includes('traditional') || desPattern.includes('block print') || desPattern.includes('floral'))
        ) {
          patternSim = 0.85;
          matchReasons.push('Harmonious needlework & artisan craft aesthetic');
        } else if (
          (anaPattern.includes('floral') && desPattern.includes('block print')) ||
          (anaPattern.includes('block print') && desPattern.includes('floral')) ||
          (anaPattern.includes('geometric') && (desPattern.includes('stripes') || desPattern.includes('checks')))
        ) {
          patternSim = 0.82;
          matchReasons.push(`Complements ${design.pattern} weave alignment`);
        } else if (desPattern === 'solid') {
          patternSim = 0.70;
          matchReasons.push('Clean canvas cut allowing fabric texture to shine');
        } else {
          patternSim = 0.55;
        }
      }
    }

    // 3. Fabric Quantity & Physical Compatibility Check
    if (isFabricOnly) {
      // SMALL FABRIC PIECE (< 1.5m):
      if (quantityCat === 'small' || (effectiveQuantity.meters && effectiveQuantity.meters < 1.6)) {
        if (minMeters <= 1.2) {
          // Blouse or small crop top / yoke top
          fabricSuitabilityBonus += 0.35;
          matchReasons.unshift(
            design.garmentIdeaType === 'blouse'
              ? 'Recommended because the uploaded fabric appears to be a smaller fabric piece and this bespoke blouse can be created with limited material (~0.8 - 1.2m)'
              : 'Recommended because the fabric pattern suits a compact peplum silhouette and requires minimal yardage (~1.2m)'
          );
        } else if (minMeters <= 1.6) {
          fabricSuitabilityBonus += 0.25;
          matchReasons.unshift(
            'Short Kurti — Recommended because the fabric has a suitable pattern and appears appropriate for this garment type with limited yardage'
          );
        } else {
          // Requires more fabric than available
          fabricSuitabilityBonus -= 0.35;
        }
      }

      // STANDARD FABRIC PIECE (1.8 - 2.5m):
      else if (quantityCat === 'standard' || (effectiveQuantity.meters && effectiveQuantity.meters >= 1.8 && effectiveQuantity.meters <= 2.5)) {
        if (minMeters >= 1.8 && minMeters <= 2.5) {
          fabricSuitabilityBonus += 0.25;
          matchReasons.unshift(
            design.style?.toLowerCase().includes('straight')
              ? 'Straight Cut Kurti — Recommended because the fabric has a suitable continuous pattern and standard 2-meter cut'
              : 'A-line Kurti — Recommended because the fabric drape and pattern scale are perfectly suited for standard kurti yardage (~2.2m)'
          );
        } else if (minMeters < 1.8) {
          fabricSuitabilityBonus += 0.15;
          matchReasons.push('Short Kurti — Can easily be tailored from your standard fabric with fabric remaining for matching accents');
        } else {
          // Large Anarkali penalty if yardage is standard
          fabricSuitabilityBonus -= 0.25;
        }
      }

      // LARGE FABRIC PIECE (3.0 - 4.5m):
      else if (quantityCat === 'large' || (effectiveQuantity.meters && effectiveQuantity.meters >= 3.0)) {
        if (minMeters >= 3.0) {
          fabricSuitabilityBonus += 0.30;
          matchReasons.unshift('Flared Anarkali — Recommended because your large fabric cut provides ample yardage for voluminous flares');
        } else {
          fabricSuitabilityBonus += 0.15;
          matchReasons.unshift('Kurti Design — Fully compatible with your generous fabric length');
        }
      }

      // UNKNOWN / UNMEASURED FABRIC:
      else {
        if (minMeters <= 2.2) {
          fabricSuitabilityBonus += 0.15;
          if (design.category === 'short-kurti') {
            matchReasons.unshift('Short Kurti — Recommended because the fabric has a suitable pattern and requires versatile, moderate yardage');
          } else {
            matchReasons.unshift('Straight Cut Kurti — Recommended because the fabric has a suitable pattern and appears appropriate for this garment type');
          }
        }
      }
    } else {
      // Finished garment inspiration
      matchReasons.push('Tailored artisanal kurti silhouette matching your reference');
    }

    // 4. Personalization preferences
    if (preferences) {
      if (preferences.sleeveLength && design.sleeves) {
        if (design.sleeves.toLowerCase().includes(preferences.sleeveLength.toLowerCase())) {
          prefBonus += 0.08;
          matchReasons.push(`Tailored with ${preferences.sleeveLength} sleeves`);
        }
      }
      if (preferences.silhouette && design.silhouette) {
        if (design.silhouette.toLowerCase().includes(preferences.silhouette.toLowerCase())) {
          prefBonus += 0.08;
          matchReasons.push(`Matches your requested ${preferences.silhouette} silhouette`);
        }
      }
      if (preferences.neckline && preferences.neckline !== 'Keep similar to uploaded design') {
        if (design.neckline?.toLowerCase().includes(preferences.neckline.toLowerCase())) {
          prefBonus += 0.06;
          matchReasons.push(`${preferences.neckline} neckline styling`);
        }
      }
    }

    const rawScore =
      0.40 * colorSim +
      0.30 * patternSim +
      0.10 * popSim +
      fabricSuitabilityBonus +
      prefBonus;

    const normalizedPercent = Math.min(99, Math.max(65, Math.round(rawScore * 100)));

    let badge: 'Best Match' | 'Highly Similar' | 'Popular Style' | 'Trending' = 'Popular Style';
    if (normalizedPercent >= 90) badge = 'Best Match';
    else if (normalizedPercent >= 82) badge = 'Highly Similar';
    else if (design.popularityScore >= 93) badge = 'Trending';

    // Ensure at least 2 clear reasons
    if (matchReasons.length < 2) {
      if (design.pattern) matchReasons.push(`Authentic ${design.pattern} craftsmanship`);
      if (design.fabric) matchReasons.push(`Crafted in ${design.fabric}`);
    }

    return {
      ...design,
      matchScore: normalizedPercent,
      matchReasons: Array.from(new Set(matchReasons)).slice(0, 3),
      badge,
    };
  });

  // Apply UI Filters
  let filtered = scoredList.filter((d) => {
    if (filters?.collection && filters.collection !== 'all' && d.collection && d.collection !== filters.collection) return false;
    if (filters?.category && filters.category !== 'all' && d.category !== filters.category) return false;
    if (filters?.pattern && filters.pattern !== 'All' && d.pattern !== filters.pattern) return false;
    if (filters?.color && filters.color !== 'All' && !d.colors.some((c) => c.toLowerCase().includes(filters.color!.toLowerCase()))) return false;
    if (filters?.occasion && filters.occasion !== 'All' && d.occasion !== filters.occasion) return false;
    if (filters?.style && filters.style !== 'All' && d.style !== filters.style && d.silhouette !== filters.style) return false;
    return true;
  });

  // Fallback so user is never given empty result
  if (filtered.length === 0) {
    filtered = filters?.category && filters.category !== 'all'
      ? scoredList.filter((d) => d.category === filters.category)
      : scoredList;
  }

  // Sort
  const sortBy = filters?.sortBy || 'match';
  if (sortBy === 'match') {
    filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else if (sortBy === 'popular') {
    filtered.sort((a, b) => b.popularityScore - a.popularityScore);
  } else if (sortBy === 'trending') {
    filtered.sort((a, b) => (b.popularityScore + (b.matchScore || 0)) - (a.popularityScore + (a.matchScore || 0)));
  }

  return {
    recommendedDesigns: filtered,
    avoidedDesigns,
    isFabricOnly,
    fabricQuantityLabel: effectiveQuantity.label,
  };
}

/**
 * Tailor Ranking Algorithm
 */
export function rankTailorsForDesign(tailors: Tailor[], selectedDesign?: KurtiDesign, maxDistanceKm?: number): Tailor[] {
  let list = [...tailors];

  if (maxDistanceKm) {
    list = list.filter((t) => t.distance <= maxDistanceKm);
  }

  const scored = list.map((tailor) => {
    let specMatch = 0.5;
    const reasons: string[] = [];

    if (selectedDesign) {
      const designKeywords = [
        selectedDesign.fabric,
        selectedDesign.style,
        selectedDesign.silhouette,
        selectedDesign.pattern,
        `${selectedDesign.fabric} Kurtis`,
        `${selectedDesign.style} Kurtis`,
      ].filter(Boolean) as string[];

      const matches = tailor.specializations.filter((s) =>
        designKeywords.some((k) => s.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.toLowerCase()))
      );

      if (matches.length > 0) {
        specMatch = Math.min(1.0, 0.6 + matches.length * 0.2);
        reasons.push(`Specializes in ${matches[0]}`);
      } else {
        specMatch = 0.4;
      }
    } else {
      reasons.push('Expert ethnic kurti craftsman');
    }

    const ratingScore = Math.max(0, (tailor.rating - 3.5) / 1.5);
    reasons.push(`${tailor.rating} ★ rated (${tailor.reviewCount} reviews)`);

    let availScore = 0.5;
    if (tailor.availability === 'Available this week') availScore = 1.0;
    else if (tailor.availability === 'Next week') availScore = 0.7;
    else availScore = 0.3;

    const distScore = Math.max(0, (10 - Math.min(10, tailor.distance)) / 10);
    reasons.push(`${tailor.distance} km away in ${tailor.location.split(',')[0]}`);

    const rawRank =
      0.35 * specMatch +
      0.30 * ratingScore +
      0.20 * availScore +
      0.15 * distScore;

    return {
      ...tailor,
      rankScore: Math.round(rawRank * 100),
      rankReasons: reasons.slice(0, 3),
    };
  });

  return scored.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));
}
