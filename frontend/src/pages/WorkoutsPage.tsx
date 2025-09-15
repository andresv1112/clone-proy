import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { workoutService } from '../services/workoutService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { Search, Calendar, Clock, TrendingUp, Eye, Trash2 } from 'lucide-react'

type WorkoutSet = { exerciseName: string }
type Workout = {
  id: number
  routineName: string
  completedAt?: string | null
  startedAt: string
  duration?: number
  notes?: string
  sets?: WorkoutSet[]
}

type Pagination = {
  page: number
  limit: number
  total: number
  pages: number
}

type DateFilter = {
  startDate: string
  endDate: string
}

type GetWorkoutsResponse = {
  workouts: Workout[]
  pagination: Pagination
}

const WorkoutsPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: '',
    endDate: ''
  })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    loadWorkouts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, searchQuery, dateFilter])

  const loadWorkouts = async () => {
    try {
      setIsLoading(true)
      const data = (await workoutService.getWorkouts({
        q: searchQuery || undefined,
        page: pagination.page,
        limit: pagination.limit,
        startDate: dateFilter.startDate || undefined,
        endDate: dateFilter.endDate || undefined
      })) as GetWorkoutsResponse

      setWorkouts(data.workouts)
      setPagination(prev => ({ ...prev, ...data.pagination }))
      setError('')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar los entrenamientos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Solo cambiamos de página para que el useEffect dispare la carga (evita doble fetch)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDelete = async (id: number, routineName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el entrenamiento "${routineName}"?`)) return
    try {
      await workoutService.deleteWorkout(id)
      await loadWorkouts()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al eliminar el entrenamiento')
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Mis Entrenamientos</h1>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar entrenamientos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <button type="submit" className="btn-secondary">
                Buscar
              </button>
            </div>

            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha hasta
                </label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadWorkouts} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : workouts.length > 0 ? (
        <>
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {workout.routineName}
                      </h3>
                      {workout.completedAt ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          En progreso
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(workout.startedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(workout.duration)}
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {workout.sets?.length || 0} series
                      </div>
                    </div>

                    {workout.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        {workout.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Set(
                          (workout.sets ?? [])
                            .map((s) => s?.exerciseName)
                            .filter(Boolean) as string[]
                        )
                      ).map((exerciseName) => (
                        <span
                          key={exerciseName}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {exerciseName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Link
                      to={`/workouts/${workout.id}`}
                      className="text-gray-400 hover:text-primary-600"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(workout.id, workout.routineName)}
                      className="text-gray-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-2 text-sm">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || dateFilter.startDate || dateFilter.endDate
              ? 'No se encontraron entrenamientos'
              : 'No tienes entrenamientos registrados'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || dateFilter.startDate || dateFilter.endDate
              ? 'Intenta con otros filtros de búsqueda'
              : 'Inicia tu primer entrenamiento para ver el historial aquí'
            }
          </p>
          {!searchQuery && !dateFilter.startDate && !dateFilter.endDate && (
            <Link to="/routines" className="btn-primary">
              Elegir Rutina para Entrenar
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default WorkoutsPage
