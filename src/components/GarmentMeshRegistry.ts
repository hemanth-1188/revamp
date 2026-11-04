import * as THREE from 'three';

export type GarmentTypeKey =
  | 'kurti'
  | 'a-line-kurti'
  | 'straight-kurti'
  | 'anarkali'
  | 'short-kurti'
  | 'blouse'
  | 'gown'
  | 'dress'
  | 'men-shirt'
  | 'men-tshirt'
  | 'men-kurta'
  | 'men-jacket'
  | 'trousers';

export interface GarmentAssembly {
  group: THREE.Group;
  primaryMeshes: THREE.Mesh[];
  sleeveMeshes: THREE.Mesh[];
  accentMeshes: THREE.Mesh[];
}

// Gold metallic accent material for buttons, borders, and piping
const goldAccentMat = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  roughness: 0.28,
  metalness: 0.85,
});

// Shell / pearlescent button material
const buttonMat = new THREE.MeshStandardMaterial({
  color: 0xf5f3ef,
  roughness: 0.35,
  metalness: 0.15,
});

/**
 * Normalizes garment category name or design ID into standard key
 */
export function resolveGarmentTypeKey(
  category?: string,
  silhouette?: string,
  name?: string
): GarmentTypeKey {
  const text = `${category || ''} ${silhouette || ''} ${name || ''}`.toLowerCase();

  if (text.includes('anarkali') || text.includes('flared kurti')) return 'anarkali';
  if (text.includes('short') || text.includes('peplum')) return 'short-kurti';
  if (text.includes('straight')) return 'straight-kurti';
  if (text.includes('blouse') || text.includes('crop')) return 'blouse';
  if (text.includes('gown') || text.includes('evening')) return 'gown';
  if (text.includes('dress')) return 'dress';
  if (text.includes('t-shirt') || text.includes('tshirt')) return 'men-tshirt';
  if (text.includes('shirt')) return 'men-shirt';
  if (text.includes('jacket') || text.includes('bandhgala') || text.includes('nehru')) return 'men-jacket';
  if (text.includes('kurta') && !text.includes('kurti')) return 'men-kurta';
  if (text.includes('trouser') || text.includes('pant')) return 'trousers';
  if (text.includes('a-line') || text.includes('aline')) return 'a-line-kurti';

  // Default to standard A-line kurti
  return 'a-line-kurti';
}

/**
 * Builds high-fidelity 3D garment mesh fitted to the universal porcelain mannequin
 */
