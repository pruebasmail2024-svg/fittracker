const LONG_DATE = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const SHORT_DATE = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

// Formato compacto para ejes de gráficos: "15 ene"
const CHART_DATE = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

export const formatDateLong  = (iso) => LONG_DATE.format(new Date(iso))
export const formatDateShort = (iso) => SHORT_DATE.format(new Date(iso))
export const formatDateChart = (iso) => CHART_DATE.format(new Date(iso))
