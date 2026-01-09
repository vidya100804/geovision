import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, useTexture, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { latLngToVector3 } from "../utils/geoMath";
import { EVENT_COLORS } from "../utils/eventColors";

function Marker({ position, event }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const scale = 1 + Math.sin(clock.elapsedTime * 4) * 0.3;
    if (ref.current) {
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={EVENT_COLORS[event.type] || "#ffffff"} />
    </mesh>
  );
}

function Earth({ location, events }) {
  const earthRef = useRef();
  const texture = useTexture("/earth.jpg");

  useFrame(() => {
    if (!earthRef.current) return;

    earthRef.current.rotation.y += 0.0008;


    if (location) {
      const targetY = (-location.lng * Math.PI) / 180;
      earthRef.current.rotation.y +=
        (targetY - earthRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <group>
      <Sphere ref={earthRef} args={[1.6, 64, 64]}>
        <meshStandardMaterial map={texture} />
      </Sphere>

      {(events || []).map((event) => (
        <Marker
          key={event.id || `${event.lat}-${event.lng}`}
          position={latLngToVector3(event.lat, event.lng, 1.6)}
          event={event}
        />
      ))}
    </group>
  );
}

export default function GlobeBackground({ location, events }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Earth location={location} events={events} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
