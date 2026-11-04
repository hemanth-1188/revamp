import { DesignSpecification, KurtiDesign, AIAnalysisResult } from '../types';

/**
 * Extracts and synthesizes the complete structured design specification
 * combining the selected recommendation and uploaded fabric characteristics.
 */
export function buildStructuredDesignSpecification(
  design: KurtiDesign,
  analysis: AIAnalysisResult | null,
  uploadedImage?: string | null
): DesignSpecification {
  // If design already carries a specification, use it and ensure latest fabric reference
  if (design.designSpecification) {
    return {
      ...design.designSpecification,
      fabricImageUrl: uploadedImage || design.designSpecification.fabricImageUrl,
    };
  }

  // Extract from analysis
  const primaryColorName =
    analysis?.dominantColors?.[0]?.name ||
    design.colors?.[0] ||
    'Royal Blue';

  const primaryColorHex =
    analysis?.dominantColors?.[0]?.hex ||
    design.hexPalette?.[0] ||
    '#1E3A8A';

  const secondaryColorNames =
    analysis?.dominantColors?.slice(1).map((c) => c.name) ||
    design.colors?.slice(1) ||
    [];

  const secondaryColorHexes =
    analysis?.dominantColors?.slice(1).map((c) => c.hex) ||
    design.hexPalette?.slice(1) ||
    [];

  const patternName = analysis?.pattern || design.pattern || 'Floral';

  const isShortKurti =
    design.category === 'short-kurti' ||
    design.length?.toLowerCase().includes('short') ||
    design.length?.toLowerCase().includes('hip') ||
    design.name.toLowerCase().includes('short');

  const garmentType: 'Kurti' | 'Short Kurti' = isShortKurti ? 'Short Kurti' : 'Kurti';

  const fabricCharacteristics =
    analysis?.apparentCharacteristics?.drape ||
    `${analysis?.materialIdentified || analysis?.likelyFabric || design.fabric || 'Cotton'} with ${patternName} weave texture and ${analysis?.borderDetails || 'artisan print'}`;

  const silhouette = design.style || design.silhouette || (isShortKurti ? 'A-line' : 'Straight Cut');
  const neckline = design.neckline || 'Mandarin Collar with V-Slit';
  const sleeveStyle = design.sleeves || 'Three-Quarter Sleeves';
  const length = isShortKurti ? 'Hip Length (28–30")' : 'Calf Length (44–46")';

  const designDetails =
    design.specialInstructions ||
    `${neckline}, ${sleeveStyle}, ${silhouette} tailoring with side slits and subtle gold border accents`;

  return {
    garmentType,
    silhouette,
    primaryColor: primaryColorName,
    primaryColorHex,
    secondaryColors: secondaryColorNames,
    secondaryHexes: secondaryColorHexes,
    pattern: patternName,
    neckline,
    sleeveStyle,
    length,
    fabricCharacteristics,
    designDetails,
    fabricImageUrl: uploadedImage || undefined,
    sourceOfTruth: analysis?.inputType === 'finished_garment' ? 'finished_garment_reference' : 'uploaded_fabric',
  };
}

/**
 * Builds the strict, deterministic image generation prompt required for AI visualization.
 * Incorporates all 10 explicit negative & positive rules from the specification.
 */
export function buildMannequinGenerationPrompt(spec: DesignSpecification): string {
  return `Photorealistic studio mannequin visualization of an ethnic South Asian garment on a neutral tailored boutique dress form.

CRITICAL DESIGN SPECIFICATIONS (USER SELECTED DESIGN):
- Garment Type: ${spec.garmentType} (${spec.garmentType === 'Short Kurti' ? 'Ends at upper hip/thigh, revealing mannequin stand and lower legs' : 'Calf-length ethnic tunic with side slits'})
- Silhouette: ${spec.silhouette}
- Primary Colour: ${spec.primaryColor} (${spec.primaryColorHex}) based exactly on uploaded fabric
- Pattern/Print: ${spec.pattern} based exactly on uploaded fabric appearance
- Neckline: ${spec.neckline}
- Sleeve Style: ${spec.sleeveStyle}
- Garment Length: ${spec.length}
- Fabric Characteristics: ${spec.fabricCharacteristics}
- Design Details: ${spec.designDetails}

MANDATORY RULES & RESTRICTIONS:
1. The garment type MUST match the selected recommendation (${spec.garmentType}).
2. The silhouette MUST match the selected recommendation (${spec.silhouette}).
3. The colour MUST match the uploaded fabric (${spec.primaryColor}, ${spec.primaryColorHex}).
4. The pattern MUST match the uploaded fabric (${spec.pattern}).
5. The garment length MUST match the selected recommendation (${spec.length}).
6. Neckline and sleeve style MUST match the selected recommendation (${spec.neckline}, ${spec.sleeveStyle}).
7. Do NOT substitute another garment.
8. Do NOT generate a saree, gown, dress, or unrelated outfit.
9. Do NOT randomly change the colour or pattern.
10. Do NOT invent a different design.

Style: Clean editorial luxury tailoring studio, warm neutral background, soft directional lighting, premium dressmaker mannequin bust.`;
}
