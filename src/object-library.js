import * as THREE from 'three';

const C = {
  wood: 0x9a7352, darkWood: 0x5f4634, fabric: 0x647486, metal: 0x78838d,
  white: 0xd8d7d0, glass: 0x91bad0, green: 0x66866b, black: 0x252a30,
  warm: 0xd8b36a, ceramic: 0xc9cbc8, book: 0x8b5960
};

const mat = (color=C.wood, opts={}) => new THREE.MeshStandardMaterial({color, roughness:.72, metalness:0, ...opts});
const box = (g,w,h,d,x=0,y=h/2,z=0,color=C.wood) => { const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color)); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; g.add(m); return m; };
const cyl = (g,r,h,x=0,y=h/2,z=0,color=C.wood,segments=12) => { const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m; };
const sphere = (g,r,x=0,y=r,z=0,color=C.wood) => { const m=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),mat(color));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m; };

function furniture(kind,p){
 const g=new THREE.Group(); const w=p.w||1, h=p.h||.8, d=p.d||.5;
 const legs=(height=.7)=>{for(const x of [-w/2+.06,w/2-.06])for(const z of [-d/2+.06,d/2-.06])box(g,.07,height,.07,x,height/2,z,C.darkWood)};
 if(kind==='table'){box(g,w,.06,d,0,h-.03,0);legs(h-.06)}
 else if(kind==='roundTable'){const top=cyl(g,w/2,.06,0,h-.03,0);cyl(g,.07,h-.06,0,(h-.06)/2,0,C.darkWood);cyl(g,.3,.04,0,.02,0,C.darkWood)}
 else if(kind==='chair'){box(g,.45,.05,.45,0,.48,0);for(const x of [-.18,.18])for(const z of [-.18,.18])box(g,.05,.46,.05,x,.23,z,C.darkWood);box(g,.45,.55,.05,0,.75,.2,C.wood)}
 else if(kind==='stool'){cyl(g,.24,.06,0,.55,0);for(const x of [-.15,.15])for(const z of [-.15,.15])box(g,.045,.52,.045,x,.26,z,C.darkWood)}
 else if(['shelf','bookcase'].includes(kind)){box(g,.05,h,d,-w/2+.025,h/2,0);box(g,.05,h,d,w/2-.025,h/2,0);for(let i=0;i<=p.shelves;i++)box(g,w,.04,d,0,.02+i*(h-.04)/p.shelves,0);if(kind==='bookcase')for(let i=0;i<10;i++)box(g,.055,.25,.18,-w*.38+(i%5)*.14,.17+Math.floor(i/5)*.38,d*.15,[C.book,0x667d8c,0x8d704e][i%3])}
 else if(['wardrobe','cabinet','nightstand','desk','dresser'].includes(kind)){
   box(g,w,h,d,0,h/2,0,C.wood); box(g,w-.06,h-.08,.025,0,h/2,d/2+.014,C.darkWood);
   const drawers=p.drawers||0; if(drawers){for(let i=0;i<drawers;i++){const dh=(h-.12)/drawers;box(g,w-.09,dh-.025,.035,0,.07+dh*(i+.5),d/2+.035,C.wood);sphere(g,.025,w*.32,.07+dh*(i+.5),d/2+.07,C.metal)}}
   if(kind==='desk'){g.clear();box(g,w,.06,d,0,h-.03,0);for(const x of [-w/2+.06,w/2-.06])box(g,.08,h-.06,d*.8,x,(h-.06)/2,0,C.darkWood)}
 }
 else if(kind==='bench'){box(g,w,.07,d,0,h,0);legs(h)}
 else if(kind==='sofa'||kind==='armchair'){const sw=kind==='armchair'? .8:w;box(g,sw,.35,d,0,.35,0,C.fabric);box(g,sw,.65,.16,0,.72,-d/2+.08,C.fabric);box(g,.14,.48,d, -sw/2+.07,.43,0,C.fabric);box(g,.14,.48,d, sw/2-.07,.43,0,C.fabric)}
 else if(kind==='bed'){box(g,w,.32,d,0,.32,0,C.fabric);box(g,w,.08,d*.92,0,.52,0,C.white);box(g,w,.72,.08,0,.48,-d/2+.04,C.wood)}
 else if(kind==='pedestal'){box(g,w,h,d,0,h/2,0,C.white)}
 return g;
}

