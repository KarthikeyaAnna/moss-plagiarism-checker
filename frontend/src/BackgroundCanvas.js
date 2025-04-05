import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Animated floating shape component
function RotatingShape({ position, color, speed, size }) {
  const mesh = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(time * speed * 0.4) * 0.3;
    mesh.current.rotation.y = Math.sin(time * speed * 0.2) * 0.5;
    mesh.current.position.y = position[1] + Math.sin(time * speed) * 0.5;
  });

  return (
    <mesh ref={mesh} position={position}>
      <dodecahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.8} />
    </mesh>
  );
}

// Background canvas component
export default function BackgroundCanvas() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: -1,
      background: 'linear-gradient(to bottom, #0a0a1a, #1a1a2a)' 
    }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#0060ff" />
        
        {/* Add multiple shapes with different properties */}
        <RotatingShape position={[-5, 0, 0]} color="#ff3e88" speed={0.8} size={1.5} />
        <RotatingShape position={[5, 0, 2]} color="#7b5eff" speed={1.0} size={1.2} />
        <RotatingShape position={[0, 3, -2]} color="#54d5ff" speed={0.7} size={1.0} />
        <RotatingShape position={[-4, -3, 1]} color="#faad14" speed={0.9} size={0.8} />
        <RotatingShape position={[4, -2, -1]} color="#5eff7b" speed={1.1} size={0.7} />
        
        {/* Add stars in the background */}
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />
        
        {/* Optional: Allow the user to interact with the scene */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.4} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
