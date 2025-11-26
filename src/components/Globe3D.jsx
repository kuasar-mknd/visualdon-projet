import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3';

const Globe3D = ({ onCountrySelect, data, geoJson }) => {
  const globeRef = useRef();
  const cloudsRef = useRef();
  const barsGroupRef = useRef();
  
  // Load textures
  const [colorMap, bumpMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  // Convert lat/lon to 3D sphere coordinates
  const latLonToVector3 = (lat, lon, radius = 2) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  };

  // Calculate country centroids and prepare bar data
  const barData = useMemo(() => {
    if (!data || !geoJson || data.length === 0) return [];
    
    const countryMap = new Map();
    data.forEach(d => {
      const code = d['ISO 3166-1 alpha-3'];
      const value = d.Total || 0;
      if (code && !isNaN(value)) {
        countryMap.set(code, value);
      }
    });

    const bars = [];
    geoJson.features.forEach((feature) => {
      const code = feature.properties.A3;
      const value = countryMap.get(code);
      
      if (value && value > 0) {
        const centroid = d3.geoCentroid(feature);
        if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
          bars.push({
            code,
            position: latLonToVector3(centroid[1], centroid[0]),
            value,
            name: feature.properties.Country || feature.properties.NAME
          });
        }
      }
    });

    return bars;
  }, [data, geoJson]);

  // Create color scale - Neon/Cyberpunk Palette
  const colorScale = useMemo(() => {
    if (barData.length === 0) return () => new THREE.Color(0x3b82f6);
    
    const maxValue = Math.max(...barData.map(d => d.value));
    return d3.scaleSequential()
      .domain([0, maxValue])
      .interpolator(t => {
        // Cyan -> Neon Green -> Hot Pink -> Bright Red
        if (t < 0.33) return d3.interpolateRgb("#06b6d4", "#22c55e")(t * 3);
        else if (t < 0.66) return d3.interpolateRgb("#22c55e", "#f472b6")((t - 0.33) * 3);
        else return d3.interpolateRgb("#f472b6", "#ef4444")((t - 0.66) * 3);
      });
  }, [barData]);

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
        float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  }), []);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0005;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0007;
    }
    
    // Bar pulsing disabled for stability
    // if (barsGroupRef.current) {
    //   barsGroupRef.current.children.forEach((bar, i) => {
    //     const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + i * 0.1) * 0.05;
    //     bar.scale.y = scale;
    //   });
    // }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} />
      
      {/* Stars Background */}
      <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade speed={1} />

      <group ref={globeRef}>
        {/* Earth Sphere */}
        <Sphere args={[2, 64, 64]}>
          <meshPhongMaterial 
            map={colorMap}
            bumpMap={bumpMap}
            bumpScale={0.05}
            specularMap={specularMap}
            specular={new THREE.Color('grey')}
            shininess={10}
          />
        </Sphere>

        {/* Clouds Layer */}
        <mesh ref={cloudsRef} scale={[2.02, 2.02, 2.02]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial 
            map={cloudsMap}
            transparent={true}
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Data Visualization - 3D Bars */}
        <group ref={barsGroupRef}>
          {barData.map((bar) => {
            const maxValue = Math.max(...barData.map(d => d.value));
            const normalizedHeight = (bar.value / maxValue) * 2 + 0.3;
            const color = new THREE.Color(colorScale(bar.value));
            
            // Direction from center to surface (normal)
            const normal = bar.position.clone().normalize();
            
            // Position the center of the bar so its base is at the surface (radius 1.995)
            // Center = Surface + Height/2
            const position = normal.clone().multiplyScalar(1.995 + normalizedHeight / 2);
            
            // Create a quaternion to rotate the cylinder (which points up along Y) to align with the normal
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
            
            return (
              <mesh
                key={bar.code}
                position={position}
                quaternion={quaternion}
                onClick={(e) => {
                  e.stopPropagation();
                  onCountrySelect && onCountrySelect(bar.code);
                }}
              >
                <cylinderGeometry args={[0.015, 0.015, normalizedHeight, 8]} />
                <meshStandardMaterial 
                  color={color}
                  emissive={color}
                  emissiveIntensity={2}
                  transparent
                  opacity={0.6}
                  roughness={0.2}
                  metalness={0.8}
                />
              </mesh>
            );
          })}
        </group>

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