function architecture(kind,p){const g=new THREE.Group(),w=p.w||1,h=p.h||2.1,d=p.d||.12;
 if(kind==='door'||kind==='doubleDoor'){box(g,w,h,.06,0,h/2,0,C.darkWood);const leaves=kind==='doubleDoor'?2:1;for(let i=1;i<leaves;i++)box(g,.025,h,.08,0,h/2,.02,C.black);sphere(g,.035,w*.36,h*.5,.07,C.metal)}
 else if(kind==='window'||kind==='doubleWindow'){box(g,w,.05,d,0,.025,0,C.white);box(g,w,.05,d,0,h-.025,0,C.white);box(g,.05,h,d,-w/2+.025,h/2,0,C.white);box(g,.05,h,d,w/2-.025,h/2,0,C.white);const panes=kind==='doubleWindow'?2:1;if(panes===2)box(g,.05,h,d,0,h/2,0,C.white);const glass=box(g,w-.09,h-.09,.012,0,h/2,0,C.glass);glass.material.transparent=true;glass.material.opacity=.35}
 else if(kind==='arch'){box(g,.16,h,.18,-w/2+.08,h/2,0,C.white);box(g,.16,h,.18,w/2-.08,h/2,0,C.white);box(g,w,.16,.18,0,h-.08,0,C.white)}
 else if(kind==='stairs'){const n=p.steps||8;for(let i=0;i<n;i++)box(g,w,(i+1)*h/n,d/n,0,(i+1)*h/(2*n),-d/2+(i+.5)*d/n,C.white)}
 else if(kind==='railing'){box(g,.05,h,.05,-w/2,h/2,0,C.metal);box(g,.05,h,.05,w/2,h/2,0,C.metal);box(g,w,.05,.05,0,h,0,C.metal);for(let x=-w/2+.25;x<w/2;x+=.25)box(g,.025,h,.025,x,h/2,0,C.metal)}
 else if(kind==='column'){cyl(g,w/2,h,0,h/2,0,C.white,16)}
 return g;}

