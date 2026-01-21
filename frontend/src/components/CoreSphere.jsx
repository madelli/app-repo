import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

/**
 * CoreSphere - Cold Operator の中枢球体
 * 電気的な青い光を放つ脈動する球体
 */
export default function CoreSphere({
  radius = 1,
  position = [0, 0, 0],
  pulseSpeed = 1.5,
  pulseIntensity = 0.15
}) {
  const meshRef = useRef();
  const materialRef = useRef();
  const glowRef = useRef();

  // 基本色設定（Cold Operator テーマ）
  const coreColor = new THREE.Color('#00d4ff');
  const emissiveColor = new THREE.Color('#0088cc');

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // 脈動アニメーション
    const pulse = Math.sin(time * pulseSpeed) * pulseIntensity;
    const scale = 1 + pulse;

    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
    }

    // emissive intensity の変動
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 1.5 + Math.sin(time * pulseSpeed * 2) * 0.5;
    }

    // 外側グローの脈動
    if (glowRef.current) {
      glowRef.current.scale.setScalar(scale * 1.3);
      glowRef.current.material.opacity = 0.15 + Math.sin(time * pulseSpeed) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* メイン球体 */}
      <Sphere ref={meshRef} args={[radius, 64, 64]}>
        <meshStandardMaterial
          ref={materialRef}
          color={coreColor}
          emissive={emissiveColor}
          emissiveIntensity={1.5}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
      </Sphere>

      {/* 内側グロー層 */}
      <Sphere args={[radius * 1.05, 32, 32]}>
        <meshBasicMaterial
          color="#00aaff"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* 外側グロー（大気効果） */}
      <Sphere ref={glowRef} args={[radius * 1.4, 32, 32]}>
        <meshBasicMaterial
          color="#0066cc"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* 電気的なエフェクト用の追加グロー */}
      <Sphere args={[radius * 1.8, 16, 16]}>
        <meshBasicMaterial
          color="#003366"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* コアの明るいハイライト */}
      <pointLight
        color="#00d4ff"
        intensity={2}
        distance={8}
        decay={2}
      />
    </group>
  );
}
