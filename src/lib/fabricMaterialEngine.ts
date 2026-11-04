import * as THREE from 'three';

export interface FabricMaterialOptions {
  fabricImage?: string | null;
  baseColorHex?: string;
  textureScale?: number;
  textureRotation?: number;
  textureRepeat?: number;
  fabricType?: 'cotton' | 'silk' | 'linen' | 'georgette' | 'brocade';
  roughness?: number;
  metalness?: number;
}

// Memory cache for generated procedural fabric textures and normal maps
const normalMapCache = new Map<string, THREE.CanvasTexture>();

/**
 * Procedural normal map generator for fabric micro-weaves
 * Simulates real textile weave patterns (slub, cross-thread, silk grain)
 */
function getFabricWeaveNormalMap(type: string = 'cotton'): THREE.CanvasTexture {
  if (normalMapCache.has(type)) {
    return normalMapCache.get(type)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Neutral normal map base: RGB(128, 128, 255) -> pointing straight out along Z
    ctx.fillStyle = 'rgb(128, 128, 255)';
    ctx.fillRect(0, 0, 256, 256);

    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;

    const step = type === 'linen' ? 6 : type === 'silk' ? 2 : 4;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const idx = (y * 256 + x) * 4;
        const warp = Math.sin((x / step) * Math.PI);
        const weft = Math.sin((y / step) * Math.PI);
        const perturbation = warp * weft * (type === 'linen' ? 24 : type === 'silk' ? 8 : 16);

        data[idx] = Math.min(255, Math.max(0, 128 + perturbation));     // Red (X normal)
        data[idx + 1] = Math.min(255, Math.max(0, 128 + perturbation)); // Green (Y normal)
        data[idx + 2] = 255; // Blue (Z normal)
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  normalMapCache.set(type, texture);
  return texture;
}

/**
 * Creates a photorealistic PBR material for garments with UV-mapped fabric
 */
export function createFabricGarmentMaterial(options: FabricMaterialOptions): THREE.MeshStandardMaterial {
  const {
    fabricImage,
    baseColorHex = '#B5563E',
    textureScale = 1.0,
    textureRotation = 0,
    textureRepeat = 3.0,
    fabricType = 'cotton',
  } = options;

  let fabricTexture: THREE.Texture | null = null;

  if (fabricImage) {
    const loader = new THREE.TextureLoader();
    fabricTexture = loader.load(fabricImage, (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(textureRepeat * textureScale, textureRepeat * textureScale);
      tex.rotation = textureRotation;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    });
    fabricTexture.wrapS = THREE.RepeatWrapping;
    fabricTexture.wrapT = THREE.RepeatWrapping;
    fabricTexture.repeat.set(textureRepeat * textureScale, textureRepeat * textureScale);
    fabricTexture.rotation = textureRotation;
    fabricTexture.colorSpace = THREE.SRGBColorSpace;
  }

  // PBR parameters based on textile science
  let roughness = 0.78;
  let metalness = 0.04;

  if (fabricType === 'silk' || fabricType === 'brocade') {
    roughness = 0.38;
    metalness = 0.12;
  } else if (fabricType === 'linen') {
    roughness = 0.88;
    metalness = 0.02;
  } else if (fabricType === 'georgette') {
    roughness = 0.65;
    metalness = 0.03;
  }

  const normalMap = getFabricWeaveNormalMap(fabricType);

  const material = new THREE.MeshStandardMaterial({
    color: fabricImage ? (baseColorHex && baseColorHex !== '#ffffff' ? new THREE.Color(baseColorHex) : 0xffffff) : new THREE.Color(baseColorHex),
    map: fabricTexture,
    normalMap,
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness,
    metalness,
    side: THREE.DoubleSide,
    wireframe: false,
  });

  return material;
}