function prop(kind,p){const g=new THREE.Group(),w=p.w||.5,h=p.h||.5,d=p.d||.5;
 if(kind==='box'||kind==='chest'){box(g,w,h,d,0,h/2,0,C.wood);if(kind==='chest'){box(g,w,.07,d,0,h+.035,0,C.darkWood);sphere(g,.035,0,h*.55,d/2+.035,C.metal)}}
 else if(kind==='book'){box(g,w,h,d,0,h/2,0,C.book)}
 else if(kind==='books'){for(let i=0;i<(p.count||5);i++){const b=box(g,w,h*(.85+(i%3)*.07),d,-w*2+i*w*1.03,h/2,0,[C.book,0x657d8c,0x9b7a4e][i%3]);b.rotation.z=(i%2?-.05:.04)}}
 else if(kind==='candle'){cyl(g,w/2,h,0,h/2,0,C.white,12);sphere(g,w*.18,0,h+.05,0,C.warm)}
 else if(kind==='candelabra'){cyl(g,.06,h*.55,0,h*.275,0,C.metal);for(const x of [-w/2,0,w/2]){box(g,.035,h*.25,.035,x,h*.62,0,C.metal);cyl(g,.035,h*.28,x,h*.86,0,C.white);sphere(g,.025,x,h+0.02,0,C.warm)}box(g,w,.035,.035,0,h*.62,0,C.metal)}
 else if(kind==='lamp'){cyl(g,w*.22,h*.5,0,h*.25,0,C.metal);const shade=new THREE.Mesh(new THREE.CylinderGeometry(w*.35,w*.5,h*.38,16),mat(C.warm));shade.position.y=h*.72;g.add(shade)}
 else if(kind==='frame'||kind==='mirror'){box(g,w,h,.04,0,h/2,0,kind==='mirror'?C.glass:C.darkWood);if(kind==='frame')box(g,w*.86,h*.84,.045,0,h/2,.02,C.warm)}
 else if(kind==='rug'){box(g,w,.02,d,0,.01,0,C.fabric)}
 else if(kind==='pot'||kind==='vase'){const m=new THREE.Mesh(new THREE.CylinderGeometry(w*.28,w*.45,h,12),mat(C.ceramic));m.position.y=h/2;g.add(m)}
 else if(kind==='plant'){cyl(g,w*.3,h*.3,0,h*.15,0,C.ceramic);for(let i=0;i<7;i++){const leaf=sphere(g,w*.18,Math.sin(i)*w*.2,h*.45+(i%3)*h*.14,Math.cos(i)*w*.2,C.green);leaf.scale.set(.65,1.8,.5)}}
 else if(kind==='clock'){cyl(g,w/2,d,0,h/2,0,C.white,24);const face=box(g,w*.04,h*.32,.015,0,h/2,d/2, C.black);face.rotation.z=.4}
 else if(kind==='curtain'){box(g,w,h,.025,0,h/2,0,C.fabric);cyl(g,.025,w,0,h+.06,0,C.metal);g.children.at(-1).rotation.z=Math.PI/2}
 else if(kind==='coatRack'){cyl(g,.035,h,0,h/2,0,C.darkWood);for(let i=0;i<6;i++){const a=i*Math.PI/3;const arm=box(g,.28,.025,.025,Math.cos(a)*.12,h*.78,Math.sin(a)*.12,C.darkWood);arm.rotation.y=-a}}
 return g;}

function appliance(kind,p){const g=new THREE.Group(),w=p.w||.7,h=p.h||.7,d=p.d||.45;
 if(kind==='tv'){box(g,w,h,.06,0,h/2,0,C.black);box(g,.08,.25,.08,0,-.125,0,C.metal);box(g,.4,.03,.22,0,-.24,0,C.metal)}
 else if(kind==='laptop'){box(g,w,.035,d,0,.02,0,C.metal);const s=box(g,w,h,.035,0,h/2,-d/2,C.black);s.rotation.x=-.12}
 else if(kind==='computer'){box(g,w,h,d,0,h/2,0,C.black);box(g,w*.6,h*.55,.03,0,h*.65,d/2+.02,C.glass)}
 else if(['fridge','microwave','washer'].includes(kind)){box(g,w,h,d,0,h/2,0,kind==='microwave'?C.black:C.white);if(kind==='washer')cyl(g,w*.27,.035,0,h*.52,d/2+.02,C.black,24).rotation.x=Math.PI/2;if(kind==='fridge')box(g,w*.9,.025,.03,0,h*.46,d/2+.02,C.metal)}
 else if(kind==='ceilingFan'){cyl(g,.05,h*.35,0,h*.8,0,C.metal);for(let i=0;i<4;i++){const blade=box(g,w*.55,.025,.13,0,h*.65,0,C.darkWood);blade.rotation.y=i*Math.PI/2;blade.position.x=Math.cos(i*Math.PI/2)*w*.25;blade.position.z=Math.sin(i*Math.PI/2)*w*.25}}
 else if(kind==='pendant'){cyl(g,.025,h*.6,0,h*.7,0,C.black);const sh=new THREE.Mesh(new THREE.ConeGeometry(w*.3,h*.25,14,1,true),mat(C.metal));sh.position.y=h*.35;g.add(sh);sphere(g,.08,0,h*.27,0,C.warm)}
 else if(kind==='sink'){box(g,w,h*.55,d,0,h*.275,0,C.white);const basin=cyl(g,w*.3,.08,0,h*.6,0,C.glass,20);box(g,.04,h*.25,.04,0,h*.72,-d*.2,C.metal)}
 else if(kind==='toilet'){box(g,w*.5,h*.75,d*.35,0,h*.38,-d*.2,C.white);cyl(g,w*.34,h*.22,0,h*.2,d*.08,C.white,20)}
 return g;}

