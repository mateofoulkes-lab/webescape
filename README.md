# WebEscape — Parametric Room Lab

Editor web experimental para construir salas de escape a partir de geometría paramétrica liviana.

## Estado actual

- Plano 2D con grilla y zoom.
- Herramienta para dibujar paredes encadenadas.
- Altura y espesor configurables.
- Inspector para editar paredes ya creadas.
- Vista 3D Three.js sincronizada con el plano.
- Cápsula humana de referencia de 1,75 m en 2D y 3D.
- Demo de habitación rectangular.

## Controles

- `W`: dibujar paredes.
- `V`: seleccionar.
- `Esc`: terminar cadena de paredes.
- `Delete`: borrar pared seleccionada.
- Rueda: zoom del plano.
- Botón central/derecho + arrastre: desplazar plano.
- En vista 3D: arrastrar para orbitar y rueda para zoom.

## Dirección del proyecto

La escena tendrá un único modelo de datos compartido entre las vistas 2D y 3D. Las paredes, aberturas, muebles y props serán entidades paramétricas, no mallas 3D estáticas.

Próximas capas previstas:

1. puertas y ventanas paramétricas sobre paredes;
2. biblioteca de muebles y props;
3. estados interactivos (abierto/cerrado, recorrido de cajones, bisagras);
4. guardado/carga de escenas;
5. manifiesto de objetos actualizable desde el repositorio;
6. modo prueba de la escape room.

## Ejecución

Servir el repositorio mediante HTTP (por ejemplo GitHub Pages o un servidor local) y abrir `index.html`. Los módulos de Three.js se cargan desde CDN.