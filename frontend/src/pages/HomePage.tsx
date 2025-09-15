import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido a Fitness App
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          La aplicación completa para gestionar tus rutinas de entrenamiento, 
          registrar tus entrenamientos y seguir tu progreso.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🏋️‍♂️</div>
            <h3 className="text-lg font-semibold mb-2">Crea Rutinas</h3>
            <p className="text-gray-600">
              Diseña rutinas personalizadas con ejercicios, series y repeticiones.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-lg font-semibold mb-2">Entrena en Vivo</h3>
            <p className="text-gray-600">
              Registra pesos y repeticiones con temporizador integrado.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Seguimiento</h3>
            <p className="text-gray-600">
              Consulta tu historial y observa tu progreso a lo largo del tiempo.
            </p>
          </div>
        </div>
        
        <div className="space-x-4">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Comenzar Ahora
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                Iniciar Sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage