export const orbitState = {
  positions: new Float32Array(0),
}

function ensureOrbitState(count: number): void {
  if (orbitState.positions.length !== count * 3) {
    orbitState.positions = new Float32Array(count * 3)
  }
}

export function updateOrbits(time: number, count: number): void {
  ensureOrbitState(count)
  const step = (Math.PI * 2) / count
  for (let i = 0; i < count; i++) {
    const radius = 4.6 + (i % 2) * 0.7
    const y = -0.5 + (i % 3) * 0.75
    const angle = i * step + time * 0.08 + 0.4
    orbitState.positions[i * 3] = Math.cos(angle) * radius
    orbitState.positions[i * 3 + 1] = y
    orbitState.positions[i * 3 + 2] = Math.sin(angle) * radius
  }
}
