"use client";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { cellCurrentMa, cellThermalC } from "@cascade/domain";
import type { Data } from "../data";
import { base } from "../data";
import { live, state, useStore } from "../store";

// Palette: Graphite #08090B, Silicon #161A20, Wafer Violet #7457FF, Iridescent #5EF1D2, Copper #D98042, Photoresist #FF46A2, Cleanroom #E9F4FA.
const layerOpacity = (t: number, idx: number) => Math.max(0, 1 - Math.abs(t - idx) * 1.1);

function Wafer({ data }: { data: Data }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.BoxGeometry(1.6, 1.6, 0.3), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.5, transparent: true }), []);
  useEffect(() => {
    const im = ref.current; if (!im) return; const d = new THREE.Object3D(), white = new THREE.Color(1, 1, 1);
    data.dies.forEach((die, i) => { d.position.set((die.col - 3.5) * 2.1, (die.row - 3.5) * 2.1, 0); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, white); });
    im.instanceMatrix.needsUpdate = true;
  }, [data]);
  useFrame(() => {
    const im = ref.current; if (!im || !im.instanceColor) return; const col = new THREE.Color(), s = state;
    data.dies.forEach((die, i) => {
      const c = s.mode === "yield" ? (die.defective ? col.set("#FF46A2") : col.set("#5EF1D2")) : die.defective ? col.set("#3a2a30") : col.set("#161A20");
      im.setColorAt(i, c);
    });
    im.instanceColor.needsUpdate = true;
    const op = layerOpacity(s.t, 0); mat.opacity = op; im.visible = op > 0.02;
  });
  return <instancedMesh ref={ref} args={[geo, mat, data.dies.length]} />;
}

function DieBlock() {
  const gltf = useLoader(GLTFLoader, `${base}/models/die-block.glb`);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { const op = layerOpacity(state.t, 1); if (ref.current) { ref.current.visible = op > 0.02; ref.current.scale.setScalar(8); } });
  return <group ref={ref}><primitive object={scene} /></group>;
}

const traceVert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const traceFrag = /* glsl */ `uniform float uOp; uniform float uPower; varying vec2 vUv;
void main(){ vec3 copper = vec3(0.85,0.5,0.26); vec3 live = vec3(0.37,0.95,0.82); vec3 col = mix(copper, live, uPower); gl_FragColor = vec4(col, uOp); }`;

function Interconnects({ data }: { data: Data }) {
  const group = useMemo(() => data.cells.filter((_, i) => i % 3 === 0).map((c) => {
    const geo = new THREE.BoxGeometry(2.6, 0.08, 0.08);
    const mat = new THREE.ShaderMaterial({ transparent: true, vertexShader: traceVert, fragmentShader: traceFrag, uniforms: { uOp: { value: 0 }, uPower: { value: cellCurrentMa(c.col, c.row) / 200 } } });
    return { mat, geo, pos: [(c.col - 2.5) * 1.6, (c.row - 2.5) * 1.6, 0.3] as [number, number, number], rot: c.row % 2 === 0 ? 0 : Math.PI / 2 };
  }), [data]);
  useFrame(() => { const op = layerOpacity(state.t, 2) * (state.mode === "power" ? 1 : 0.6); group.forEach((g) => { g.mat.uniforms.uOp.value = op; g.mat.uniforms.uPower.value = state.mode === "power" ? g.mat.uniforms.uPower.value : 0; }); });
  return <>{group.map((g, i) => <mesh key={i} geometry={g.geo} material={g.mat} position={g.pos} rotation={[0, 0, g.rot]} />)}</>;
}

