# PROPUESTA — Repositorio de ejercicios (catálogo dinámico)

Objetivo: reemplazar los 12 ejercicios hardcodeados por un catálogo extenso y
filtrable, para que el usuario elija el ejercicio según el equipo que tiene
disponible (barra, mancuernas, máquina, polea, peso corporal, etc.).

> ⚠️ Esto es una **PROPUESTA**. No toca nada del código actual de la app
> (`src/data/workoutPlan.js` ni `homeExercises.js`). Es una carpeta aparte para
> que valides el enfoque antes de integrarlo.

---

## Qué hay acá

```
PROPUESTA/
├── README.md                  # este archivo
├── catalogo-ejercicios.md     # catálogo legible: ejercicio → músculo → gif → filtros
├── ejercicios.json            # mismo catálogo, listo para consumir desde la app
└── gifs/                      # 41 GIFs optimizados (mismo formato que /public/exercises)
    ├── sentadilla-con-barra.gif
    ├── press-de-banca-con-barra.gif
    └── ... (41 en total)
```

---

## De dónde salen los GIFs

Fuente: **[free-exercise-db](https://github.com/yuhonas/free-exercise-db)**,
una base de datos de ~870 ejercicios liberada bajo **The Unlicense (dominio
público)**. Se puede copiar, modificar y usar sin restricciones ni atribución
obligatoria. Aporta, por cada ejercicio:

- Metadata estructurada: equipo, músculo primario/secundario, mecánica, nivel.
- Dos fotos: posición de inicio y posición final del movimiento.

A partir de esas dos fotos se genera un **GIF de movimiento fluido**: se
interpolan frames intermedios entre la posición de inicio y la final, y el
loop va y vuelve (ida y vuelta), de modo que se ve como una animación real
del ejercicio.

## Pipeline de generación (reproducible)

Cada GIF se genera con ImageMagick + ffmpeg:

1. Escalar cada foto a 400 px de ancho y recortar centrado a **400×225**
   (16:9, idéntico a tus GIFs actuales).
2. Corte duro entre las 2 posiciones y suavizado con interpolación de
   movimiento (`ffmpeg minterpolate`, motion-compensated, 15 fps).
3. Loop ida-y-vuelta (forward + reverse) para que cicle sin saltos.
4. GIF con paleta optimizada (64 colores, dither bayer).

Resultado: **121–175 KB por GIF** (promedio ~143 KB), contra los
328 KB – 1.2 MB de los GIFs actuales. Los 41 ejercicios juntos pesan ~5.9 MB
(menos que 6 de los GIFs viejos). Comprimen muy bien porque los frames
interpolados son casi idénticos entre sí y el fondo es estático.

> El script de generación quedó parametrizado: agregar un ejercicio nuevo es
> sumar una línea `(id, nombre, músculo, id-fuente)` y volver a correr.

---

## Cómo se integraría a la app (cuando valides)

1. Mover los GIFs de `PROPUESTA/gifs/` a `public/exercises/`.
2. Importar `ejercicios.json` como catálogo único.
3. En la pantalla de armado de rutina, exponer filtros por:
   `musculo`, `equipo` y `lugar` (gimnasio / casa).
4. El `id` de cada ejercicio sirve como `exerciseId` para el historial
   unificado que ya usás (`useExerciseHistory`).
