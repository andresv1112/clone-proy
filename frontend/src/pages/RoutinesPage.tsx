import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { routineService } from '../services/routineService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { Plus, Search, Edit, Trash2, Copy, Play } from 'lucide-react'

const RoutinesPage: React.FC = () => {
  const [routines, setRoutines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    loadRoutines()
  }, [pagination.page, searchQuery])

  const loadRoutines = async () => {
    try {
      setIsLoading(true)
      const data = await routineService.getRoutines({
        q: searchQuery || undefined,
        page: pagination.page,
        limit: pagination.limit
      })
      setRoutines(data.routines)
      setPagination(prev => ({ ...prev, ...data.pagination }))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las rutinas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    loadRoutines()
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la rutina "${name}"?`)) {
      return
    }

    try {
      await routineService.deleteRoutine(id)
      loadRoutines()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar la rutina')
    }
  }

  const handleDuplicate = async (id: number, originalName: string) => {
    const newName = prompt(`Nombre para la copia de "${originalName}":`, `${originalName} (Copia)`)
    if (!newName) return

    try {
      await routineService.duplicateRoutine(id, newName)
      loadRoutines()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al duplicar la rutina')
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Mis Rutinas</h1>
          <Link to="/routines/new" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Rutina
          </Link>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar rutinas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-secondary">
            Buscar
          </button>
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadRoutines} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : routines.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <div key={routine.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{routine.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{routine.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {routine.exercises?.length || 0} ejercicios
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Creada el {new Date(routine.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <Link
                    to={`/workout/start/${routine.id}`}
                    className="btn-primary text-sm flex items-center"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Entrenar
                  </Link>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/routines/${routine.id}`}
                      className="text-gray-400 hover:text-primary-600"
                      title="Ver detalles"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(routine.id, routine.name)}
                      className="text-gray-400 hover:text-blue-600"
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(routine.id, routine.name)}
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
          <div className="text-6xl mb-4">🏋️‍♂️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No se encontraron rutinas' : 'No tienes rutinas creadas'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea tu primera rutina para comenzar a entrenar'
            }
          </p>
          {!searchQuery && (
            <Link to="/routines/new" className="btn-primary">
              Crear Mi Primera Rutina
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default RoutinesPage