function Cells({ data }: { data: Data }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.BoxGeometry(0.5, 0.5, 0.2), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.4, transparent: true }), []);
  useEffect(() => {
    const im = ref.current; if (!im) return; const d = new THREE.Object3D(), white = new THREE.Color(1, 1, 1);
    data.cells.forEach((c, i) => { d.position.set((c.col - 2.5) * 0.65, (c.row - 2.5) * 0.65, 0.4); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, white); });
    im.instanceMatrix.needsUpdate = true;
  }, [data]);
  useFrame(() => {
    const im = ref.current; if (!im || !im.instanceColor) return; const col = new THREE.Color(), s = state;
    data.cells.forEach((c, i) => { const heat = Math.min(1, (c.thermalC - 45) / 80); im.setColorAt(i, s.mode === "thermal" ? col.setHSL(0.6 - heat * 0.6, 0.9, 0.5) : col.set("#2a2f3a")); });
    im.instanceColor.needsUpdate = true;
    const op = layerOpacity(s.t, 4); mat.opacity = op; im.visible = op > 0.02;
  });
  return <instancedMesh ref={ref} args={[geo, mat, data.cells.length]} />;
}

function Lattice() {
  const gltf = useLoader(GLTFLoader, `${base}/models/lattice-cell.glb`);
  const siteGeo = useMemo(() => { let m: THREE.Mesh | null = null; gltf.scene.traverse((o) => { if (!m && o.name === "LatticeSite" && (o as THREE.Mesh).isMesh) m = o as THREE.Mesh; }); return (m as unknown as THREE.Mesh).geometry; }, [gltf]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 6;
  useEffect(() => {
    const im = ref.current; if (!im) return; const d = new THREE.Object3D(); let i = 0;
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < 3; z++) { d.position.set((x - N / 2) * 0.3, (y - N / 2) * 0.3, z * 0.3); d.updateMatrix(); im.setMatrixAt(i++, d.matrix); }
    im.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame(() => { const op = layerOpacity(state.t, 6); const im = ref.current; if (im) { im.visible = op > 0.02; (im.material as THREE.MeshStandardMaterial).opacity = op; } });
  return <instancedMesh ref={ref} args={[siteGeo, new THREE.MeshStandardMaterial({ color: "#5EF1D2", emissive: "#5EF1D2", emissiveIntensity: 0.6, transparent: true }), N * N * 3]} />;
}

function Rig() {
  const { camera } = useThree(), want = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const s = state, zoom = s.introDone ? s.t : live.scan;
    const dist = THREE.MathUtils.lerp(38, 1.6, zoom / 6);
    want.set(0, -dist * 0.35, dist);
    const k = s.reduced ? 1 : 1 - Math.exp(-dt * 2.4);
    camera.position.lerp(want, k); (camera as THREE.PerspectiveCamera).lookAt(0, 0, 0.1);
  });
  return null;
}

function Lifecycle() {
  const { setFrameloop, gl } = useThree();
  useEffect(() => {
    const vis = () => setFrameloop(document.hidden ? "never" : "always");
    const lost = (e: Event) => e.preventDefault();
    document.addEventListener("visibilitychange", vis); gl.domElement.addEventListener("webglcontextlost", lost);
    return () => { document.removeEventListener("visibilitychange", vis); gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [setFrameloop, gl]);
  return null;
}

declare global { interface Window { __cascadeData?: Data; __cascadeStats?: () => unknown } }
function Stats() {
  const gl = useThree((s) => s.gl);
  useEffect(() => { window.__cascadeStats = () => ({ calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures }); }, [gl]);
  return null;
}

export default function Scene({ data }: { data: Data }) {
  useStore();
  window.__cascadeData = data;
  return (
    <Canvas className="stage" data-testid="stage" dpr={[1, 1.5]} camera={{ fov: 48, near: 0.05, far: 200, position: [0, -13, 38] }} gl={{ antialias: false, powerPreference: "high-performance" }} onCreated={({ gl }) => gl.setClearColor("#08090B")}>
      <ambientLight intensity={0.5} color="#7457FF" /><directionalLight position={[10, -10, 20]} intensity={1.6} color="#E9F4FA" />
      <Rig /><Wafer data={data} /><DieBlock /><Interconnects data={data} /><Cells data={data} /><Lattice /><Lifecycle /><Stats />
    </Canvas>
  );
}