function primitive(kind,p){const g=new THREE.Group();let mesh;const material=mat(0x8aa0b5);switch(kind){case'cube':mesh=new THREE.Mesh(new THREE.BoxGeometry(p.w||1,p.h||1,p.d||1),material);mesh.position.y=(p.h||1)/2;break;case'cylinder':mesh=new THREE.Mesh(new THREE.CylinderGeometry((p.w||1)/2,(p.w||1)/2,p.h||1,16),material);mesh.position.y=(p.h||1)/2;break;case'sphere':mesh=new THREE.Mesh(new THREE.SphereGeometry((p.w||1)/2,16,10),material);mesh.position.y=(p.w||1)/2;break;case'cone':mesh=new THREE.Mesh(new THREE.ConeGeometry((p.w||1)/2,p.h||1,16),material);mesh.position.y=(p.h||1)/2;break;case'plane':mesh=new THREE.Mesh(new THREE.BoxGeometry(p.w||1,.02,p.d||1),material);mesh.position.y=.01;break;case'capsule':mesh=new THREE.Mesh(new THREE.CapsuleGeometry((p.w||.5)/2,Math.max(.01,(p.h||1.5)-(p.w||.5)),8,16),material);mesh.position.y=(p.h||1.5)/2;break;case'tube':mesh=new THREE.Mesh(new THREE.TorusGeometry((p.w||1)/2,(p.d||.1)/2,8,24),material);mesh.rotation.x=Math.PI/2;mesh.position.y=(p.h||1)/2;break;}if(mesh){mesh.castShadow=mesh.receiveShadow=true;g.add(mesh)}return g;}

