import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const HUMAN_HEIGHT = 1.75;
const state = {
  walls: [],
  selectedId: null,
  tool: 'wall',
  drawingStart: null,
  hoverWorld: null,
  grid: 0.25,
  defaultHeight: 2.6,
  defaultThickness: 0.15,
  pan: { x: 0, y: 0 },
  zoom: 70,
  isPanning: false,
  lastMouse: null,
};

const planCanvas = document.querySelector('#planCanvas');
const ctx = planCanvas.getContext('2d');
const viewport = document.querySelector('#threeViewport');

const ui = {
  wallTool: document.querySelector('#wallToolBtn'),
  selectTool: document.querySelector('#selectToolBtn'),
  defaultHeight: document.querySelector('#defaultHeight'),
  wallThickness: document.querySelector('#wallThickness'),
  gridSize: document.querySelector('#gridSize'),
  emptyInspector: document.querySelector('#emptyInspector'),
  wallInspector: document.querySelector('#wallInspector'),
  wallNumber: document.querySelector('#wallNumber'),
  wallLength: document.querySelector('#wallLength'),
  selectedHeight: document.querySelector('#selectedHeight'),
  selectedThickness: document.querySelector('#selectedThickness'),
  deleteWall: document.querySelector('#deleteWallBtn'),
  wallCount: document.querySelector('#wallCount'),
  planStatus: document.querySelector('#planStatus'),
  demo: document.querySelector('#demoBtn'),
  newPlan: document.querySelector('#newPlanBtn'),
};

// ---------- THREE.JS ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10151b);
scene.fog = new THREE.Fog(0x10151b, 18, 40);

const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 100);
camera.position.set(7, 6, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewport.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 2;
controls.maxDistance = 30;

scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x34312d, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 2.1);
sun.position.set(4, 8, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x242a31, roughness: 0.95 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid3d = new THREE.GridHelper(30, 120, 0x495361, 0x303842);
grid3d.position.y = 0.002;
scene.add(grid3d);

const wallGroup = new THREE.Group();
scene.add(wallGroup);

function createHumanCapsule() {
  const group = new THREE.Group();
  const radius = 0.22;
  const bodyHeight = HUMAN_HEIGHT - radius * 2;
  const material = new THREE.MeshStandardMaterial({ color: 0x68b6ff, roughness: 0.45, metalness: 0.05 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, bodyHeight, 18), material);
  body.position.y = radius + bodyHeight / 2;
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 10), material);
  bottom.scale.y = 0.55;
  bottom.position.y = radius * 0.55;
  const top = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 12), material);
  top.position.y = radius + bodyHeight;
  [body, bottom, top].forEach(m => { m.castShadow = true; group.add(m); });
  group.position.set(-1.2, 0, -1.1);
  return group;
}
scene.add(createHumanCapsule());

