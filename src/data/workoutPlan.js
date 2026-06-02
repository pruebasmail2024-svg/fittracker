export const WORKOUT_PLAN = [
  {
    dayIndex: 0,
    label: 'Día 1',
    focus: 'Full Body — Empuje / Tirón',
    pairs: [
      {
        exercises: [
          {
            id: 'squat',
            name: 'Sentadilla',
            gif: '/exercises/squat.gif',
            sets: 3,
            repsLabel: '8–10 reps',
            muscles: 'Cuádriceps, glúteos, isquiotibiales, core',
            cues: 'Pies a ancho de hombros, punteras levemente abiertas. Bajá hasta que los muslos queden paralelos al piso manteniendo el pecho erguido y las rodillas alineadas con los pies.',
            commonError: 'Evitá que las rodillas colapsen hacia adentro al subir.',
          },
          {
            id: 'lat-pulldown',
            name: 'Tirón en Polea',
            gif: '/exercises/lat-pulldown.gif',
            sets: 3,
            repsLabel: '8–10 reps',
            muscles: 'Dorsal ancho, bíceps, romboides',
            cues: 'Agarre un poco más ancho que los hombros. Tirá la barra hacia la clavícula inclinando levemente el torso hacia atrás, apretando los omóplatos al bajar.',
            commonError: 'No uses el impulso del cuerpo — el movimiento tiene que ser controlado.',
          },
        ],
      },
      {
        exercises: [
          {
            id: 'bench-press',
            name: 'Press de Pecho Plano',
            gif: '/exercises/bench-press.gif',
            sets: 3,
            repsLabel: '8–10 reps',
            muscles: 'Pectoral mayor, tríceps, deltoides anterior',
            cues: 'Escápulas retraídas y deprimidas contra el banco. Bajá la barra hasta rozar el pecho, codos a 45–75° del torso. Empujá en línea recta hacia arriba.',
            commonError: 'No rebotes la barra en el pecho — controlá la bajada.',
          },
          {
            id: 'farmers-walk',
            name: 'Caminata del Granjero',
            gif: '/exercises/farmers-walk.gif',
            sets: 3,
            repsLabel: '40 segundos',
            muscles: 'Trapecios, antebrazos, core, glúteos',
            cues: 'Tomá las mancuernas con agarre firme, hombros atrás y abajo, pecho erguido. Caminá a paso firme y controlado sin dejar que el torso se incline a los lados.',
            commonError: 'No encorves los hombros hacia adelante bajo la carga.',
          },
        ],
      },
    ],
  },
  {
    dayIndex: 1,
    label: 'Día 2',
    focus: 'Full Body — Posterior / Core',
    pairs: [
      {
        exercises: [
          {
            id: 'romanian-deadlift',
            name: 'Peso Muerto Rumano',
            gif: '/exercises/romanian-deadlift.gif',
            sets: 3,
            repsLabel: '10 reps',
            muscles: 'Isquiotibiales, glúteos, columna lumbar',
            cues: 'Pies a ancho de caderas, barra pegada a las piernas. Empujá las caderas hacia atrás manteniendo la espalda recta hasta sentir tensión en los isquios, luego extendé las caderas para volver.',
            commonError: 'No redondees la columna lumbar — mantené la curvatura natural.',
          },
          {
            id: 'overhead-press',
            name: 'Press Militar',
            gif: '/exercises/overhead-press.gif',
            sets: 3,
            repsLabel: '10 reps',
            muscles: 'Deltoides, tríceps, trapecio superior',
            cues: 'Barra a altura de clavícula, agarre algo más ancho que los hombros. Empujá verticalmente hasta bloquear los codos arriba, luego bajá de forma controlada al punto de partida.',
            commonError: 'No arquees la zona lumbar al empujar — apretá el core.',
          },
        ],
      },
      {
        exercises: [
          {
            id: 'barbell-row',
            name: 'Remo con Barra',
            gif: '/exercises/barbell-row.gif',
            sets: 3,
            repsLabel: '10 reps',
            muscles: 'Dorsal ancho, romboides, trapecio medio, bíceps',
            cues: 'Torso inclinado ~45°, espalda recta. Tirá la barra hacia el ombligo apretando los omóplatos en la contracción. Bajá de forma controlada hasta extender los brazos.',
            commonError: 'No uses el impulso de las caderas para levantar más peso.',
          },
          {
            id: 'plank',
            name: 'Plancha',
            gif: '/exercises/plank.gif',
            sets: 3,
            repsLabel: '45 segundos',
            muscles: 'Core (recto abdominal, transverso, oblicuos), glúteos',
            cues: 'Apoyá antebrazos y puntas de pies. Cuerpo en línea recta de cabeza a talones, caderas ni arriba ni abajo. Respirá de forma constante.',
            commonError: 'No dejes que las caderas caigan o se eleven — mantené la línea.',
          },
        ],
      },
    ],
  },
  {
    dayIndex: 2,
    label: 'Día 3',
    focus: 'Full Body — Brazos / Piernas',
    pairs: [
      {
        exercises: [
          {
            id: 'lunge',
            name: 'Estocadas',
            gif: '/exercises/lunge.gif',
            sets: 3,
            repsLabel: '10 reps por lado',
            muscles: 'Cuádriceps, glúteos, isquiotibiales, estabilizadores',
            cues: 'Paso largo hacia adelante, bajá la rodilla trasera cerca del piso sin apoyarla. Rodilla delantera no pasa la punta del pie. Volvé al centro con potencia desde el talón.',
            commonError: 'No permitas que el torso se incline hacia adelante.',
          },
          {
            id: 'incline-bench-press',
            name: 'Press Inclinado',
            gif: '/exercises/incline-bench-press.gif',
            sets: 3,
            repsLabel: '10 reps',
            muscles: 'Pectoral superior, deltoides anterior, tríceps',
            cues: 'Banco a 30–45°. Bajá la barra hasta el pecho alto (debajo de la clavícula), codos a 60° del torso. Empujá de forma controlada sin bloquear los codos.',
            commonError: 'No subas demasiado el ángulo del banco — pierde efectividad en el pecho.',
          },
        ],
      },
      {
        exercises: [
          {
            id: 'bicep-curl',
            name: 'Curl de Bíceps',
            gif: '/exercises/bicep-curl.gif',
            sets: 3,
            repsLabel: '12 reps',
            muscles: 'Bíceps braquial, braquial, braquiorradial',
            cues: 'Codos pegados al torso, sin moverse. Subí el peso supinando la muñeca y apretando el bíceps arriba. Bajá de forma controlada resistiendo la carga.',
            commonError: 'No uses el impulso de las caderas para subir el peso.',
          },
          {
            id: 'tricep-extension',
            name: 'Extensión de Tríceps',
            gif: '/exercises/tricep-extension.gif',
            sets: 3,
            repsLabel: '12 reps',
            muscles: 'Tríceps braquial (las tres cabezas)',
            cues: 'Brazos pegados a la cabeza, codos apuntando al techo. Bajá el peso detrás de la nuca de forma controlada hasta sentir el estiramiento, luego extendé completamente.',
            commonError: 'No abras los codos hacia los lados al bajar — mantenelos fijos.',
          },
        ],
      },
    ],
  },
]

// Lista plana de todos los ejercicios, útil para búsquedas
export const ALL_EXERCISES = WORKOUT_PLAN.flatMap(day =>
  day.pairs.flatMap(pair => pair.exercises)
)
