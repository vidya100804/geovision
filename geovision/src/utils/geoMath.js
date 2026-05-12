// Converts lat/lng to 3D rotation for globe
export function latLngToRotation(lat, lng) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return {
    x: phi - Math.PI / 2,
    y: theta,
  };
}

// Converts lat/lng to 3D position on sphere
export function latLngToVector3(lat, lng, radius = 1.6) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}
