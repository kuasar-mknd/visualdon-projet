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
    if (!data || !geoJson || data.length === 0) {
      console.log('❌ No data or geoJson available');
      return [];
    }
    
    console.log('📊 Processing data:', data.length, 'items');
    
    const countryMap = new Map();
    data.forEach(d => {
      const code = d['ISO 3166-1 alpha-3'];
      const value = d.Total || 0;
      if (code && !isNaN(value)) {
        countryMap.set(code, value);
      }
    });

    console.log('🗺️ Country map size:', countryMap.size);
    console.log('🔑 Sample country codes from data:', Array.from(countryMap.keys()).slice(0, 5));
    
    console.log('🌍 GeoJSON features:', geoJson.features.length);
    if (geoJson.features.length > 0) {
      console.log('🧪 First feature properties:', geoJson.features[0].properties);
    }

    const bars = [];
    geoJson.features.forEach((feature, index) => {
      const code = feature.properties.A3;  // Fixed: use A3 property
      const value = countryMap.get(code);
      
      if (index === 0) {
        console.log(`🔍 First feature code check: '${code}' -> value: ${value}`);
      }
      
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

    console.log('🎯 Created bars:', bars.length);
    if (bars.length > 0) {
      console.log('📍 Sample bar:', bars[0]);
    }

    return bars;
  }, [data, geoJson]);

  // Create color scale
  const colorScale = useMemo(() => {
    if (barData.length === 0) return () => new THREE.Color(0x3b82f6);
    
    const maxValue = Math.max(...barData.map(d => d.value));
    return d3.scaleSequential()
      .domain([0, maxValue])
      .interpolator(t => {
        if (t < 0.33) return d3.interpolateRgb("#3b82f6", "#10b981")(t * 3);
        else if (t < 0.66) return d3.interpolateRgb("#10b981", "#fbbf24")((t - 0.33) * 3);
        else return d3.interpolateRgb("#fbbf24", "#ef4444")((t - 0.66) * 3);
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
    
    // Animate bars with subtle pulsing
    if (barsGroupRef.current) {
      barsGroupRef.current.children.forEach((bar, i) => {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + i * 0.1) * 0.05;
        bar.scale.y = scale;
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} />
      
      {/* Stars Background */}
      <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade speed={1} />

      <group>
        {/* Earth Sphere */}
        <Sphere ref={globeRef} args={[2, 64, 64]}>
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
            
            // Direction from center to surface
            const direction = bar.position.clone().normalize();
            const barHeight = normalizedHeight;
            const barPosition = direction.multiplyScalar(2.1 + barHeight / 2);
            
            return (
              <mesh
                key={bar.code}
                position={barPosition}
                lookAt={direction.multiplyScalar(10)}
                onClick={() => onCountrySelect && onCountrySelect(bar.code)}
              >
                <cylinderGeometry args={[0.05, 0.05, barHeight, 8]} />
                <meshBasicMaterial 
                  color={color}
                  opacity={1}
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
