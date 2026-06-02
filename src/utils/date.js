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

export const formatDateLong  = (iso) => LONG_DATE.format(new Date(iso))
export const formatDateShort = (iso) => SHORT_DATE.format(new Date(iso))
