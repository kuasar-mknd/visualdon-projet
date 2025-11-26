import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3';

const Globe3D = ({ onCountrySelect, data, geoJson }) => {
  const globeRef = useRef();
  const barsGroupRef = useRef();
  const [hoveredCountry, setHoveredCountry] = useState(null);
  
  // Load texture
  const colorMap = useLoader(THREE.TextureLoader,
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
  );

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

  // Create color scale - High Contrast Palette for Readability
  const colorScale = useMemo(() => {
    if (barData.length === 0) return () => new THREE.Color(0x3b82f6);
    
    const maxValue = Math.max(...barData.map(d => d.value));
    return d3.scaleSequential()
      .domain([0, maxValue])
      .interpolator(t => {
        // Distinct color progression: Teal -> Yellow -> Orange -> Red
        if (t < 0.25) return d3.interpolateRgb("#14b8a6", "#06b6d4")(t * 4);
        else if (t < 0.5) return d3.interpolateRgb("#06b6d4", "#fbbf24")((t - 0.25) * 4);
        else if (t < 0.75) return d3.interpolateRgb("#fbbf24", "#fb923c")((t - 0.5) * 4);
        else return d3.interpolateRgb("#fb923c", "#ef4444")((t - 0.75) * 4);
      });
  }, [barData]);

  // Enhanced Atmosphere shader material
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
        float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
        gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0) * intensity * 1.5;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  }), []);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0002; // Very slow rotation
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <directionalLight position={[-5, -3, -5]} intensity={0.8} />
      <directionalLight position={[0, -5, 0]} intensity={1} />
      
      {/* Stars Background */}
      <Stars radius={300} depth={60} count={6000} factor={8} saturation={0} fade speed={1} />

      <group ref={globeRef}>
        {/* Earth Sphere */}
        <Sphere args={[2, 64, 64]}>
          <meshStandardMaterial 
            map={colorMap}
            roughness={0.7}
            metalness={0.2}
          />
        </Sphere>

        {/* Country markers - bright points at data locations */}
        {barData.map((bar) => {
          const normal = bar.position.clone().normalize();
          const markerPosition = normal.clone().multiplyScalar(2.01);
          
          return (
            <mesh key={`marker-${bar.code}`} position={markerPosition}>
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
            </mesh>
          );
        })}

        {/* Data Visualization - 3D Bars */}
        <group ref={barsGroupRef}>
          {barData.map((bar) => {
            const maxValue = Math.max(...barData.map(d => d.value));
            const normalizedHeight = (bar.value / maxValue) * 2.5 + 0.4;
            const color = new THREE.Color(colorScale(bar.value));
            
            // Direction from center to surface (normal)
            const normal = bar.position.clone().normalize();
            
            // Position the center of the bar so its base is at the surface (radius 1.995)
            // Center = Surface + Height/2
            const position = normal.clone().multiplyScalar(1.995 + normalizedHeight / 2);
            
            // Create a quaternion to rotate the cylinder (which points up along Y) to align with the normal
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
            
            const isHovered = hoveredCountry === bar.code;
            
            return (
              <mesh
                key={bar.code}
                position={position}
                quaternion={quaternion}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredCountry(bar.code);
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  setHoveredCountry(null);
                  document.body.style.cursor = 'default';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCountrySelect && onCountrySelect(bar.code);
                }}
              >
                {/* Glowing base point */}
                <mesh position={[0, -normalizedHeight/2, 0]}>
                  <sphereGeometry args={[isHovered ? 0.06 : 0.04, 16, 16]} />
                  <meshBasicMaterial 
                    color={color} 
                    opacity={isHovered ? 1 : 0.8} 
                    transparent 
                  />
                </mesh>
                
                {/* Outline mesh for better visibility */}
                <mesh>
                  <cylinderGeometry args={[0.028, 0.028, normalizedHeight, 16]} />
                  <meshBasicMaterial 
                    color="#000000" 
                    opacity={isHovered ? 0.7 : 0.5} 
                    transparent 
                  />
                </mesh>
                
                {/* Main bar */}
                <cylinderGeometry args={[0.025, 0.025, normalizedHeight, 16]} />
                <meshStandardMaterial 
                  color={color}
                  emissive={color}
                  emissiveIntensity={isHovered ? 2.5 : 1.2}
                  transparent={false}
                  roughness={0.2}
                  metalness={0.6}
                />
                
                {/* Tooltip on hover */}
                {isHovered && (
                  <Html distanceFactor={10}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.85)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'system-ui, sans-serif',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      border: `2px solid ${color.getStyle()}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                      <strong>{bar.name}</strong><br/>
                      {bar.value.toFixed(2)} Mt CO₂
                    </div>
                  </Html>
                )}
              </mesh>
            );
          })}
        </group>

        {/* Enhanced Atmosphere Glow */}
        <mesh scale={[2.3, 2.3, 2.3]}>
          <sphereGeometry args={[1, 64, 64]} />
          <primitive object={atmosphereMaterial} attach="material" />
        </mesh>
      </group>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={3.5} 
        maxDistance={12}
        rotateSpeed={0.7}
        zoomSpeed={0.7}
        autoRotate={true}
        autoRotateSpeed={0.1}
      />
    </>
  );
};

export default Globe3D;
