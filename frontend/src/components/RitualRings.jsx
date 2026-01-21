import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 儀式シンボルを生成するテクスチャ
 */
function createSymbolTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // 背景を透明に
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // シンボルパターンを描画
  ctx.fillStyle = '#00d4ff';
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 2;

  // 儀式的なシンボルを繰り返し配置
  const symbols = ['◇', '○', '△', '□', '◈', '⬡'];
  const spacing = canvas.width / symbols.length;

  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  symbols.forEach((symbol, i) => {
    const x = spacing * i + spacing / 2;
    const y = canvas.height / 2;
    ctx.fillText(symbol, x, y);

    // シンボル間の接続線
    if (i < symbols.length - 1) {
      ctx.beginPath();
      ctx.moveTo(x + 20, y);
      ctx.lineTo(x + spacing - 20, y);
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

/**
 * 単一の儀式リング
 */
function RitualRing({
  radius = 2,
  tube = 0.08,
  rotationSpeed = 0.3,
  rotationDirection = 1,
  tiltX = 0,
  tiltZ = 0,
  color = '#00aaff',
  opacity = 0.6,
  useSymbols = false
}) {
  const ringRef = useRef();
  const symbolTexture = useMemo(() => useSymbols ? createSymbolTexture() : null, [useSymbols]);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += rotationSpeed * 0.01 * rotationDirection;
      // 微細な揺らぎを追加
      ringRef.current.rotation.x = tiltX + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group rotation={[tiltX, 0, tiltZ]}>
      <Torus ref={ringRef} args={[radius, tube, 16, 100]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          map={symbolTexture}
        />
      </Torus>
    </group>
  );
}

/**
 * エネルギーフロー（リング間を流れる光）
 */
function EnergyFlow({ radius = 1.8 }) {
  const particlesRef = useRef();
  const particleCount = 50;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      angles[i] = (i / particleCount) * Math.PI * 2;
      positions[i * 3] = Math.cos(angles[i]) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = Math.sin(angles[i]) * radius;
    }

    return { positions, angles };
  }, [radius, particleCount]);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      const time = state.clock.elapsedTime;

      for (let i = 0; i < particleCount; i++) {
        const angle = particles.angles[i] + time * 0.5;
        const r = radius + Math.sin(time * 2 + i) * 0.1;
        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 1] = Math.sin(time * 3 + i * 0.5) * 0.3;
        positions[i * 3 + 2] = Math.sin(angle) * r;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00d4ff"
        size={0.05}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * RitualRings - 二重構造の儀式リング
 * 球体の周囲を逆方向に回転する
 */
export default function RitualRings({ coreRadius = 1 }) {
  return (
    <group>
      {/* 内側リング - 高速正回転 */}
      <RitualRing
        radius={coreRadius * 1.8}
        tube={0.04}
        rotationSpeed={0.5}
        rotationDirection={1}
        tiltX={Math.PI / 6}
        tiltZ={0.1}
        color="#00ccff"
        opacity={0.7}
        useSymbols={true}
      />

      {/* 外側リング - 低速逆回転 */}
      <RitualRing
        radius={coreRadius * 2.4}
        tube={0.05}
        rotationSpeed={0.3}
        rotationDirection={-1}
        tiltX={-Math.PI / 8}
        tiltZ={-0.15}
        color="#0088cc"
        opacity={0.5}
        useSymbols={true}
      />

      {/* 第三リング（装飾的・より外側）*/}
      <RitualRing
        radius={coreRadius * 3.0}
        tube={0.025}
        rotationSpeed={0.15}
        rotationDirection={1}
        tiltX={Math.PI / 3}
        tiltZ={0.2}
        color="#006699"
        opacity={0.3}
        useSymbols={false}
      />

      {/* エネルギーフロー */}
      <EnergyFlow radius={coreRadius * 2.1} />
    </group>
  );
}
