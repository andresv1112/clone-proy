import { workoutApi } from './api'
import type { Workout, CreateWorkoutRequest, ApiResponse } from '../types'

export const workoutService = {
  async getWorkouts(params?: { 
    q?: string
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }): Promise<{
    workouts: Workout[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const searchParams = new URLSearchParams()
    if (params?.q) searchParams.append('q', params.q)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)
    
    const response = await workoutApi.get<ApiResponse<{
      workouts: Workout[]
      pagination: any
    }>>(`/api/workouts?${searchParams}`)
    return response.data.data
  },

  async getWorkout(id: number): Promise<Workout> {
    const response = await workoutApi.get<ApiResponse<Workout>>(`/api/workouts/${id}`)
    return response.data.data
  },

  async createWorkout(workout: CreateWorkoutRequest): Promise<Workout> {
    const response = await workoutApi.post<ApiResponse<Workout>>('/api/workouts', workout)
    return response.data.data
  },

  async updateWorkout(id: number, workout: Partial<{
    completedAt?: string
    duration?: number
    notes?: string
  }>): Promise<Workout> {
    const response = await workoutApi.put<ApiResponse<Workout>>(`/api/workouts/${id}`, workout)
    return response.data.data
  },

  async deleteWorkout(id: number): Promise<void> {
    await workoutApi.delete(`/api/workouts/${id}`)
  },

  async getStats(period?: number): Promise<{
    totalWorkouts: number
    completedWorkouts: number
    incompleteWorkouts: number
    totalSets: number
    totalReps: number
    totalWeightLifted: number
    avgDurationMinutes: number
    recentWorkouts: number
    period: string
  }> {
    const params = period ? `?period=${period}` : ''
    const response = await workoutApi.get<ApiResponse<any>>(`/api/workouts/stats${params}`)
    return response.data.data
  },

  async getExerciseStats(period?: number): Promise<{
    exercises: Array<{
      exerciseId: number
      exerciseName: string
      totalSets: number
      totalReps: number
      totalWeight: number
      avgWeight: number
      maxWeight: number
    }>
    period: string
  }> {
    const params = period ? `?period=${period}` : ''
    const response = await workoutApi.get<ApiResponse<any>>(`/api/workouts/stats/exercises${params}`)
    return response.data.data
  },

  async getExerciseProgress(exerciseId: number, limit?: number): Promise<{
    exerciseId: number
    progress: Array<{
      date: string
      routineName: string
      weight: number
      reps: number
      volume: number
    }>
  }> {
    const params = limit ? `?limit=${limit}` : ''
    const response = await workoutApi.get<ApiResponse<any>>(`/api/workouts/progress/${exerciseId}${params}`)
    return response.data.data
  },

  async getRecentWorkouts(): Promise<Array<{
    id: number
    routineName: string
    startedAt: string
    completedAt?: string
    duration?: number
    totalSets: number
    exercises: string[]
    isCompleted: boolean
  }>> {
    const response = await workoutApi.get<ApiResponse<any>>('/api/workouts/recent')
    return response.data.data
  }
}