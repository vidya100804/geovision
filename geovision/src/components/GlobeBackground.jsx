import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, useTexture, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { latLngToVector3 } from "../utils/geoMath";
import { EVENT_COLORS } from "../utils/eventColors";

function Marker({ position, event }) {
  const ref = useRef();

  // pulse animation
  useFrame(({ clock }) => {
    const scale = 1 + Math.sin(clock.elapsedTime * 4) * 0.3;
    if (ref.current) {
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={EVENT_COLORS[event.type] || "#fff"}/>
    </mesh>
  );
}



function Earth({ location, events, onEventHover, onEventClick }) {
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

      {/* 🔴 EVENT MARKERS */}
      {events?.map((event) => (
        <EventMarker
          key={event.id}
          event={event}
          onHover={onEventHover}
          onClick={onEventClick}
        />
      ))}
    </group>
  );
}

export default function GlobeBackground({
  location,
  events,
  onEventHover,
  onEventClick,
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      style={{ position: "absolute", inset: 0, zIndex: 1 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <Earth
        location={location}
        events={events}
        onEventHover={onEventHover}
        onEventClick={onEventClick}
      />

      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
