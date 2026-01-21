import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import CoreSphere from './CoreSphere';
import RitualRings from './RitualRings';

/**
 * 環境光とライティング設定
 */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.1} color="#1a2a3a" />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.3}
        color="#4488cc"
      />
      <directionalLight
        position={[-5, -5, -5]}
        intensity={0.2}
        color="#2266aa"
      />
    </>
  );
}

/**
 * 背景のパーティクルフィールド
 */
function ParticleField() {
  const particlesRef = useRef();
  const count = 200;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 球状に分布
      const radius = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // 青系のグラデーション
      const blueIntensity = 0.5 + Math.random() * 0.5;
      colors[i * 3] = 0;
      colors[i * 3 + 1] = blueIntensity * 0.6;
      colors[i * 3 + 2] = blueIntensity;
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
      particlesRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        transparent
        opacity={0.6}
        vertexColors
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * 接続線（コアからリングへの光線）
 */
function ConnectionBeams() {
  const beamsRef = useRef();
  const beamCount = 8;

  const beams = useMemo(() => {
    const positions = [];
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      positions.push({
        start: [0, 0, 0],
        end: [Math.cos(angle) * 3, 0, Math.sin(angle) * 3],
        angle
      });
    }
    return positions;
  }, [beamCount]);

  useFrame((state) => {
    if (beamsRef.current) {
      beamsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={beamsRef}>
      {beams.map((beam, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...beam.start, ...beam.end])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#00aaff"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  );
}

/**
 * カメラの自動回転（オプション）
 */
function CameraController({ autoRotate = true }) {
  const { camera } = useThree();
  const angleRef = useRef(0);

  useFrame((state, delta) => {
    if (autoRotate) {
      angleRef.current += delta * 0.05;
      const radius = 7;
      camera.position.x = Math.sin(angleRef.current) * radius;
      camera.position.z = Math.cos(angleRef.current) * radius;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

/**
 * メイン3Dシーンコンテンツ
 */
function Scene({ autoRotateCamera = true, enableControls = false }) {
  return (
    <>
      <Lighting />

      {/* 背景の星空 */}
      <Stars
        radius={50}
        depth={50}
        count={1000}
        factor={2}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* パーティクルフィールド */}
      <ParticleField />

      {/* フローティングエフェクトでコアとリングを包む */}
      <Float
        speed={1}
        rotationIntensity={0.1}
        floatIntensity={0.3}
        floatingRange={[-0.1, 0.1]}
      >
        {/* 中央のコア球体 */}
        <CoreSphere
          radius={0.8}
          position={[0, 0, 0]}
          pulseSpeed={1.5}
          pulseIntensity={0.12}
        />

        {/* 儀式リング */}
        <RitualRings coreRadius={0.8} />
      </Float>

      {/* 接続線 */}
      <ConnectionBeams />

      {/* カメラ制御 */}
      {autoRotateCamera && <CameraController autoRotate={true} />}
      {enableControls && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      )}
    </>
  );
}

/**
 * RitualCore - Cold Operator の儀式的中枢UI
 * Layer2 に統合する3Dシーン全体を管理
 */
export default function RitualCore({
  className = '',
  autoRotateCamera = true,
  enableControls = false
}) {
  return (
    <div className={`ritual-core-container ${className}`}>
      <Canvas
        camera={{
          position: [0, 2, 7],
          fov: 45,
          near: 0.1,
          far: 100
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: enableControls ? 'auto' : 'none'
        }}
      >
        <Suspense fallback={null}>
          <Scene
            autoRotateCamera={autoRotateCamera}
            enableControls={enableControls}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
