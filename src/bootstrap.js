const status2D = document.querySelector('#planStatus');
const viewport = document.querySelector('#threeViewport');

function showFatal(error) {
  console.error('WebEscape startup error:', error);
  if (status2D) status2D.textContent = 'ERROR DE ARRANQUE';
  if (viewport) {
    viewport.innerHTML = `<div style="padding:24px;color:#ff9da6;font:13px/1.5 ui-monospace,monospace;white-space:pre-wrap">WebEscape no pudo iniciar:\n\n${String(error?.stack || error)}</div>`;
  }
}

try {
  const appUrl = new URL('./app.js', import.meta.url);
  const libraryUrl = new URL('./object-library.js', import.meta.url).href;
  const response = await fetch(appUrl.href + '?hotfix=043');
  if (!response.ok) throw new Error(`No se pudo cargar app.js (${response.status})`);
  let source = await response.text();

  // Startup/compatibility hotfixes for v0.4.3.
  source = source.replaceAll('selected?.38', 'selected ? .38');

  // Three.js r168: TransformControls is itself the scene object.
  source = source.replace(
    "const transformHelper = transform.getHelper(); scene.add(transformHelper); transformHelper.visible = false;",
    "const transformHelper = transform; scene.add(transform); transform.visible = false;"
  );

  // ShapeGeometry lives in XY. Negating plan Z before the -90° X rotation maps it
  // back to world +Z, aligning floor and ceiling exactly with the 2D walls.
  source = source.replace(
    'points.forEach((p,i)=> i ? s.lineTo(p.x,p.z) : s.moveTo(p.x,p.z));',
    'points.forEach((p,i)=> i ? s.lineTo(p.x,-p.z) : s.moveTo(p.x,-p.z));'
  );

  // Report the actual hotfixed build in the UI.
  source = source.replace("const VERSION = '0.4.1';", "const VERSION = '0.4.3';");

  // A Blob module has no repository-relative base URL, so make this import absolute.
  source = source.replace("from './object-library.js'", `from '${libraryUrl}'`);

  const blobUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    await import(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
} catch (error) {
  showFatal(error);
}
