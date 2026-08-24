// Renders the PaintEngine fields as one continuous impasto surface: a plane
// displaced by the height field, with the colour field as albedo.
//
// The mesh is deliberately coarser than the paint grid. Displacement gives
// the silhouette and the parallax; the *lighting* detail — every bristle
// groove, every ridge left by an edge of the brush — is recovered per pixel
// in the fragment shader from the full-resolution height field. That split is
// what lets nine paintings hang in one scene without nine million vertices.
import * as THREE from 'three';

export const PAINT_W = 1.6, PAINT_H = 2.0;

export class PaintSurface {
  constructor(engine, { segments = 1, castShadow = true, hScale = 0.006 } = {}) {
    this.engine = engine;
    const { W, H } = engine;

    this.heightTex = new THREE.DataTexture(engine.height, W, H, THREE.RedFormat, THREE.FloatType);
    this.heightTex.minFilter = this.heightTex.magFilter = THREE.LinearFilter;
    this.heightTex.needsUpdate = true;

    this.colorTex = new THREE.DataTexture(engine.color, W, H, THREE.RGBAFormat, THREE.UnsignedByteType);
    this.colorTex.minFilter = this.colorTex.magFilter = THREE.LinearFilter;
    this.colorTex.colorSpace = THREE.SRGBColorSpace;
    // engine rows are image-order (top row first); flip through the uv transform
    this.colorTex.wrapS = this.colorTex.wrapT = THREE.ClampToEdgeWrapping;
    this.colorTex.repeat.y = -1;
    this.colorTex.offset.y = 1;
    this.colorTex.needsUpdate = true;

    const uniforms = {
      uHeight: { value: this.heightTex },
      uHScale: { value: hScale },                          // height units -> world
      uTexel: { value: new THREE.Vector2(1 / W, 1 / H) },
      uWorldTexel: { value: new THREE.Vector2(PAINT_W / W, PAINT_H / H) },
      uAO: { value: 0.85 },                                // strength of crevice shading
    };
    this.uniforms = uniforms;

    const common = `
      uniform sampler2D uHeight;
      uniform float uHScale;
      uniform float uAO;
      uniform vec2 uTexel;
      uniform vec2 uWorldTexel;
      float heightAt(vec2 uv) { return texture2D(uHeight, vec2(uv.x, 1.0 - uv.y)).r; }
    `;

    // The chunks are appended to, never replaced: three's own declarations
    // (nonPerturbedNormal, geometryNormal, the uv varyings for each map) have
    // to survive, and they move between versions.
    const vertexPatch = (shader) => {
      shader.vertexShader = common + `
        varying vec2 vPaintUv;
        varying vec3 vTanV;
        varying vec3 vBitV;
        varying vec3 vNrmV;
      ` + shader.vertexShader
        .replace('#include <begin_vertex>', `
          vPaintUv = uv;
          vec3 transformed = vec3(position.xy, position.z + heightAt(uv) * uHScale);
          // the plane's frame in view space is constant, so the fragment stage
          // can rebuild a perturbed normal from two height derivatives
          vTanV = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
          vBitV = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));
          vNrmV = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
        `);
    };

    const patch = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      vertexPatch(shader);
      shader.fragmentShader = common + `
        varying vec2 vPaintUv;
        varying vec3 vTanV;
        varying vec3 vBitV;
        varying vec3 vNrmV;
      ` + shader.fragmentShader
        // crevice shading: a point sunk below its surroundings sees less sky
        .replace('#include <map_fragment>', `
          #include <map_fragment>
          float hC = heightAt(vPaintUv);
          float wide = 0.0;
          wide += heightAt(vPaintUv + vec2( 5.0, 0.0) * uTexel);
          wide += heightAt(vPaintUv + vec2(-5.0, 0.0) * uTexel);
          wide += heightAt(vPaintUv + vec2(0.0,  5.0) * uTexel);
          wide += heightAt(vPaintUv + vec2(0.0, -5.0) * uTexel);
          wide += heightAt(vPaintUv + vec2( 11.0,  11.0) * uTexel);
          wide += heightAt(vPaintUv + vec2(-11.0,  11.0) * uTexel);
          wide += heightAt(vPaintUv + vec2( 11.0, -11.0) * uTexel);
          wide += heightAt(vPaintUv + vec2(-11.0, -11.0) * uTexel);
          float occ = clamp((wide / 8.0 - hC) * 0.9, 0.0, 1.0);
          diffuseColor.rgb *= 1.0 - occ * uAO;
        `)
        // thick fresh paint is glossy; the canvas showing through the thin
        // passages is not, so the sheen follows the paste
        .replace('#include <roughnessmap_fragment>', `
          #include <roughnessmap_fragment>
          roughnessFactor = mix(0.78, 0.36, clamp((hC - 0.35) * 0.55, 0.0, 1.0));
        `)
        // per-pixel normal from the paint's own height field, at the grid's
        // full resolution however coarse the mesh under it is
        .replace('#include <normal_fragment_begin>', `
          #include <normal_fragment_begin>
          {
            float hL = heightAt(vPaintUv - vec2(uTexel.x, 0.0));
            float hR = heightAt(vPaintUv + vec2(uTexel.x, 0.0));
            float hD = heightAt(vPaintUv - vec2(0.0, uTexel.y));
            float hU = heightAt(vPaintUv + vec2(0.0, uTexel.y));
            float dhdx = (hR - hL) * uHScale / (2.0 * uWorldTexel.x);
            float dhdy = (hU - hD) * uHScale / (2.0 * uWorldTexel.y);
            normal = normalize(vNrmV - vTanV * dhdx - vBitV * dhdy);
            nonPerturbedNormal = normal;
          }
        `);
    };

    this.material = new THREE.MeshPhysicalMaterial({
      map: this.colorTex,
      roughness: 0.45,
      metalness: 0.0,
      // the oil layer over the pigment: enough to catch a raking light, not
      // enough to turn the whole painting into a mirror of the room
      clearcoat: 0.42,
      clearcoatRoughness: 0.34,
      envMapIntensity: 0.5,
    });
    this.material.onBeforeCompile = patch;
    this.material.customProgramCacheKey = () => 'oil-surface';

    const segX = Math.max(8, Math.round((W - 1) / segments));
    const segY = Math.max(8, Math.round((H - 1) / segments));
    const geo = new THREE.PlaneGeometry(PAINT_W, PAINT_H, segX, segY);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.receiveShadow = true;

    if (castShadow) {
      const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
      depth.defines = { USE_UV: '' };
      depth.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);
        vertexPatch(shader);
      };
      depth.customProgramCacheKey = () => 'oil-surface-depth';
      this.mesh.customDepthMaterial = depth;
      this.mesh.castShadow = true;
    }
  }

  update() {
    this.heightTex.needsUpdate = true;
    this.colorTex.needsUpdate = true;
  }

  // point the surface at a different engine without rebuilding the mesh
  setEngine(engine) {
    this.engine = engine;
    this.heightTex.image.data = engine.height;
    this.colorTex.image.data = engine.color;
    this.update();
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.heightTex.dispose();
    this.colorTex.dispose();
  }
}
