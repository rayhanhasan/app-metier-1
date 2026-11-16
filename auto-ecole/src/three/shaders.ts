import * as THREE from 'three'

// Uniformes partagés par les shaders maison (mis à jour dans Atmosphere.tsx)
export const U = {
  time: { value: 0 },
  night: { value: 0 },
}

/**
 * Fenêtres allumées la nuit sur les façades photographiées.
 * Les vitres sont les zones sombres de la texture, sur des faces verticales :
 * on en allume une partie, tirée au sort par « cellule » (travée × étage).
 */
export function litWindows(mat: THREE.MeshStandardMaterial) {
  if (mat.userData.litWindows) return
  mat.userData.litWindows = true
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uNight = U.night
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWPos = (modelMatrix * vec4(position, 1.0)).xyz;\nvWNrm = normalize(mat3(modelMatrix) * normal);')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uNight;
varying vec3 vWPos;
varying vec3 vWNrm;
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
{
  float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
  // vitres : très sombres et peu colorées (on écarte les ombres chaudes de la pierre)
  float chroma = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b)) - min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));
  float glass = (1.0 - smoothstep(0.008, 0.04, lum)) * (1.0 - smoothstep(0.015, 0.05, chroma)) * step(abs(vWNrm.y), 0.25);
  float along = dot(vWPos.xz, vec2(-vWNrm.z, vWNrm.x));
  vec2 cell = floor(vec2(along / 1.3, (vWPos.y - 0.4) / 3.0));
  float pick = hash21(cell + floor(vWPos.xz * 0.05));
  float on = step(0.58, pick);
  vec3 tint = mix(vec3(1.0, 0.66, 0.32), vec3(1.0, 0.86, 0.62), hash21(cell + 3.7));
  totalEmissiveRadiance += uNight * glass * on * tint * (0.55 + pick * 0.5);
}`,
      )
  }
  mat.customProgramCacheKey = () => 'lit-windows-2'
  mat.needsUpdate = true
}

/** Feuillage qui bouge au vent : déplacement des sommets, plus fort en haut de l'arbre. */
export function windyLeaves(mat: THREE.MeshStandardMaterial) {
  if (mat.userData.windy) return
  mat.userData.windy = true
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = U.time
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
{
  vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
  float h = smoothstep(1.5, 9.0, position.y);
  float gust = sin(uTime * 1.1 + wp.x * 0.35 + wp.z * 0.27) * 0.6 + sin(uTime * 2.7 + wp.x * 1.3 + position.y * 0.9) * 0.4;
  transformed.x += gust * 0.07 * h;
  transformed.z += cos(uTime * 0.9 + wp.z * 0.4) * 0.05 * h;
  transformed.y += sin(uTime * 3.1 + wp.x * 2.0 + wp.z * 2.0) * 0.015 * h;
}`,
      )
  }
  mat.customProgramCacheKey = () => 'windy-leaves'
  mat.needsUpdate = true
}
