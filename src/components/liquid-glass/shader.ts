/*
 * Shader de verre liquide adapté de Liquid Glass JS
 * https://github.com/dashersw/liquid-glass-js
 * Copyright (c) 2025 Armagan Amcalar, licence MIT.
 *
 * Différences avec l'original :
 * - la texture n'est plus la page entière mais la zone située derrière le bouton
 *   (plus une marge), recomposée à chaque image pour suivre les éléments animés ;
 * - la forme est passée explicitement (u_shape) au lieu d'être devinée ;
 * - la teinte est paramétrable (dégradé haut et bas) pour la charte CFLB ;
 * - noyaux d'échantillonnage réduits pour tenir sur mobile.
 * Les réglages par défaut sont ceux validés par le client sur la démo.
 */

export const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_texcoord;
varying vec2 v_texcoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texcoord = a_texcoord;
}
`

export const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D u_image;
uniform vec2 u_resolution;   // taille du bouton (px CSS)
uniform vec2 u_regionSize;   // taille de la zone capturée (px CSS)
uniform vec2 u_margin;       // marge autour du bouton dans la zone (px CSS)
uniform vec2 u_refScale;     // conversion de l'intensité de réfraction en px
uniform float u_borderRadius;
uniform int u_shape;         // 0 arrondi, 1 cercle, 2 pilule
uniform float u_blurRadius;
uniform float u_warp;
uniform float u_edgeIntensity;
uniform float u_rimIntensity;
uniform float u_baseIntensity;
uniform float u_edgeDistance;
uniform float u_rimDistance;
uniform float u_baseDistance;
uniform float u_cornerBoost;
uniform float u_rippleEffect;
uniform float u_tintOpacity;
uniform vec3 u_tintTop;
uniform vec3 u_tintBottom;
varying vec2 v_texcoord;

float roundedRectDistance(vec2 coord, vec2 size, float radius) {
  vec2 center = size * 0.5;
  vec2 p = coord * size;
  vec2 toCorner = abs(p - center) - (center - radius);
  float outsideCorner = length(max(toCorner, 0.0));
  float insideCorner = min(max(toCorner.x, toCorner.y), 0.0);
  return outsideCorner + insideCorner - radius;
}

float circleDistance(vec2 coord, vec2 size, float radius) {
  return length(coord * size - 0.5 * size) - radius;
}

float pillDistance(vec2 coord, vec2 size, float radius) {
  vec2 p = coord * size;
  vec2 a = vec2(radius, size.y * 0.5);
  vec2 b = vec2(size.x - radius, size.y * 0.5);
  vec2 ab = b - a;
  float len2 = dot(ab, ab);
  if (len2 <= 0.0) return length(p - size * 0.5) - radius;
  float t = clamp(dot(p - a, ab) / len2, 0.0, 1.0);
  return length(p - (a + t * ab)) - radius;
}

float shapeDistance(vec2 coord) {
  if (u_shape == 2) return pillDistance(coord, u_resolution, u_borderRadius);
  if (u_shape == 1) return circleDistance(coord, u_resolution, u_borderRadius);
  return roundedRectDistance(coord, u_resolution, u_borderRadius);
}

vec2 shapeNormal(vec2 coord) {
  if (u_shape == 2) {
    vec2 p = coord * u_resolution;
    vec2 a = vec2(u_borderRadius, u_resolution.y * 0.5);
    vec2 b = vec2(u_resolution.x - u_borderRadius, u_resolution.y * 0.5);
    vec2 ab = b - a;
    float len2 = dot(ab, ab);
    if (len2 > 0.0) {
      float t = clamp(dot(p - a, ab) / len2, 0.0, 1.0);
      vec2 n = p - (a + t * ab);
      return length(n) > 0.0 ? normalize(n) : vec2(0.0, 1.0);
    }
  }
  vec2 d = coord - vec2(0.5);
  return length(d) > 0.0 ? normalize(d) : vec2(0.0, 1.0);
}

vec3 sampleRow(float y) {
  vec3 acc = vec3(0.0);
  for (float x = 0.0; x < 1.0; x += 0.1) {
    for (float o = -2.0; o <= 2.0; o += 1.0) {
      acc += texture2D(u_image, vec2(x, y + o * 2.0 / u_regionSize.y)).rgb;
    }
  }
  return acc / 50.0;
}

void main() {
  vec2 coord = v_texcoord;
  float minDim = min(u_resolution.x, u_resolution.y);

  float dist = max(-shapeDistance(coord), 0.0);
  vec2 normal = shapeNormal(coord);

  float baseI = 1.0 - exp(-dist * u_baseDistance);
  float edgeI = exp(-dist * u_edgeDistance);
  float rimI = exp(-dist * u_rimDistance);
  float baseComponent = u_warp > 0.5 ? baseI * u_baseIntensity : 0.0;
  float total = baseComponent + edgeI * u_edgeIntensity + rimI * u_rimIntensity;

  vec2 refraction = normal * total;

  float cornerX = min(coord.x, 1.0 - coord.x);
  float cornerY = min(coord.y, 1.0 - coord.y);
  float cornerNorm = max(cornerX, cornerY) * minDim;
  refraction += normal * exp(-cornerNorm * 0.3) * u_cornerBoost;

  vec2 perpendicular = vec2(-normal.y, normal.x);
  refraction += perpendicular * sin((dist / minDim) * 25.0) * u_rippleEffect * rimI;

  // Position dans la zone capturée, en pixels puis en coordonnées de texture
  vec2 pixel = u_margin + coord * u_resolution + refraction * u_refScale;
  vec2 uv = pixel / u_regionSize;

  // Flou gaussien, même pondération que l'original (noyau réduit à 9x9)
  vec2 texel = 1.0 / u_regionSize;
  float sigma = max(u_blurRadius / 2.0, 0.01);
  vec2 stepUv = texel * sigma;
  vec4 color = vec4(0.0);
  float weightSum = 0.0;
  for (float i = -4.0; i <= 4.0; i += 1.0) {
    for (float j = -4.0; j <= 4.0; j += 1.0) {
      float d = length(vec2(i, j));
      if (d > 4.0) continue;
      float w = exp(-(d * d) / (2.0 * sigma * sigma));
      color += texture2D(u_image, uv + vec2(i, j) * stepUv) * w;
      weightSum += w;
    }
  }
  color /= weightSum;

  // Teinte en dégradé vertical
  vec3 tint = mix(u_tintTop, u_tintBottom, coord.y);
  vec3 tinted = mix(color.rgb, tint, u_tintOpacity);

  // Dégradé échantillonné sur l'arrière-plan
  float topY = (u_margin.y + u_resolution.y * 0.1) / u_regionSize.y;
  float midY = (u_margin.y + u_resolution.y * 0.5) / u_regionSize.y;
  float botY = (u_margin.y + u_resolution.y * 0.9) / u_regionSize.y;
  vec3 topC = sampleRow(topY);
  vec3 midC = sampleRow(midY);
  vec3 botC = sampleRow(botY);
  vec3 sampled;
  if (coord.y < 0.1) sampled = topC;
  else if (coord.y > 0.9) sampled = botC;
  else {
    float t = (coord.y - 0.1) / 0.8;
    sampled = t < 0.5 ? mix(topC, midC, t * 2.0) : mix(midC, botC, (t - 0.5) * 2.0);
  }
  tinted = mix(tinted, sampled, u_tintOpacity * 0.3);

  float mask = 1.0 - smoothstep(-1.0, 1.0, shapeDistance(coord));
  gl_FragColor = vec4(tinted * mask, mask);
}
`