export function build3DGarmentMesh(
  typeKey: GarmentTypeKey,
  garmentMat: THREE.Material
): GarmentAssembly {
  const group = new THREE.Group();
  const primaryMeshes: THREE.Mesh[] = [];
  const sleeveMeshes: THREE.Mesh[] = [];
  const accentMeshes: THREE.Mesh[] = [];

  switch (typeKey) {
    case 'a-line-kurti':
    default: {
      // 1. Contoured Torso (Y=1.48 down to Y=1.18, offset Z=0.035)
      const torsoGeo = new THREE.CylinderGeometry(0.19, 0.14, 0.30, 36);
      torsoGeo.scale(1.35, 1.0, 0.95);
      const torso = new THREE.Mesh(torsoGeo, garmentMat);
      torso.position.set(0, 1.33, 0.035);
      torso.castShadow = true;
      group.add(torso);
      primaryMeshes.push(torso);

      // 2. A-line Flared Skirt (Y=1.18 down to Y=0.58)
      const skirtGeo = new THREE.CylinderGeometry(0.14, 0.24, 0.60, 36, 1, true);
      skirtGeo.scale(1.35, 1.0, 0.95);
      const skirt = new THREE.Mesh(skirtGeo, garmentMat);
      skirt.position.set(0, 0.88, 0.028);
      skirt.castShadow = true;
      group.add(skirt);
      primaryMeshes.push(skirt);

      // 3. Three-Quarter Sleeves (X=±0.28, Y=1.39, length 0.26)
      const leftSleeveGeo = new THREE.CylinderGeometry(0.075, 0.062, 0.26, 24);
      const leftSleeve = new THREE.Mesh(leftSleeveGeo, garmentMat);
      leftSleeve.position.set(-0.28, 1.39, 0.038);
      leftSleeve.rotation.z = -0.16;
      leftSleeve.rotation.x = 0.02;
      group.add(leftSleeve);
      sleeveMeshes.push(leftSleeve);

      const rightSleeveGeo = new THREE.CylinderGeometry(0.075, 0.062, 0.26, 24);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, garmentMat);
      rightSleeve.position.set(0.28, 1.39, 0.038);
      rightSleeve.rotation.z = 0.16;
      rightSleeve.rotation.x = 0.02;
      group.add(rightSleeve);
      sleeveMeshes.push(rightSleeve);

      // 4. Neckline Piping & Placket with Buttons
      const neckTrimGeo = new THREE.TorusGeometry(0.10, 0.012, 16, 32);
      const neckTrim = new THREE.Mesh(neckTrimGeo, goldAccentMat);
      neckTrim.rotation.x = Math.PI / 2.2;
      neckTrim.position.set(0, 1.48, 0.048);
      group.add(neckTrim);
      accentMeshes.push(neckTrim);

      const placketGeo = new THREE.BoxGeometry(0.022, 0.22, 0.008);
      const placket = new THREE.Mesh(placketGeo, goldAccentMat);
      placket.position.set(0, 1.36, 0.175);
      group.add(placket);
      accentMeshes.push(placket);

      // Buttons
      for (let i = 0; i < 4; i++) {
        const btnGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16);
        const btn = new THREE.Mesh(btnGeo, buttonMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(0, 1.44 - i * 0.05, 0.180);
        group.add(btn);
        accentMeshes.push(btn);
      }
      break;
    }

    case 'straight-kurti': {
      // 1. Structured Bodice
      const torsoGeo = new THREE.CylinderGeometry(0.19, 0.15, 0.30, 36);
      torsoGeo.scale(1.35, 1.0, 0.95);
      const torso = new THREE.Mesh(torsoGeo, garmentMat);
      torso.position.set(0, 1.33, 0.035);
      group.add(torso);
      primaryMeshes.push(torso);

      // 2. Straight-Cut Skirt (Knee-length Y=0.68 with side slits)
      const skirtGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.50, 36, 1, true);
      skirtGeo.scale(1.35, 1.0, 0.95);
      const skirt = new THREE.Mesh(skirtGeo, garmentMat);
      skirt.position.set(0, 0.93, 0.028);
      group.add(skirt);
      primaryMeshes.push(skirt);

      // 3. Elbow Sleeves
      const leftSleeveGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.20, 24);
      const leftSleeve = new THREE.Mesh(leftSleeveGeo, garmentMat);
      leftSleeve.position.set(-0.28, 1.39, 0.038);
      leftSleeve.rotation.z = -0.16;
      group.add(leftSleeve);
      sleeveMeshes.push(leftSleeve);

      const rightSleeveGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.20, 24);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, garmentMat);
      rightSleeve.position.set(0.28, 1.39, 0.038);
      rightSleeve.rotation.z = 0.16;
      group.add(rightSleeve);
      sleeveMeshes.push(rightSleeve);

      // 4. Mandarin Band Collar
      const collarGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.035, 24, 1, true);
      const collar = new THREE.Mesh(collarGeo, goldAccentMat);
      collar.position.set(0, 1.49, 0.040);
      group.add(collar);
      accentMeshes.push(collar);

      const placketGeo = new THREE.BoxGeometry(0.022, 0.25, 0.008);
      const placket = new THREE.Mesh(placketGeo, goldAccentMat);
      placket.position.set(0, 1.34, 0.175);
      group.add(placket);
      accentMeshes.push(placket);
      break;
    }

    case 'anarkali': {
      // 1. Empire Waist Bodice (cinched higher at Y=1.22)
      const torsoGeo = new THREE.CylinderGeometry(0.19, 0.135, 0.26, 36);
      torsoGeo.scale(1.35, 1.0, 0.95);
      const torso = new THREE.Mesh(torsoGeo, garmentMat);
      torso.position.set(0, 1.35, 0.035);
      group.add(torso);
      primaryMeshes.push(torso);

      // 2. High-Volume Kalidar Anarkali Skirt (cascading down to Y=0.28)
      const anarkaliSkirtGeo = new THREE.CylinderGeometry(0.135, 0.44, 0.94, 48, 1, true);
      anarkaliSkirtGeo.scale(1.42, 1.0, 1.0);
      const anarkaliSkirt = new THREE.Mesh(anarkaliSkirtGeo, garmentMat);
      anarkaliSkirt.position.set(0, 0.75, 0.026);
      group.add(anarkaliSkirt);
      primaryMeshes.push(anarkaliSkirt);

      // 3. Gold Hem Border along bottom edge
      const hemBorderGeo = new THREE.TorusGeometry(0.44, 0.018, 16, 48);
      const hemBorder = new THREE.Mesh(hemBorderGeo, goldAccentMat);
      hemBorder.rotation.x = Math.PI / 2;
      hemBorder.scale.set(1.42, 1.0, 1.0);
      hemBorder.position.set(0, 0.28, 0.026);
      group.add(hemBorder);
      accentMeshes.push(hemBorder);

      // 4. Full-length Fitted Sleeves
      const leftSleeveGeo = new THREE.CylinderGeometry(0.075, 0.052, 0.36, 24);
      const leftSleeve = new THREE.Mesh(leftSleeveGeo, garmentMat);
      leftSleeve.position.set(-0.29, 1.37, 0.038);
      leftSleeve.rotation.z = -0.16;
      group.add(leftSleeve);
      sleeveMeshes.push(leftSleeve);

      const rightSleeveGeo = new THREE.CylinderGeometry(0.075, 0.052, 0.36, 24);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, garmentMat);
      rightSleeve.position.set(0.29, 1.37, 0.038);
      rightSleeve.rotation.z = 0.16;
      group.add(rightSleeve);
      sleeveMeshes.push(rightSleeve);

      // 5. Sweetheart Yoke Trim
      const yokeTrimGeo = new THREE.TorusGeometry(0.11, 0.014, 16, 32);
      const yokeTrim = new THREE.Mesh(yokeTrimGeo, goldAccentMat);
      yokeTrim.rotation.x = Math.PI / 2.2;
      yokeTrim.position.set(0, 1.47, 0.052);
      group.add(yokeTrim);
      accentMeshes.push(yokeTrim);
      break;
    }

    case 'short-kurti': {
      // 1. Hip-Length Peplum / Short Kurti
      const torsoGeo = new THREE.CylinderGeometry(0.19, 0.14, 0.30, 36);
      torsoGeo.scale(1.35, 1.0, 0.95);
      const torso = new THREE.Mesh(torsoGeo, garmentMat);
      torso.position.set(0, 1.33, 0.035);
      group.add(torso);
      primaryMeshes.push(torso);

      // Flared Hip Peplum (Y=1.18 to Y=0.92)
      const peplumGeo = new THREE.CylinderGeometry(0.14, 0.22, 0.26, 36, 1, true);
      peplumGeo.scale(1.35, 1.0, 0.95);
      const peplum = new THREE.Mesh(peplumGeo, garmentMat);
      peplum.position.set(0, 1.05, 0.030);
      group.add(peplum);
      primaryMeshes.push(peplum);

      // Short Cap Sleeves
      const leftSleeveGeo = new THREE.CylinderGeometry(0.075, 0.068, 0.14, 24);
      const leftSleeve = new THREE.Mesh(leftSleeveGeo, garmentMat);
      leftSleeve.position.set(-0.28, 1.41, 0.038);
      leftSleeve.rotation.z = -0.16;
      group.add(leftSleeve);
      sleeveMeshes.push(leftSleeve);

      const rightSleeveGeo = new THREE.CylinderGeometry(0.075, 0.068, 0.14, 24);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, garmentMat);
      rightSleeve.position.set(0.28, 1.41, 0.038);
      rightSleeve.rotation.z = 0.16;
      group.add(rightSleeve);
      sleeveMeshes.push(rightSleeve);
      break;
    }

    case 'blouse': {
      // Cropped Artisanal Blouse / Top (Y=1.48 to Y=1.24)
      const blouseGeo = new THREE.CylinderGeometry(0.19, 0.155, 0.24, 36);
      blouseGeo.scale(1.35, 1.0, 0.95);
      const blouse = new THREE.Mesh(blouseGeo, garmentMat);
      blouse.position.set(0, 1.36, 0.035);
      group.add(blouse);
      primaryMeshes.push(blouse);

      // Waistband Piping
      const bandGeo = new THREE.TorusGeometry(0.155, 0.012, 16, 36);
      const band = new THREE.Mesh(bandGeo, goldAccentMat);
      band.rotation.x = Math.PI / 2;
      band.scale.set(1.35, 1.0, 0.95);
      band.position.set(0, 1.24, 0.035);
      group.add(band);
      accentMeshes.push(band);

      // Elbow Sleeves
      const leftSleeveGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.22, 24);
      const leftSleeve = new THREE.Mesh(leftSleeveGeo, garmentMat);
      leftSleeve.position.set(-0.28, 1.39, 0.038);
      leftSleeve.rotation.z = -0.16;
      group.add(leftSleeve);
      sleeveMeshes.push(leftSleeve);

      const rightSleeveGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.22, 24);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, garmentMat);
      rightSleeve.position.set(0.28, 1.39, 0.038);
      rightSleeve.rotation.z = 0.16;
      group.add(rightSleeve);
      sleeveMeshes.push(rightSleeve);
      break;
    }

    case 'gown':
    case 'dress': {
      // 1. Elegant Corset Bodice
      const torsoGeo = new THREE.CylinderGeometry(0.19, 0.135, 0.30, 36);
      torsoGeo.scale(1.35, 1.0, 0.95);
      const torso = new THREE.Mesh(torsoGeo, garmentMat);
      torso.position.set(0, 1.33, 0.035);
      group.add(torso);
      primaryMeshes.push(torso);

      // 2. Floor-Length Cascading Drape (Y=1.18 to Y=0.10)
      const gownSkirtGeo = new THREE.CylinderGeometry(0.135, 0.42, 1.08, 48, 1, true);
      gownSkirtGeo.scale(1.40, 1.0, 1.0);
      const gownSkirt = new THREE.Mesh(gownSkirtGeo, garmentMat);
      gownSkirt.position.set(0, 0.64, 0.026);
      group.add(gownSkirt);
      primaryMeshes.push(gownSkirt);
      break;
    }

    // -------------------------------------------------------------
    // MEN'S COLLECTION
    // -------------------------------------------------------------
    case 'men-shirt': {
      // 1. Men's Structured Shirt Body (Y=1.49 down to Y=1.02)
      const shirtGeo = new THREE.CylinderGeometry(0.21, 0.18, 0.47, 36);
      shirtGeo.scale(1.36, 1.0, 0.94);
      const shirt = new THREE.Mesh(shirtGeo, garmentMat);
      shirt.position.set(0, 1.25, 0.035);
      group.add(shirt);
      primaryMeshes.push(shirt);

      // 2. Structured Turned-Down Collar
      const collarOuterGeo = new THREE.CylinderGeometry(0.088, 0.098, 0.045, 32, 1, true);
      const collarOuter = new THREE.Mesh(collarOuterGeo, garmentMat);
      collarOuter.position.set(0, 1.485, 0.038);
      group.add(collarOuter);
      accentMeshes.push(collarOuter);

      // 3. Front Button Placket
      const placketGeo = new THREE.BoxGeometry(0.025, 0.45, 0.008);
      const placket = new THREE.Mesh(placketGeo, garmentMat);
      placket.position.set(0, 1.25, 0.182);
      group.add(placket);
      accentMeshes.push(placket);

      // 6 Pearl Buttons down center
      for (let i = 0; i < 6; i++) {
        const btnGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16);
        const btn = new THREE.Mesh(btnGeo, buttonMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(0, 1.44 - i * 0.07, 0.188);
        group.add(btn);
        accentMeshes.push(btn);
      }

      // 4. Chest Welt Pocket on left
      const pocketGeo = new THREE.BoxGeometry(0.055, 0.065, 0.006);
      const pocket = new THREE.Mesh(pocketGeo, garmentMat);
      pocket.position.set(-0.11, 1.34, 0.178);
      group.add(pocket);
      accentMeshes.push(pocket);

      // 5. Cuffed Long Sleeves
      const leftSleeveGeo = new THREE.CylinderGeometry(0.078, 0.065, 0.35, 24);
      const leftSleeve = new THREE.Mesh(leftSleeveGeo, garmentMat);
      leftSleeve.position.set(-0.29, 1.37, 0.038);
      leftSleeve.rotation.z = -0.16;
      group.add(leftSleeve);
      sleeveMeshes.push(leftSleeve);

      const rightSleeveGeo = new THREE.CylinderGeometry(0.078, 0.065, 0.35, 24);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, garmentMat);
      rightSleeve.position.set(0.29, 1.37, 0.038);
      rightSleeve.rotation.z = 0.16;
      group.add(rightSleeve);
      sleeveMeshes.push(rightSleeve);
      break;
    }

    case 'men-tshirt': {
      // 1. Casual T-Shirt Torso
      const tshirtGeo = new THREE.CylinderGeometry(0.20, 0.175, 0.44, 36);
      tshirtGeo.scale(1.36, 1.0, 0.94);
      const tshirt = new THREE.Mesh(tshirtGeo, garmentMat);
      tshirt.position.set(0, 1.26, 0.035);
      group.add(tshirt);
      primaryMeshes.push(tshirt);

      // 2. Ribbed Crew Neckline
      const crewNeckGeo = new THREE.TorusGeometry(0.095, 0.012, 16, 32);
      const crewNeck = new THREE.Mesh(crewNeckGeo, garmentMat);
      crewNeck.rotation.x = Math.PI / 2.2;
      crewNeck.position.set(0, 1.48, 0.045);
      group.add(crewNeck);
      accentMeshes.push(crewNeck);

      // 3. Short Hemmed Sleeves
      const leftSleeveGeo = new THREE.CylinderGeometry(0.078, 0.070, 0.16, 24);
      const leftSleeve = new THREE.Mesh(leftSleeveGeo, garmentMat);
      leftSleeve.position.set(-0.28, 1.40, 0.038);
      leftSleeve.rotation.z = -0.16;
      group.add(leftSleeve);
      sleeveMeshes.push(leftSleeve);

      const rightSleeveGeo = new THREE.CylinderGeometry(0.078, 0.070, 0.16, 24);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, garmentMat);
      rightSleeve.position.set(0.28, 1.40, 0.038);
      rightSleeve.rotation.z = 0.16;
      group.add(rightSleeve);
      sleeveMeshes.push(rightSleeve);
      break;
    }

    case 'men-kurta': {
      // 1. Traditional Men's Kurta Body (Knee-length Y=0.65 with side slits)
      const kurtaGeo = new THREE.CylinderGeometry(0.21, 0.20, 0.82, 36);
      kurtaGeo.scale(1.36, 1.0, 0.94);
      const kurta = new THREE.Mesh(kurtaGeo, garmentMat);
      kurta.position.set(0, 1.06, 0.032);
      group.add(kurta);
      primaryMeshes.push(kurta);

      // 2. Mandarin Collar
      const collarGeo = new THREE.CylinderGeometry(0.084, 0.084, 0.038, 24, 1, true);
      const collar = new THREE.Mesh(collarGeo, goldAccentMat);
      collar.position.set(0, 1.49, 0.040);
      group.add(collar);
      accentMeshes.push(collar);

      // 3. Chest Placket
      const placketGeo = new THREE.BoxGeometry(0.024, 0.28, 0.008);
      const placket = new THREE.Mesh(placketGeo, goldAccentMat);
      placket.position.set(0, 1.34, 0.180);
      group.add(placket);
      accentMeshes.push(placket);

      // 4. Long Sleeves
      const leftSleeveGeo = new THREE.CylinderGeometry(0.078, 0.062, 0.36, 24);
      const leftSleeve = new THREE.Mesh(leftSleeveGeo, garmentMat);
      leftSleeve.position.set(-0.29, 1.37, 0.038);
      leftSleeve.rotation.z = -0.16;
      group.add(leftSleeve);
      sleeveMeshes.push(leftSleeve);

      const rightSleeveGeo = new THREE.CylinderGeometry(0.078, 0.062, 0.36, 24);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, garmentMat);
      rightSleeve.position.set(0.29, 1.37, 0.038);
      rightSleeve.rotation.z = 0.16;
      group.add(rightSleeve);
      sleeveMeshes.push(rightSleeve);
      break;
    }

    case 'men-jacket': {
      // Nehru / Bandhgala Sleeveless Vest (worn over upper torso down to Y=1.05)
      const jacketGeo = new THREE.CylinderGeometry(0.215, 0.185, 0.44, 36);
      jacketGeo.scale(1.38, 1.0, 0.96);
      const jacket = new THREE.Mesh(jacketGeo, garmentMat);
      jacket.position.set(0, 1.26, 0.036);
      group.add(jacket);
      primaryMeshes.push(jacket);

      // Mandarin Stand Collar
      const collarGeo = new THREE.CylinderGeometry(0.086, 0.086, 0.040, 24, 1, true);
      const collar = new THREE.Mesh(collarGeo, goldAccentMat);
      collar.position.set(0, 1.495, 0.040);
      group.add(collar);
      accentMeshes.push(collar);

      // Front Button Row with 5 Brass Buttons
      const placketGeo = new THREE.BoxGeometry(0.024, 0.42, 0.008);
      const placket = new THREE.Mesh(placketGeo, goldAccentMat);
      placket.position.set(0, 1.26, 0.186);
      group.add(placket);
      accentMeshes.push(placket);

      for (let i = 0; i < 5; i++) {
        const btnGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.005, 16);
        const btn = new THREE.Mesh(btnGeo, goldAccentMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(0, 1.44 - i * 0.08, 0.192);
        group.add(btn);
        accentMeshes.push(btn);
      }

      // Breast Pocket with Pocket Square
      const pocketGeo = new THREE.BoxGeometry(0.05, 0.04, 0.006);
      const pocket = new THREE.Mesh(pocketGeo, goldAccentMat);
      pocket.position.set(-0.11, 1.36, 0.182);
      group.add(pocket);
      accentMeshes.push(pocket);
      break;
    }

    case 'trousers': {
      // Left and Right Tailored Legs (Y=1.15 down to Y=0.18)
      const leftLegGeo = new THREE.CylinderGeometry(0.10, 0.075, 0.98, 24);
      const leftLeg = new THREE.Mesh(leftLegGeo, garmentMat);
      leftLeg.position.set(-0.10, 0.65, 0.015);
      group.add(leftLeg);
      primaryMeshes.push(leftLeg);

      const rightLegGeo = new THREE.CylinderGeometry(0.10, 0.075, 0.98, 24);
      const rightLeg = new THREE.Mesh(rightLegGeo, garmentMat);
      rightLeg.position.set(0.10, 0.65, 0.015);
      group.add(rightLeg);
      primaryMeshes.push(rightLeg);

      // Waistband
      const waistGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 32);
      waistGeo.scale(1.30, 1.0, 0.92);
      const waist = new THREE.Mesh(waistGeo, garmentMat);
      waist.position.set(0, 1.14, 0.025);
      group.add(waist);
      primaryMeshes.push(waist);
      break;
    }
  }

  return {
    group,
    primaryMeshes,
    sleeveMeshes,
    accentMeshes,
  };
}

