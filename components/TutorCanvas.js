'use client'; // Still needed for hooks and interactivity within this component

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';

// --- 3D Model Component ---
function HumanModel({ modelPath, isTalking }) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();

  useEffect(() => {
    if (modelRef.current) {
      // Subtle animation when talking
      modelRef.current.position.y = isTalking ? -0.95 : -1;
    }
  }, [isTalking]);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={0.6} // Smaller scale
      position={[0, -1, 0]} // Positioned lower and centered
      rotation={[0.1, 0, 0]} // Slight tilt up
    />
  );
}

// --- Main Canvas Component ---
export default function TutorCanvas({ isSpeaking }) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-blue-50 to-white relative">
      <Canvas
        camera={{
          position: [0, 0, 2.5], // Closer camera
          fov: 25, // Narrower field of view for less distortion
          near: 0.1,
          far: 1000
        }}
      >
        {/* Improved lighting setup */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[0, 2, 2]}
          intensity={1.5}
          castShadow
        />
        <directionalLight
          position={[-2, 2, -2]}
          intensity={0.8}
        />

        <Suspense fallback={
          <Html center>
            <div className="bg-white/50 px-4 py-2 rounded-lg">
              <p className="text-gray-600">Loading 3D Model...</p>
            </div>
          </Html>
        }>
          <HumanModel
            modelPath="/human.glb"
            isTalking={isSpeaking}
          />
          <Environment preset="studio" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 2.1}
            minAzimuthAngle={-Math.PI / 8}
            maxAzimuthAngle={Math.PI / 8}
          />
        </Suspense>
      </Canvas>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white text-sm">Speaking</span>
        </div>
      )}
    </div>
  );
} 