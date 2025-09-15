import { routineApi } from './api'
import type { Routine, CreateRoutineRequest, ApiResponse } from '../types'

export const routineService = {
  async getRoutines(params?: { q?: string; page?: number; limit?: number }): Promise<{
    routines: Routine[]
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
    
    const response = await routineApi.get<ApiResponse<{
      routines: Routine[]
      pagination: any
    }>>(`/api/routines?${searchParams}`)
    return response.data.data
  },

  async getRoutine(id: number): Promise<Routine> {
    const response = await routineApi.get<ApiResponse<Routine>>(`/api/routines/${id}`)
    return response.data.data
  },

  async createRoutine(routine: CreateRoutineRequest): Promise<Routine> {
    const response = await routineApi.post<ApiResponse<Routine>>('/api/routines', routine)
    return response.data.data
  },

  async updateRoutine(id: number, routine: Partial<CreateRoutineRequest>): Promise<Routine> {
    const response = await routineApi.put<ApiResponse<Routine>>(`/api/routines/${id}`, routine)
    return response.data.data
  },

  async deleteRoutine(id: number): Promise<void> {
    await routineApi.delete(`/api/routines/${id}`)
  },

  async duplicateRoutine(id: number, name: string): Promise<Routine> {
    const response = await routineApi.post<ApiResponse<Routine>>(`/api/routines/${id}/duplicate`, { name })
    return response.data.data
  },

  async getStats(): Promise<{
    totalRoutines: number
    totalExercises: number
    avgExercisesPerRoutine: string
    avgSetsPerExercise: string
  }> {
    const response = await routineApi.get<ApiResponse<any>>('/api/routines/stats')
    return response.data.data
  }
}