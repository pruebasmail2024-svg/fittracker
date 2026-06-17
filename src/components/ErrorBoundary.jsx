import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-slate-950 px-6 text-center gap-4">
        <p className="text-slate-200 text-base font-medium">
          Algo salió mal al abrir la app
        </p>
        <p className="text-slate-500 text-sm">
          {this.state.error?.message ?? 'Error inesperado'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Recargar
        </button>
      </div>
    )
  }
}