export const catalog = [
 ['Arquitectura','Puerta simple','door',architecture,{w:.9,h:2.1,d:.12}],['Arquitectura','Puerta doble','doubleDoor',architecture,{w:1.6,h:2.1,d:.12}],['Arquitectura','Ventana simple','window',architecture,{w:1.2,h:1.1,d:.12}],['Arquitectura','Ventana doble','doubleWindow',architecture,{w:1.8,h:1.1,d:.12}],['Arquitectura','Arco / abertura','arch',architecture,{w:1.2,h:2.2,d:.18}],['Arquitectura','Escalera recta','stairs',architecture,{w:1,h:1.8,d:2.6,steps:10}],['Arquitectura','Baranda simple','railing',architecture,{w:2,h:.9,d:.08}],['Arquitectura','Columna','column',architecture,{w:.35,h:2.6,d:.35}],
 ['Muebles','Mesa rectangular','table',furniture,{w:1.4,h:.76,d:.75}],['Muebles','Mesa redonda','roundTable',furniture,{w:1,h:.76,d:1}],['Muebles','Silla simple','chair',furniture,{w:.45,h:.95,d:.45}],['Muebles','Banqueta','stool',furniture,{w:.5,h:.58,d:.5}],['Muebles','Escritorio','desk',furniture,{w:1.4,h:.75,d:.65}],['Muebles','Biblioteca abierta','shelf',furniture,{w:1.1,h:1.9,d:.32,shelves:5}],['Muebles','Estantería','shelf',furniture,{w:1.4,h:1.8,d:.4,shelves:4}],['Muebles','Armario dos puertas','wardrobe',furniture,{w:1.2,h:2,d:.55}],['Muebles','Cajonera','dresser',furniture,{w:.9,h:1,d:.48,drawers:4}],['Muebles','Gabinete bajo','cabinet',furniture,{w:1.2,h:.8,d:.48,drawers:2}],['Muebles','Mesita de luz','nightstand',furniture,{w:.5,h:.58,d:.42,drawers:2}],['Muebles','Pedestal','pedestal',furniture,{w:.45,h:1,d:.45}],['Muebles','Banco','bench',furniture,{w:1.2,h:.46,d:.4}],['Muebles','Sofá','sofa',furniture,{w:1.9,h:.9,d:.8}],['Muebles','Cama simple','bed',furniture,{w:.9,h:.8,d:1.95}],['Muebles','Cama doble','bed',furniture,{w:1.5,h:.8,d:2}],['Muebles','Sillón','armchair',furniture,{w:.8,h:.9,d:.8}],['Muebles','Silla de oficina','chair',furniture,{w:.5,h:1,d:.5}],['Muebles','Biblioteca con libros','bookcase',furniture,{w:1.1,h:1.9,d:.32,shelves:5}],
 ['Props','Caja','box',prop,{w:.5,h:.4,d:.5}],['Props','Cofre','chest',prop,{w:.8,h:.55,d:.5}],['Props','Libro','book',prop,{w:.18,h:.035,d:.25}],['Props','Pila de libros','books',prop,{w:.12,h:.22,d:.18,count:5}],['Props','Vela','candle',prop,{w:.08,h:.3,d:.08}],['Props','Candelabro','candelabra',prop,{w:.5,h:.55,d:.2}],['Props','Lámpara de mesa','lamp',prop,{w:.35,h:.55,d:.35}],['Props','Cuadro / marco','frame',prop,{w:.7,h:.9,d:.05}],['Props','Espejo','mirror',prop,{w:.65,h:1,d:.05}],['Props','Alfombra','rug',prop,{w:1.5,h:.02,d:2}],['Props','Maceta simple','pot',prop,{w:.4,h:.4,d:.4}],['Props','Jarrón','vase',prop,{w:.32,h:.55,d:.32}],['Props','Planta decorativa','plant',prop,{w:.55,h:1,d:.55}],['Props','Reloj de pared','clock',prop,{w:.45,h:.45,d:.08}],['Props','Cortina simple','curtain',prop,{w:1.5,h:2,d:.05}],['Props','Perchero','coatRack',prop,{w:.7,h:1.8,d:.7}],
 ['Electro','TV','tv',appliance,{w:1,h:.6,d:.12}],['Electro','Laptop','laptop',appliance,{w:.36,h:.25,d:.25}],['Electro','Computadora','computer',appliance,{w:.42,h:.5,d:.42}],['Electro','Heladera','fridge',appliance,{w:.72,h:1.8,d:.7}],['Electro','Microondas','microwave',appliance,{w:.52,h:.3,d:.4}],['Electro','Lavarropas','washer',appliance,{w:.6,h:.85,d:.62}],['Electro','Ventilador de techo','ceilingFan',appliance,{w:1.3,h:.5,d:1.3}],['Electro','Lámpara colgante','pendant',appliance,{w:.5,h:1,d:.5}],['Electro','Pileta / lavabo','sink',appliance,{w:.65,h:.85,d:.5}],['Electro','Inodoro','toilet',appliance,{w:.55,h:.8,d:.75}],
 ['Primitivos','Caja primitiva','cube',primitive,{w:1,h:1,d:1}],['Primitivos','Cilindro','cylinder',primitive,{w:1,h:1,d:1}],['Primitivos','Esfera','sphere',primitive,{w:1,h:1,d:1}],['Primitivos','Cono','cone',primitive,{w:1,h:1.2,d:1}],['Primitivos','Plano','plane',primitive,{w:1,h:.02,d:1}],['Primitivos','Cápsula','capsule',primitive,{w:.5,h:1.5,d:.5}],['Primitivos','Tubo / aro','tube',primitive,{w:1,h:1,d:.12}]
].map(([category,name,type,factory,defaults])=>({category,name,type,factory,defaults}));

export function createCatalogObject(def, overrides={}) {
  const params={...def.defaults,...overrides};
  const group=def.factory(def.type,params);
  group.userData.params=params;
  group.userData.catalogType=def.type;
  return group;
}
