import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const Globe3D = ({ onCountrySelect }) => {
  const globeRef = useRef();
  
  // Atmosphere shader material
  const atmosphereMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  }), []);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[-5, 3, 5]} intensity={0.5} />
      
      {/* Stars Background */}
      <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade speed={1} />

      <group>
        {/* Earth Sphere */}
        <Sphere ref={globeRef} args={[2, 64, 64]} onClick={(e) => console.log('Clicked globe')}>
          <meshStandardMaterial 
            color="#1e293b" // Slate-800 base
            roughness={0.7}
            metalness={0.1}
          />
        </Sphere>

        {/* Atmosphere Glow */}
        <mesh scale={[2.2, 2.2, 2.2]}>
          <sphereGeometry args={[1, 64, 64]} />
          <primitive object={atmosphereMaterial} attach="material" />
        </mesh>
      </group>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={3} 
        maxDistance={10}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        autoRotate={false}
      />
    </>
  );
};

export default Globe3D;
