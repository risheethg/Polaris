varying vec3 vNormal;
varying vec3 vPosition;

void main() 
{
    vNormal = normalize( normalMatrix * normal );
    vPosition = vec3( modelViewMatrix * vec4( position, 1.0 ) );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}