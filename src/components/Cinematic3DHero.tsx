import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Layers,
  Compass,
  Maximize2,
  Play,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Building2,
  Phone,
  ArrowRight,
  HardHat,
  Eye,
  CheckCircle2,
  Box
} from 'lucide-react';

interface Cinematic3DHeroProps {
  onExploreProperties: () => void;
  onOpenMatcher: () => void;
  onOpenChat: () => void;
  onOpenViewing: () => void;
}

type ViewMode = 'architectural' | 'wireframe' | 'cadastral';

export const Cinematic3DHero: React.FC<Cinematic3DHeroProps> = ({
  onExploreProperties,
  onOpenMatcher,
  onOpenChat,
  onOpenViewing,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('architectural');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activePreset, setActivePreset] = useState<'facade' | 'aerial' | 'survey'>('facade');

  // Animation & Three.js state references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const duplexGroupRef = useRef<THREE.Group | null>(null);
  const wireframeGroupRef = useRef<THREE.Group | null>(null);
  const beaconsGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const reqAnimIdRef = useRef<number | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.0025 });
  const targetCameraPosRef = useRef(new THREE.Vector3(14, 9, 16));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene with Architectural Grey background
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x181a20);
    scene.fog = new THREE.FogExp2(0x181a20, 0.024);

    // 2. Camera setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.copy(targetCameraPosRef.current);
    camera.lookAt(0, 2.5, 0);
    cameraRef.current = camera;

    // 3. Renderer with ACESFilmicToneMapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Studio & Architectural Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(16, 22, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    scene.add(sunLight);

    // Soft sky rim light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-14, 12, -14);
    scene.add(rimLight);

    // Ground point bounce light
    const bounceLight = new THREE.PointLight(0x2563eb, 0.9, 30);
    bounceLight.position.set(0, 0.5, 0);
    scene.add(bounceLight);

    // 5. Cadastral Survey Laser Ground Grid
    const grid = new THREE.GridHelper(36, 36, 0x38bdf8, 0x273142);
    grid.position.y = -0.02;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Foundation Base Paving Slab
    const slabGeo = new THREE.BoxGeometry(18, 0.35, 18);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      roughness: 0.85,
      metalness: 0.1,
    });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.y = -0.17;
    slabMesh.receiveShadow = true;
    scene.add(slabMesh);

    // 6. PROCEDURAL 3D CONTEMPORARY EXECUTIVE DUPLEX
    const duplexGroup = new THREE.Group();
    duplexGroupRef.current = duplexGroup;
    scene.add(duplexGroup);

    // Materials Palette
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.45,
      metalness: 0.05,
    });
    const darkAccentMat = new THREE.MeshStandardMaterial({
      color: 0x28303d,
      roughness: 0.5,
      metalness: 0.2,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.65,
      ior: 1.5,
    });
    const warmInteriorMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    });
    const royalBlueMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.4,
    });

    // Floor 1 (Ground Floor Main Salon)
    const groundFloorGeo = new THREE.BoxGeometry(8.5, 3.2, 7.5);
    const groundFloorMesh = new THREE.Mesh(groundFloorGeo, concreteMat);
    groundFloorMesh.position.set(0, 1.6, 0);
    groundFloorMesh.castShadow = true;
    groundFloorMesh.receiveShadow = true;
    duplexGroup.add(groundFloorMesh);

    // Large Ground Floor Curtain Glazing
    const frontGlassGeo = new THREE.BoxGeometry(6.5, 2.5, 0.2);
    const frontGlassMesh = new THREE.Mesh(frontGlassGeo, glassMat);
    frontGlassMesh.position.set(0, 1.6, 3.8);
    duplexGroup.add(frontGlassMesh);

    // Ground Floor Mullions / Window Frame
    const frameGeo = new THREE.BoxGeometry(6.6, 2.6, 0.22);
    const frameEdges = new THREE.EdgesGeometry(frameGeo);
    const frameLine = new THREE.LineSegments(frameEdges, new THREE.LineBasicMaterial({ color: 0x1e222b, linewidth: 2 }));
    frameLine.position.set(0, 1.6, 3.8);
    duplexGroup.add(frameLine);

    // Floor 2 (Upper Cantilever Suite - Modern Asymmetric Offset)
    const upperFloorGeo = new THREE.BoxGeometry(9.2, 3.0, 8.2);
    const upperFloorMesh = new THREE.Mesh(upperFloorGeo, darkAccentMat);
    upperFloorMesh.position.set(0.6, 4.6, 0.4);
    upperFloorMesh.castShadow = true;
    upperFloorMesh.receiveShadow = true;
    duplexGroup.add(upperFloorMesh);

    // Upper Cantilever Balcony Deck
    const balconyDeckGeo = new THREE.BoxGeometry(5.0, 0.25, 2.2);
    const balconyDeckMesh = new THREE.Mesh(balconyDeckGeo, royalBlueMat);
    balconyDeckMesh.position.set(1.5, 3.2, 4.7);
    balconyDeckMesh.castShadow = true;
    duplexGroup.add(balconyDeckMesh);

    // Balcony Glass Railing
    const balconyGlassGeo = new THREE.BoxGeometry(4.9, 1.0, 0.08);
    const balconyGlassMesh = new THREE.Mesh(balconyGlassGeo, glassMat);
    balconyGlassMesh.position.set(1.5, 3.8, 5.75);
    duplexGroup.add(balconyGlassMesh);

    // Upper Master Bedroom Glass Corner Wall
    const cornerGlassGeo = new THREE.BoxGeometry(4.0, 2.3, 0.2);
    const cornerGlassMesh = new THREE.Mesh(cornerGlassGeo, glassMat);
    cornerGlassMesh.position.set(2.0, 4.7, 4.52);
    duplexGroup.add(cornerGlassMesh);

    // Architectural Roof Parapet Flat Slab
    const roofSlabGeo = new THREE.BoxGeometry(10.2, 0.35, 9.2);
    const roofSlabMesh = new THREE.Mesh(roofSlabGeo, concreteMat);
    roofSlabMesh.position.set(0.6, 6.25, 0.4);
    roofSlabMesh.castShadow = true;
    duplexGroup.add(roofSlabMesh);

    // Rooftop Solar Array Panels (Green Energy / Engineering Touch)
    const solarGeo = new THREE.BoxGeometry(3.5, 0.1, 2.5);
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.2 });
    const solarMesh = new THREE.Mesh(solarGeo, solarMat);
    solarMesh.position.set(-1.5, 6.5, -0.5);
    solarMesh.rotation.x = 0.2;
    duplexGroup.add(solarMesh);

    // Civil Engineering Structural Support Columns
    const columnGeo = new THREE.CylinderGeometry(0.22, 0.22, 3.2, 16);
    const col1 = new THREE.Mesh(columnGeo, concreteMat);
    col1.position.set(3.8, 1.6, 4.5);
    col1.castShadow = true;
    duplexGroup.add(col1);

    const col2 = new THREE.Mesh(columnGeo, concreteMat);
    col2.position.set(-0.8, 1.6, 4.5);
    col2.castShadow = true;
    duplexGroup.add(col2);

    // Interior Warm Ambient Lights (Simulating Occupancy)
    const interiorLight1 = new THREE.PointLight(0xfef08a, 1.5, 6);
    interiorLight1.position.set(0, 1.8, 2.5);
    duplexGroup.add(interiorLight1);

    const interiorLight2 = new THREE.PointLight(0x38bdf8, 1.2, 6);
    interiorLight2.position.set(1.5, 4.5, 2.5);
    duplexGroup.add(interiorLight2);

    // 7. CADASTRAL BEACONS & PROPERTY BOUNDARIES
    const beaconsGroup = new THREE.Group();
    beaconsGroupRef.current = beaconsGroup;
    scene.add(beaconsGroup);

    const beaconCoords = [
      { x: -7.5, z: -7.5, label: 'BEACON OC-01 (NW)' },
      { x: 7.5, z: -7.5, label: 'BEACON OC-02 (NE)' },
      { x: 7.5, z: 7.5, label: 'BEACON OC-03 (SE)' },
      { x: -7.5, z: 7.5, label: 'BEACON OC-04 (SW)' },
    ];

    const beaconGeo = new THREE.CylinderGeometry(0.18, 0.25, 1.4, 8);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.3,
    });

    const boundaryPoints: THREE.Vector3[] = [];

    beaconCoords.forEach((b) => {
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.set(b.x, 0.7, b.z);
      beaconMesh.castShadow = true;
      beaconsGroup.add(beaconMesh);

      // Top glowing beacon cap
      const capGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const capMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.set(b.x, 1.5, b.z);
      beaconsGroup.add(capMesh);

      // Vertical Laser Line shooting upwards
      const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 8, 8);
      const laserMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
      const laserMesh = new THREE.Mesh(laserGeo, laserMat);
      laserMesh.position.set(b.x, 5, b.z);
      beaconsGroup.add(laserMesh);

      boundaryPoints.push(new THREE.Vector3(b.x, 0.1, b.z));
    });
    boundaryPoints.push(boundaryPoints[0]); // Close perimeter

    // Glowing cadastral plot boundary line
    const boundaryGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const boundaryLine = new THREE.Line(
      boundaryGeo,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
    );
    beaconsGroup.add(boundaryLine);

    // 8. STRUCTURAL WIREFRAME CAD MODEL
    const wireframeGroup = new THREE.Group();
    wireframeGroupRef.current = wireframeGroup;
    scene.add(wireframeGroup);

    // Create wireframe edges for the building components
    [groundFloorGeo, upperFloorGeo, roofSlabGeo, balconyDeckGeo].forEach((geo, idx) => {
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 1.5, transparent: true, opacity: 0.85 })
      );
      if (idx === 0) line.position.set(0, 1.6, 0);
      if (idx === 1) line.position.set(0.6, 4.6, 0.4);
      if (idx === 2) line.position.set(0.6, 6.25, 0.4);
      if (idx === 3) line.position.set(1.5, 3.2, 4.7);
      wireframeGroup.add(line);
    });

    // Wireframe initially hidden unless toggled
    wireframeGroup.visible = false;

    // 9. AMBIENT GEOSPATIAL DUST PARTICLES
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 32;
      particlePositions[i + 1] = Math.random() * 14;
      particlePositions[i + 2] = (Math.random() - 0.5) * 32;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 10. Mouse Interaction Handlers (Orbit & Drag)
    const dom = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      if (duplexGroupRef.current) {
        duplexGroupRef.current.rotation.y += deltaX * 0.007;
      }
      if (wireframeGroupRef.current) {
        wireframeGroupRef.current.rotation.y += deltaX * 0.007;
      }
      if (beaconsGroupRef.current) {
        beaconsGroupRef.current.rotation.y += deltaX * 0.007;
      }

      // Camera elevation tilt
      camera.position.y = Math.max(3, Math.min(18, camera.position.y - deltaY * 0.04));
      camera.lookAt(0, 2.5, 0);

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.012;
      const currentDist = camera.position.length();
      if ((currentDist > 8 && zoomFactor < 0) || (currentDist < 35 && zoomFactor > 0)) {
        camera.position.multiplyScalar(1 + zoomFactor * 0.08);
        camera.lookAt(0, 2.5, 0);
      }
    };

    // Touch handlers for mobile
    let touchStartX = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        isDraggingRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - touchStartX;
      if (duplexGroupRef.current) {
        duplexGroupRef.current.rotation.y += deltaX * 0.007;
      }
      if (wireframeGroupRef.current) {
        wireframeGroupRef.current.rotation.y += deltaX * 0.007;
      }
      if (beaconsGroupRef.current) {
        beaconsGroupRef.current.rotation.y += deltaX * 0.007;
      }
      touchStartX = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart);
    dom.addEventListener('touchmove', onTouchMove);
    dom.addEventListener('touchend', onTouchEnd);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 11. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqAnimIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation toward target preset
      camera.position.lerp(targetCameraPosRef.current, 0.04);
      camera.lookAt(0, 2.5, 0);

      // Auto rotation
      if (isAutoRotating && !isDraggingRef.current) {
        if (duplexGroupRef.current) duplexGroupRef.current.rotation.y += 0.003;
        if (wireframeGroupRef.current) wireframeGroupRef.current.rotation.y += 0.003;
        if (beaconsGroupRef.current) beaconsGroupRef.current.rotation.y += 0.003;
      }

      // Gentle floating animation of particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posAttr.array[i] += Math.sin(elapsedTime * 0.6 + i) * 0.003;
      }
      posAttr.needsUpdate = true;

      // Pulse beacon glow
      if (beaconsGroupRef.current) {
        beaconsGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Line) {
            (child.material as THREE.LineBasicMaterial).opacity = 0.6 + Math.sin(elapsedTime * 3) * 0.3;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup on Unmount
    return () => {
      if (reqAnimIdRef.current) cancelAnimationFrame(reqAnimIdRef.current);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);

      // Dispose Three.js objects
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [isAutoRotating]);

  // Update view mode display
  useEffect(() => {
    if (!duplexGroupRef.current || !wireframeGroupRef.current || !beaconsGroupRef.current) return;

    if (viewMode === 'architectural') {
      duplexGroupRef.current.visible = true;
      wireframeGroupRef.current.visible = false;
      beaconsGroupRef.current.visible = true;
    } else if (viewMode === 'wireframe') {
      duplexGroupRef.current.visible = false;
      wireframeGroupRef.current.visible = true;
      beaconsGroupRef.current.visible = true;
    } else if (viewMode === 'cadastral') {
      duplexGroupRef.current.visible = true;
      wireframeGroupRef.current.visible = false;
      beaconsGroupRef.current.visible = true;
    }
  }, [viewMode]);

  // Preset view positions
  const setCameraPreset = (preset: 'facade' | 'aerial' | 'survey') => {
    setActivePreset(preset);
    if (preset === 'facade') {
      targetCameraPosRef.current.set(13, 7, 15);
    } else if (preset === 'aerial') {
      targetCameraPosRef.current.set(0.1, 24, 0.1);
    } else if (preset === 'survey') {
      targetCameraPosRef.current.set(17, 12, 17);
    }
  };

  const resetRotation = () => {
    if (duplexGroupRef.current) duplexGroupRef.current.rotation.y = 0;
    if (wireframeGroupRef.current) wireframeGroupRef.current.rotation.y = 0;
    if (beaconsGroupRef.current) beaconsGroupRef.current.rotation.y = 0;
    setCameraPreset('facade');
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between bg-[#181a20] overflow-hidden border-b border-slate-700/60">
      {/* Three.js Interactive 3D Canvas Layer */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        title="Click and drag to rotate the 3D duplex model. Scroll to zoom."
      />

      {/* Cinematic Ambient Radial & Gradient Scrims in Architectural Slate Grey (No Pure Black) */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-t from-[#181a20] via-transparent to-[#181a20]/60" />
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-r from-[#181a20]/95 via-[#181a20]/60 to-transparent max-w-3xl" />

      {/* Top Floating 3D Control Bar in Architectural Grey */}
      <div className="absolute top-6 right-6 z-20 flex flex-wrap items-center gap-2">
        {/* View Mode Pill Selector */}
        <div className="bg-[#222630]/90 border border-slate-700 backdrop-blur-md rounded-xl p-1 flex items-center shadow-lg">
          <button
            onClick={() => setViewMode('architectural')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'architectural'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Render Solid Architectural Materials"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Architecture</span>
          </button>

          <button
            onClick={() => setViewMode('wireframe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'wireframe'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="CAD Structural Engineering Wireframe"
          >
            <Box className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">CAD Wireframe</span>
          </button>

          <button
            onClick={() => setViewMode('cadastral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cadastral'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Cadastral Survey Beacons & Boundary Lines"
          >
            <Compass className="w-3.5 h-3.5 text-[#4ade80]" />
            <span className="hidden sm:inline">Survey Grid</span>
          </button>
        </div>

        {/* Camera Preset Quick Buttons */}
        <div className="hidden md:flex items-center gap-1 bg-[#222630]/90 border border-slate-700 backdrop-blur-md rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setCameraPreset('facade')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'facade' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Facade
          </button>
          <button
            onClick={() => setCameraPreset('aerial')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'aerial' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top-Down Plot
          </button>
          <button
            onClick={() => setCameraPreset('survey')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'survey' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Isometric
          </button>
        </div>

        {/* Rotation & Reset Actions */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-md ${
            isAutoRotating
              ? 'bg-[#222630] border-[#38bdf8]/60 text-[#38bdf8]'
              : 'bg-[#222630] border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={isAutoRotating ? 'Pause 3D Orbit' : 'Resume 3D Auto-Orbit'}
        >
          <RotateCcw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        </button>

        <button
          onClick={resetRotation}
          className="p-2 rounded-xl bg-[#222630] hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
          title="Reset Camera & Center 3D Model"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Video Tour Modal trigger */}
        <button
          onClick={() => setShowVideoModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#222630] hover:bg-slate-700 text-xs font-medium text-slate-100 border border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-md"
          title="Watch Authentic Field Video Tour"
        >
          <Play className="w-3.5 h-3.5 text-[#4ade80] fill-[#4ade80]" />
          <span className="hidden sm:inline">Video Tour</span>
        </button>
      </div>

      {/* Main Hero Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 flex-1 flex flex-col justify-center pointer-events-none">
        <div className="max-w-3xl pointer-events-auto">
          {/* Natural Editorial Kicker (Architectural Grey with Sky Blue highlight) */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-[#38bdf8] mb-4">
            <span className="flex items-center gap-1.5 bg-[#222630] border border-slate-700/80 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              INTERACTIVE 3D CAD ARCHIVE
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-300">ESTABLISHED 2006</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="font-data text-xs text-slate-400">CAC BN: 3189204</span>
          </div>

          {/* Main Title Display */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] text-balance">
            Ola Continental <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#38bdf8]">
              Properties & Engineering.
            </span>
          </h1>

          {/* Subheading / Value Proposition */}
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            Led by Engineer Samuel Aleji for over 19 years. Explore verified property holdings across Ogbomoso and Lagos, or consult our turnkey civil building and architectural construction division.
          </p>

          {/* Interactive Hint Banner */}
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400 bg-[#222630]/80 border border-slate-700/70 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Interactive 3D: Click and drag canvas to rotate building. Use the top toolbar to switch to CAD Wireframe or Cadastral Survey.</span>
          </div>

          {/* Primary Action Row */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreProperties}
              className="px-6 py-3.5 text-sm font-semibold tracking-wide uppercase text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-lg shadow-[#2563eb]/25 inline-flex items-center gap-2 cursor-pointer group"
            >
              <span>Explore Verified Listings</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowVideoModal(true)}
              className="px-5 py-3.5 text-sm font-semibold text-white bg-[#222630] hover:bg-[#282c37] border border-[#38bdf8]/60 hover:border-[#38bdf8] rounded-xl transition-all backdrop-blur-sm cursor-pointer inline-flex items-center gap-2.5 shadow-lg group"
            >
              <div className="w-6 h-6 rounded-full bg-[#4ade80]/20 flex items-center justify-center text-[#4ade80] group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-[#4ade80]" />
              </div>
              <span>Play Video Tour</span>
            </button>

            <button
              onClick={onOpenViewing}
              className="px-5 py-3.5 text-sm font-semibold text-slate-100 bg-[#222630] hover:bg-[#282c37] border border-slate-700 rounded-xl transition-all backdrop-blur-sm cursor-pointer inline-flex items-center gap-2 shadow-md"
            >
              <HardHat className="w-4 h-4 text-[#4ade80]" />
              <span>Request Quote</span>
            </button>

            <button
              onClick={onOpenChat}
              className="px-4 py-3.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-700"
            >
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trust Strip & Core Institutional Attributes in Architectural Grey Palette */}
      <div className="relative z-10 w-full bg-[#222630] border-t border-slate-700/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Institutional Title Security</h4>
                <p className="text-xs text-slate-300 mt-0.5">Cadastral survey charting, zero government acquisition, and certified lineage escrow.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Headquarters Landmark</h4>
                <p className="text-xs text-slate-300 mt-0.5">No. 2, Olukoko St., Behind LAUTECH Teaching Hospital, Ogbomoso.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Active Operating Corridors</h4>
                <p className="text-xs text-slate-300 mt-0.5">Under G, Adenike Hostels, Aroje Belt, Odo-Oba, & Mushin Commercial (Lagos).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#4ade80] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Direct WhatsApp & Phone</h4>
                <a
                  href="https://wa.me/2348033848107?text=Hello%20Engineer%20Samuel%20Aleji,%20I%20am%20inquiring%20about%20Ola%20Continental%20Properties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-data text-xs text-[#4ade80] hover:underline block mt-0.5"
                >
                  +234 803 384 8107 (Engr. Samuel Aleji)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Video Tour Modal in Architectural Grey */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181a20]/90 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#222630] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-[#1e222b]">
              <div>
                <h3 className="text-lg font-bold font-display text-white">Ola Continental Video Tour</h3>
                <p className="text-xs text-slate-300">Authentic Field Showcase & Property Walkthrough</p>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#282c37] hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-colors"
              >
                Close (ESC)
              </button>
            </div>
            <div className="w-full flex justify-center bg-[#181a20] p-4 sm:p-6 overflow-y-auto">
              <div className="w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/IK7vm03cIFY?autoplay=1&controls=1&rel=0&loop=1&playlist=IK7vm03cIFY"
                  title="Ola Continental Official Video Tour"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="p-4 bg-[#1e222b] border-t border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                <span>Verified Holdings & Live Site Walkthrough</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/2348033848107?text=Hello%20Engineer%20Samuel%20Aleji,%20I%20just%20watched%20the%20Ola%20Continental%20Video%20Tour%20and%20would%20like%20to%20inquire."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-xs font-semibold text-[#4ade80] bg-[#181a20] border border-[#4ade80]/40 hover:border-[#4ade80] rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Inquiries</span>
                </a>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    onOpenViewing();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2563eb] rounded-xl hover:bg-[#1d4ed8] cursor-pointer shadow-md"
                >
                  Book Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
