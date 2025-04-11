'use client'; // Still needed for hooks and interactivity within this component

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';

// --- 3D Model Component (can stay here or be imported if used elsewhere) ---
function HumanModel({ modelPath, isTalking }) {
  const { scene } = useGLTF(modelPath);
  const modelRef = React.useRef(); // Use React.useRef here

  // Basic talking animation placeholder
  React.useEffect(() => { // Use React.useEffect
    if (modelRef.current) {
      console.log("Model loaded, isTalking:", isTalking);
      // Add lip-sync logic here
    }
  }, [isTalking]);

  return <primitive ref={modelRef} object={scene} scale={1.5} position={[0, -1.5, 0]} />;
}


// --- Main Canvas Component ---
export default function TutorCanvas({ isSpeaking }) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-gray-200 relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={
          <Html center>
            <p className="text-center text-gray-600 bg-white/50 p-2 rounded">Loading 3D Model...</p>
          </Html>
        }>
          <HumanModel modelPath="/human.glb" isTalking={isSpeaking} />
          <Environment preset="sunset" />
          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.2} maxPolarAngle={Math.PI / 2.2} />
        </Suspense>
      </Canvas>
      {isSpeaking && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Speaking...
        </div>
      )}
    </div>
  );
} 