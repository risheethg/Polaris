varying vec2 vUv;

void main() {
  vUv = uv; // Pass the texture coordinates to the fragment shader
  // Set the final position of the vertex
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
