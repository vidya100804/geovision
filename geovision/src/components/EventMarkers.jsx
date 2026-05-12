import { Sphere } from "@react-three/drei";

const RADIUS = 1.62;

function latLngToVector3(lat, lng) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = RADIUS * Math.sin(phi) * Math.cos(theta);
  const y = RADIUS * Math.cos(phi);
  const z = RADIUS * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

export default function EventMarkers({ events = [] }) {
  return events.map((e, i) => {
    const position = latLngToVector3(e.lat, e.lng);

    return (
      <Sphere key={i} args={[0.04, 16, 16]} position={position}>
        <meshStandardMaterial
          emissive="red"
          emissiveIntensity={2}
          color="red"
        />
      </Sphere>
    );
  });
}
