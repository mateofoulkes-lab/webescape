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
  const response = await fetch(appUrl.href + '?hotfix=041');
  if (!response.ok) throw new Error(`No se pudo cargar app.js (${response.status})`);
  let source = await response.text();

  // v0.4.1 hotfix: an accidental optional-chain token made the whole module fail to parse.
  source = source.replaceAll('selected?.38', 'selected ? .38');

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
