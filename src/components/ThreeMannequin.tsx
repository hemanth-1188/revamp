import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  Palette,
  Compass,
  Camera,
  Layers,
  Sliders,
} from 'lucide-react';
import { KurtiDesign } from '../types';
import { createFabricGarmentMaterial } from '../lib/fabricMaterialEngine';
import { build3DGarmentMesh, resolveGarmentTypeKey, GarmentTypeKey, GarmentAssembly } from './GarmentMeshRegistry';

export interface ThreeMannequinRef {
  takeSnapshot: () => string;
}

interface ThreeMannequinProps {
  design: KurtiDesign;
  fabricImage?: string | null;
  customColor?: string;
  onColorChange?: (colorHex: string) => void;
  activeView?: 'front' | 'back' | 'side' | 'free';
  onViewChange?: (view: 'front' | 'back' | 'side' | 'free') => void;
  onSnapshotTaken?: (imageDataUrl: string) => void;
}

export const ThreeMannequin = forwardRef<ThreeMannequinRef, ThreeMannequinProps>(({
  design,
  fabricImage,
  customColor,
  onColorChange,
  activeView = 'front',
  onViewChange,
  onSnapshotTaken,
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const currentGarmentAssemblyRef = useRef<GarmentAssembly | null>(null);

  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedColor, setSelectedColor] = useState(customColor || design.hexPalette[0] || '#B5563E');
  const [currentAngle, setCurrentAngle] = useState<'front' | 'back' | 'side' | 'free'>(activeView);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [isModelActive, setIsModelActive] = useState(false);

  // Fabric UV Tiling & Texture Controls
  const [textureScale, setTextureScale] = useState<number>(1.0);
  const [textureRotationAngle, setTextureRotationAngle] = useState<number>(0);
  const [showFabricControls, setShowFabricControls] = useState<boolean>(false);

  // Expose takeSnapshot to parent components via ref
  useImperativeHandle(ref, () => ({
    takeSnapshot: () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return '';
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return rendererRef.current.domElement.toDataURL('image/png');
    },
  }));

  // Synchronize when customColor or design changes
  useEffect(() => {
    if (customColor) {
      setSelectedColor(customColor);
    } else if (design.hexPalette[0]) {
      setSelectedColor(design.hexPalette[0]);
    }
  }, [customColor, design]);

  // Handle external or internal view change (Front / Back / Side)
  const setViewAngle = (view: 'front' | 'back' | 'side' | 'free') => {
    setCurrentAngle(view);
    setAutoRotate(false);
    if (onViewChange) onViewChange(view);

    if (!cameraRef.current || !controlsRef.current || !mannequinGroupRef.current) return;

    mannequinGroupRef.current.rotation.y = 0;
    const radius = 3.6;
    const targetY = 0.95;
    controlsRef.current.target.set(0, targetY, 0);

    if (view === 'front') {
      cameraRef.current.position.set(0, 1.45, radius);
    } else if (view === 'back') {
      cameraRef.current.position.set(0, 1.45, -radius);
    } else if (view === 'side') {
      cameraRef.current.position.set(radius, 1.45, 0);
    }
    controlsRef.current.update();
  };

  useEffect(() => {
    if (activeView && activeView !== currentAngle) {
      setViewAngle(activeView as 'front' | 'back' | 'side' | 'free');
    }
  }, [activeView, currentAngle]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfbf7f5);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 3.6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.8;
    controls.minDistance = 1.6;
    controls.maxDistance = 5.5;
    controls.minPolarAngle = Math.PI / 3.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.target.set(0, 0.95, 0);
    controlsRef.current = controls;

    renderer.domElement.style.touchAction = 'none';

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff5ee, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
    keyLight.position.set(2.5, 4.2, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const backKeyLight = new THREE.DirectionalLight(0xffede6, 1.4);
    backKeyLight.position.set(-2, 3.5, -3);
    scene.add(backKeyLight);

    const fillLight = new THREE.DirectionalLight(0xf2c3b9, 0.8);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // Pedestal Platform
    const pedestalGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.1, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xecd7ce,
      roughness: 0.6,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.05, 0);
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Brass rim
    const rimGeo = new THREE.TorusGeometry(0.86, 0.015, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.3,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.0;
    scene.add(rim);

    // Shadow catcher plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.22 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.001;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // MANNEQUIN GROUP
    const mannequinGroup = new THREE.Group();
    mannequinGroupRef.current = mannequinGroup;

    // Matte mannequin porcelain material
    const porcelainMat = new THREE.MeshStandardMaterial({
      color: 0xf5eeea,
      roughness: 0.45,
      metalness: 0.05,
    });

    // 1. Load Universal Porcelain Mannequin
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/sculpting_a_human_body.glb',
      (gltf) => {
        const bodyModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(bodyModel);
        const size = new THREE.Vector3();
        box.getSize(size);

        // Normalize height so it stands gracefully on pedestal (~1.85m)
        const targetHeight = 1.85;
        const scale = targetHeight / (size.y || 1);
        bodyModel.scale.set(scale, scale, scale);

        box.setFromObject(bodyModel);
        const center = new THREE.Vector3();
        box.getCenter(center);

        bodyModel.position.x = -center.x;
        bodyModel.position.z = -center.z;
        bodyModel.position.y = -box.min.y;

        bodyModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.material = porcelainMat;
          }
        });

        mannequinGroup.add(bodyModel);
        setIsLoadingModel(false);
        setIsModelActive(true);
      },
      undefined,
      (error) => {
        console.warn('Could not load sculpted human body model, applying fallback torso:', error);
        setIsLoadingModel(false);
        const fallbackGroup = new THREE.Group();
        const neckGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.18, 24);
        const neck = new THREE.Mesh(neckGeo, porcelainMat);
        neck.position.set(0, 1.72, 0);
        fallbackGroup.add(neck);

        const headGeo = new THREE.SphereGeometry(0.12, 32, 32);
        headGeo.scale(0.85, 1.15, 0.95);
        const head = new THREE.Mesh(headGeo, porcelainMat);
        head.position.set(0, 1.9, 0);
        fallbackGroup.add(head);

        const shoulderGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.22, 32);
        shoulderGeo.scale(1.55, 1, 0.75);
        const shoulders = new THREE.Mesh(shoulderGeo, porcelainMat);
        shoulders.position.set(0, 1.58, 0);
        fallbackGroup.add(shoulders);

        mannequinGroup.add(fallbackGroup);
      }
    );

    // 2. Build and attach the Anatomical 3D Garment Mesh
    const fabricImageUrl = fabricImage || design.designSpecification?.fabricImageUrl || null;
    const resolvedTypeKey: GarmentTypeKey = resolveGarmentTypeKey(
      design.category,
      design.silhouette || design.style,
      design.name
    );

    const garmentMat = createFabricGarmentMaterial({
      fabricImage: fabricImageUrl,
      baseColorHex: selectedColor,
      textureScale,
      textureRotation: textureRotationAngle,
      textureRepeat: 2.8,
      fabricType: (design.fabric || 'cotton').toLowerCase() as any,
    });

    const garmentAssembly = build3DGarmentMesh(resolvedTypeKey, garmentMat);
    currentGarmentAssemblyRef.current = garmentAssembly;
    mannequinGroup.add(garmentAssembly.group);

    scene.add(mannequinGroup);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && mannequinGroupRef.current) {
        mannequinGroupRef.current.rotation.y += 0.008;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    design.id,
    design.category,
    design.style,
    design.silhouette,
    design.neckline,
    design.sleeves,
    fabricImage,
    design.designSpecification?.fabricImageUrl,
    selectedColor,
    textureScale,
    textureRotationAngle,
  ]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (cameraRef.current && controlsRef.current) {
      const zoomFactor = direction === 'in' ? 0.85 : 1.15;
      cameraRef.current.position.multiplyScalar(zoomFactor);
      controlsRef.current.update();
    }
  };

  const handleRotateStep = (degrees: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const rad = (degrees * Math.PI) / 180;
    const x = cameraRef.current.position.x;
    const z = cameraRef.current.position.z;
    cameraRef.current.position.x = x * Math.cos(rad) - z * Math.sin(rad);
    cameraRef.current.position.z = x * Math.sin(rad) + z * Math.cos(rad);
    controlsRef.current.update();
    setCurrentAngle('free');
  };

  const handleSelectColor = (colorHex: string) => {
    setSelectedColor(colorHex);
    if (onColorChange) onColorChange(colorHex);
  };

  const captureGarmentSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    if (onSnapshotTaken) {
      onSnapshotTaken(dataUrl);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[520px] flex flex-col bg-[#FDFAF9] rounded-3xl overflow-hidden border border-[#ECDAD4] shadow-sm">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing relative touch-none select-none"
        title="Click and drag or swipe to rotate 360°, scroll or pinch to zoom"
      />

      {/* Loading Overlay */}
      {isLoadingModel && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none">
          <div className="flex flex-col items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-[#ECDAD4] shadow-md">
            <div className="w-5 h-5 border-2 border-[#B5563E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#2E2926]">Loading 3D Fashion Studio...</span>
          </div>
        </div>
      )}

      {/* Top Left: Quick Camera Presets & Step Rotation */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 z-20">
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-[#ECDAD4] shadow-xs flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewAngle('front')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentAngle === 'front'
                ? 'bg-[#B5563E] text-white shadow-xs'
                : 'text-[#2E2926] hover:bg-[#F2C3B9]/30'
            }`}
          >
            Front
          </button>

          <button
            type="button"
            onClick={() => setViewAngle('back')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentAngle === 'back'
                ? 'bg-[#B5563E] text-white shadow-xs'
                : 'text-[#2E2926] hover:bg-[#F2C3B9]/30'
            }`}
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => setViewAngle('side')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentAngle === 'side'
                ? 'bg-[#B5563E] text-white shadow-xs'
                : 'text-[#2E2926] hover:bg-[#F2C3B9]/30'
            }`}
          >
            Side
          </button>

          <div className="h-4 w-px bg-[#ECDAD4] mx-0.5" />

          <button
            type="button"
            onClick={() => handleRotateStep(-45)}
            className="px-2 py-1.5 rounded-xl text-xs font-semibold text-[#2E2926] hover:bg-[#F2C3B9]/30 transition-colors cursor-pointer"
            title="Rotate Left 45°"
          >
            ← 45°
          </button>

          <button
            type="button"
            onClick={() => handleRotateStep(45)}
            className="px-2 py-1.5 rounded-xl text-xs font-semibold text-[#2E2926] hover:bg-[#F2C3B9]/30 transition-colors cursor-pointer"
            title="Rotate Right 45°"
          >
            45° →
          </button>

          <button
            type="button"
            onClick={() => {
              setAutoRotate(!autoRotate);
              setCurrentAngle('free');
            }}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              autoRotate
                ? 'bg-[#2E2926] text-white border-[#2E2926]'
                : 'bg-white text-[#766B65] border-[#ECDAD4] hover:text-[#2E2926]'
            }`}
            title={autoRotate ? 'Pause 360° Auto-Rotation' : 'Start 360° Auto-Rotation'}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </button>
        </div>
      </div>

      {/* Top Right: Zoom, Fabric Controls, Snapshot */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
        <button
          type="button"
          onClick={() => handleZoom('in')}
          className="p-2.5 rounded-xl bg-white/95 text-[#2E2926] border border-[#ECDAD4] hover:bg-[#F2C3B9]/30 transition-colors shadow-xs cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom('out')}
          className="p-2.5 rounded-xl bg-white/95 text-[#2E2926] border border-[#ECDAD4] hover:bg-[#F2C3B9]/30 transition-colors shadow-xs cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setViewAngle('front')}
          className="p-2.5 rounded-xl bg-white/95 text-[#2E2926] border border-[#ECDAD4] hover:bg-[#F2C3B9]/30 transition-colors shadow-xs cursor-pointer"
          title="Reset Camera"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowFabricControls(!showFabricControls)}
          className={`p-2.5 rounded-xl border transition-colors shadow-xs cursor-pointer ${
            showFabricControls
              ? 'bg-[#B5563E] text-white border-[#B5563E]'
              : 'bg-white/95 text-[#2E2926] border-[#ECDAD4] hover:bg-[#F2C3B9]/30'
          }`}
          title="Fabric UV Texture Controls (Scale & Rotation)"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={captureGarmentSnapshot}
          className="p-2.5 rounded-xl bg-white/95 text-[#B5563E] border border-[#ECDAD4] hover:bg-[#B5563E] hover:text-white transition-colors shadow-xs cursor-pointer"
          title="Capture Studio Snapshot of Garment"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Fabric UV Controls Popover */}
      {showFabricControls && (
        <div className="absolute top-18 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#ECDAD4] shadow-xl z-30 w-64 space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-[#ECDAD4] pb-2">
            <span className="text-xs font-bold text-[#2E2926] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#B5563E]" />
              Fabric Texture Mapping
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#4A433E]">
              <span>Pattern Scale:</span>
              <span className="font-mono">{textureScale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={textureScale}
              onChange={(e) => setTextureScale(parseFloat(e.target.value))}
              className="w-full accent-[#B5563E] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-[#4A433E] block">Grain Orientation:</span>
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Straight (0°)', angle: 0 },
                { label: 'Bias (45°)', angle: Math.PI / 4 },
                { label: 'Cross (90°)', angle: Math.PI / 2 },
              ].map((rot) => (
                <button
                  key={rot.angle}
                  type="button"
                  onClick={() => setTextureRotationAngle(rot.angle)}
                  className={`flex-1 py-1 px-1.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                    textureRotationAngle === rot.angle
                      ? 'bg-[#B5563E] text-white border-[#B5563E]'
                      : 'bg-[#FAF2EE] text-[#4A433E] border-[#ECDAD4]'
                  }`}
                >
                  {rot.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Color Palette Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#ECDAD4] shadow-sm flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#B5563E]" />
          <span className="text-xs font-bold text-[#2E2926] uppercase tracking-wider">Palette:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {design.hexPalette.map((hex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectColor(hex)}
              className={`w-7 h-7 rounded-full transition-all border-2 cursor-pointer ${
                selectedColor.toLowerCase() === hex.toLowerCase()
                  ? 'border-[#B5563E] scale-110 shadow-md ring-2 ring-[#B5563E]/40'
                  : 'border-white hover:scale-105 shadow-2xs'
              }`}
              style={{ backgroundColor: hex }}
              title={`Apply ${design.colors[idx] || hex}`}
            />
          ))}

          {/* Ethnic shade accents */}
          {['#B5563E', '#F2C3B9', '#264653', '#606C38', '#E9C46A', '#6B1724'].map((hex) => {
            if (design.hexPalette.includes(hex)) return null;
            return (
              <button
                key={hex}
                type="button"
                onClick={() => handleSelectColor(hex)}
                className={`w-6 h-6 rounded-full transition-all border-2 cursor-pointer ${
                  selectedColor.toLowerCase() === hex.toLowerCase()
                    ? 'border-[#B5563E] scale-110 shadow-md'
                    : 'border-white/90 hover:scale-105'
                }`}
                style={{ backgroundColor: hex }}
              />
            );
          })}
        </div>

        <div className="text-[11px] text-[#766B65] font-medium hidden md:flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-[#B5563E]" />
          <span>Swipe or drag to inspect 360° fit</span>
        </div>
      </div>
    </div>
  );
});
