const axios = require('axios')

class RoutineService {
  constructor() {
    this.baseURL = process.env.ROUTINE_SERVICE_URL || 'http://localhost:3003'
  }

  // Verify that a routine exists and belongs to the user
  async verifyRoutine(routineId, userId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/routines/${routineId}`, {
        headers: {
          'Authorization': `Bearer ${this.generateTempToken(userId)}`
        }
      })
      return {
        exists: true,
        routine: response.data.data
      }
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          exists: false,
          routine: null
        }
      }
      throw error
    }
  }

  // Get routine details
  async getRoutine(routineId, userToken) {
    try {
      const response = await axios.get(`${this.baseURL}/api/routines/${routineId}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      })
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to get routine: ${error.message}`)
    }
  }

  // Generate temporary token for internal service communication
  generateTempToken(userId) {
    const jwt = require('jsonwebtoken')
    return jwt.sign(
      { userId, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    )
  }
}

module.exports = new RoutineService()