function rebuild3D() {
  wallGroup.clear();
  for (const wall of state.walls) {
    const dx = wall.b.x - wall.a.x;
    const dz = wall.b.y - wall.a.y;
    const length = Math.hypot(dx, dz);
    if (length < 0.001) continue;
    const geometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);
    const selected = wall.id === state.selectedId;
    const material = new THREE.MeshStandardMaterial({
      color: selected ? 0xf0b85a : 0xc7cbd0,
      roughness: 0.78,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((wall.a.x + wall.b.x) / 2, wall.height / 2, (wall.a.y + wall.b.y) / 2);
    mesh.rotation.y = -Math.atan2(dz, dx);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.wallId = wall.id;
    wallGroup.add(mesh);
  }
}

function resize3D() {
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = Math.max(0.01, w / h);
  camera.updateProjectionMatrix();
}

function animate() {
  controls.update();
  resize3D();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ---------- PLAN 2D ----------
function resizeCanvas() {
  const rect = planCanvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio, 2);
  const width = Math.round(rect.width * dpr);
  const height = Math.round(rect.height * dpr);
  if (planCanvas.width !== width || planCanvas.height !== height) {
    planCanvas.width = width;
    planCanvas.height = height;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function worldToScreen(p) {
  const rect = planCanvas.getBoundingClientRect();
  return {
    x: rect.width / 2 + state.pan.x + p.x * state.zoom,
    y: rect.height / 2 + state.pan.y + p.y * state.zoom,
  };
}

function screenToWorld(x, y) {
  const rect = planCanvas.getBoundingClientRect();
  return {
    x: (x - rect.width / 2 - state.pan.x) / state.zoom,
    y: (y - rect.height / 2 - state.pan.y) / state.zoom,
  };
}

function snap(p) {
  const g = state.grid;
  return { x: Math.round(p.x / g) * g, y: Math.round(p.y / g) * g };
}

function drawGrid() {
  const rect = planCanvas.getBoundingClientRect();
  ctx.fillStyle = '#0d1116';
  ctx.fillRect(0, 0, rect.width, rect.height);

  const minor = state.grid * state.zoom;
  const step = minor < 12 ? minor * Math.ceil(12 / minor) : minor;
  const origin = worldToScreen({ x: 0, y: 0 });
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#202832';
  ctx.beginPath();
  let startX = ((origin.x % step) + step) % step;
  for (let x = startX; x < rect.width; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); }
  let startY = ((origin.y % step) + step) % step;
  for (let y = startY; y < rect.height; y += step) { ctx.moveTo(0, y); ctx.lineTo(rect.width, y); }
  ctx.stroke();

  ctx.strokeStyle = '#3b4653';
  ctx.beginPath();
  ctx.moveTo(0, origin.y); ctx.lineTo(rect.width, origin.y);
  ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, rect.height);
  ctx.stroke();
}

function drawWall2D(wall) {
  const a = worldToScreen(wall.a);
  const b = worldToScreen(wall.b);
  const selected = wall.id === state.selectedId;
  ctx.lineCap = 'round';
  ctx.strokeStyle = selected ? '#f0b85a' : '#d5dbe2';
  ctx.lineWidth = Math.max(3, wall.thickness * state.zoom);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

  ctx.fillStyle = selected ? '#ffd17f' : '#7f8c99';
  for (const p of [a, b]) { ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill(); }

  if (selected) {
    const length = wallLength(wall);
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd17f';
    ctx.fillText(`${length.toFixed(2)} m`, (a.x+b.x)/2, (a.y+b.y)/2 - 10);
  }
}

function drawHuman2D() {
  // Top-view human capsule footprint, located at the same X/Z as the 3D reference.
  const center = worldToScreen({ x: -1.2, y: -1.1 });
  const length = 0.48 * state.zoom;
  const width = 0.28 * state.zoom;
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.fillStyle = '#68b6ff';
  ctx.strokeStyle = '#b9ddff';
  ctx.lineWidth = 1.5;
  const r = width / 2;
  ctx.beginPath();
  ctx.roundRect(-length/2, -width/2, length, width, r);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#a8d6ff';
  ctx.font = '10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('H 1,75 m', 0, -width/2 - 7);
  ctx.restore();
}

function drawPreview() {
  if (!state.drawingStart || !state.hoverWorld) return;
  const a = worldToScreen(state.drawingStart);
  const b = worldToScreen(state.hoverWorld);
  ctx.strokeStyle = '#70b9ff';
  ctx.setLineDash([7, 5]);
  ctx.lineWidth = Math.max(2, state.defaultThickness * state.zoom);
  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  ctx.setLineDash([]);
  const len = Math.hypot(state.hoverWorld.x-state.drawingStart.x,state.hoverWorld.y-state.drawingStart.y);
  ctx.fillStyle='#9bd0ff';ctx.font='11px system-ui';ctx.textAlign='center';
  ctx.fillText(`${len.toFixed(2)} m`,(a.x+b.x)/2,(a.y+b.y)/2-10);
}

function renderPlan() {
  resizeCanvas();
  drawGrid();
  state.walls.forEach(drawWall2D);
  drawPreview();
  drawHuman2D();
  requestAnimationFrame(renderPlan);
}
renderPlan();

function pointerPosition(e) {
  const r = planCanvas.getBoundingClientRect();
  return { x: e.clientX-r.left, y: e.clientY-r.top };
}

function wallLength(w) { return Math.hypot(w.b.x-w.a.x,w.b.y-w.a.y); }

function distancePointSegment(p, a, b) {
  const vx=b.x-a.x, vy=b.y-a.y, wx=p.x-a.x, wy=p.y-a.y;
  const len2=vx*vx+vy*vy;
  if (!len2) return Math.hypot(wx,wy);
  const t=Math.max(0,Math.min(1,(wx*vx+wy*vy)/len2));
  return Math.hypot(p.x-(a.x+t*vx),p.y-(a.y+t*vy));
}

function pickWall(world) {
  let best=null, d=Infinity;
  for (const w of state.walls) {
    const wd=distancePointSegment(world,w.a,w.b);
    const tolerance=Math.max(w.thickness/2,7/state.zoom);
    if (wd<tolerance && wd<d) { best=w;d=wd; }
  }
  return best;
}

planCanvas.addEventListener('contextmenu',e=>e.preventDefault());
planCanvas.addEventListener('pointerdown', e => {
  const pos=pointerPosition(e);
  if (e.button===1 || e.button===2) {
    state.isPanning=true; state.lastMouse=pos; planCanvas.setPointerCapture(e.pointerId); return;
  }
  if (e.button!==0) return;
  const world=snap(screenToWorld(pos.x,pos.y));

  if (state.tool==='select') {
    const hit=pickWall(screenToWorld(pos.x,pos.y));
    selectWall(hit?.id ?? null);
    return;
  }

  if (!state.drawingStart) {
    state.drawingStart=world;
  } else {
    const length=Math.hypot(world.x-state.drawingStart.x,world.y-state.drawingStart.y);
    if (length>=state.grid/2) {
      state.walls.push({
        id: crypto.randomUUID(),
        a:{...state.drawingStart}, b:{...world},
        height:state.defaultHeight, thickness:state.defaultThickness
      });
      state.drawingStart=world;
      syncScene();
    }
  }
});

planCanvas.addEventListener('pointermove', e => {
  const pos=pointerPosition(e);
  if (state.isPanning && state.lastMouse) {
    state.pan.x+=pos.x-state.lastMouse.x; state.pan.y+=pos.y-state.lastMouse.y; state.lastMouse=pos; return;
  }
  state.hoverWorld=snap(screenToWorld(pos.x,pos.y));
});

planCanvas.addEventListener('pointerup', e => { state.isPanning=false; state.lastMouse=null; try{planCanvas.releasePointerCapture(e.pointerId)}catch{} });
planCanvas.addEventListener('pointerleave',()=>{ if(!state.isPanning) state.hoverWorld=null; });
planCanvas.addEventListener('wheel', e => {
  e.preventDefault();
  const pos=pointerPosition(e);
  const before=screenToWorld(pos.x,pos.y);
  const factor=e.deltaY<0?1.12:0.89;
  state.zoom=Math.max(25,Math.min(220,state.zoom*factor));
  const after=screenToWorld(pos.x,pos.y);
  state.pan.x+=(after.x-before.x)*state.zoom;
  state.pan.y+=(after.y-before.y)*state.zoom;
},{passive:false});

// ---------- UI ----------
function setTool(tool) {
  state.tool=tool;
  state.drawingStart=null;
  ui.wallTool.classList.toggle('active',tool==='wall');
  ui.selectTool.classList.toggle('active',tool==='select');
  ui.planStatus.textContent=tool==='wall'?'Dibujar paredes':'Seleccionar';
}

function selectWall(id) {
  state.selectedId=id;
  const wall=state.walls.find(w=>w.id===id);
  ui.emptyInspector.hidden=!!wall;
  ui.wallInspector.hidden=!wall;
  if (wall) {
    ui.wallNumber.textContent=`#${state.walls.indexOf(wall)+1}`;
    ui.wallLength.textContent=wallLength(wall).toFixed(2);
    ui.selectedHeight.value=wall.height;
    ui.selectedThickness.value=wall.thickness;
  }
  rebuild3D();
}

function syncScene() {
  ui.wallCount.textContent=state.walls.length;
  if (state.selectedId && !state.walls.some(w=>w.id===state.selectedId)) selectWall(null);
  rebuild3D();
}

ui.wallTool.addEventListener('click',()=>setTool('wall'));
ui.selectTool.addEventListener('click',()=>setTool('select'));
ui.defaultHeight.addEventListener('input',()=>state.defaultHeight=Number(ui.defaultHeight.value)||2.6);
ui.wallThickness.addEventListener('input',()=>state.defaultThickness=Number(ui.wallThickness.value)||0.15);
ui.gridSize.addEventListener('change',()=>state.grid=Number(ui.gridSize.value));

ui.selectedHeight.addEventListener('input',()=>{
  const w=state.walls.find(w=>w.id===state.selectedId); if(!w)return;
  w.height=Math.max(.5,Number(ui.selectedHeight.value)||.5); rebuild3D();
});
ui.selectedThickness.addEventListener('input',()=>{
  const w=state.walls.find(w=>w.id===state.selectedId); if(!w)return;
  w.thickness=Math.max(.05,Number(ui.selectedThickness.value)||.05); rebuild3D();
});
ui.deleteWall.addEventListener('click',()=>{
  state.walls=state.walls.filter(w=>w.id!==state.selectedId); selectWall(null); syncScene();
});

ui.newPlan.addEventListener('click',()=>{
  state.walls=[]; state.drawingStart=null; selectWall(null); syncScene();
});

ui.demo.addEventListener('click',()=>{
  state.walls=[];
  const pts=[[-3,-2.2],[3,-2.2],[3,2.2],[-3,2.2],[-3,-2.2]];
  for(let i=0;i<pts.length-1;i++) state.walls.push({id:crypto.randomUUID(),a:{x:pts[i][0],y:pts[i][1]},b:{x:pts[i+1][0],y:pts[i+1][1]},height:2.6,thickness:.15});
  state.drawingStart=null; selectWall(null); syncScene();
  controls.target.set(0,1,0); camera.position.set(7,6,8);
});

document.addEventListener('keydown',e=>{
  if (e.target.matches('input,select')) return;
  if(e.key==='Escape'){state.drawingStart=null;}
  if(e.key.toLowerCase()==='w')setTool('wall');
  if(e.key.toLowerCase()==='v')setTool('select');
  if((e.key==='Delete'||e.key==='Backspace')&&state.selectedId)ui.deleteWall.click();
});

window.addEventListener('resize',()=>{resizeCanvas();resize3D();});
state.grid=Number(ui.gridSize.value);
syncScene();
