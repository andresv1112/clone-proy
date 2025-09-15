const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { prisma } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')
const { validateRegister, validateLogin, validateToken } = require('../middleware/validation')
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseHelper')

const router = express.Router()

// Register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors)
    }

    const { username, password } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })
    
    if (existingUser) {
      return errorResponse(res, 'Username already exists', 400)
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        role: 'user'
      }
    })

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    }, 'User registered successfully', 201)
    
  } catch (error) {
    console.error('Register error:', error)
    return errorResponse(res, 'Failed to register user')
  }
})

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors)
    }

    const { username, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401)
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid credentials', 401)
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }, 'Login successful')
    
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse(res, 'Failed to login')
  }
})

// Get profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    })
    
    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    return successResponse(res, {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }, 'Profile retrieved successfully')
    
  } catch (error) {
    console.error('Profile error:', error)
    return errorResponse(res, 'Failed to get profile')
  }
})

// Verify token
router.post('/verify-token', validateToken, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors)
    }

    const { token } = req.body

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })
      
      if (!user) {
        return errorResponse(res, 'User not found', 401)
      }

      return successResponse(res, {
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt
        }
      }, 'Token is valid')
      
    } catch (jwtError) {
      return errorResponse(res, 'Invalid or expired token', 401)
    }
    
  } catch (error) {
    console.error('Token verification error:', error)
    return errorResponse(res, 'Failed to verify token')
  }
})

// Refresh token
router.post('/refresh-token', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    })
    
    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    // Generate new JWT
    const newToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return successResponse(res, {
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }, 'Token refreshed successfully')
    
  } catch (error) {
    console.error('Token refresh error:', error)
    return errorResponse(res, 'Failed to refresh token')
  }
})

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Admin access required', 403)
    }

    const { page = 1, limit = 10, search = '' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const whereClause = search ? {
      username: {
        contains: search,
        mode: 'insensitive'
      }
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ])

    return successResponse(res, {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Users retrieved successfully')
    
  } catch (error) {
    console.error('Get users error:', error)
    return errorResponse(res, 'Failed to get users')
  }
})

// Update user role (admin only)
router.patch('/users/:id/role', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Admin access required', 403)
    }

    const { id } = req.params
    const { role } = req.body

    if (!['user', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role. Must be "user" or "admin"', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    // Prevent admin from changing their own role
    if (user.id === req.user.userId) {
      return errorResponse(res, 'Cannot change your own role', 400)
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return successResponse(res, updatedUser, 'User role updated successfully')
    
  } catch (error) {
    console.error('Update user role error:', error)
    return errorResponse(res, 'Failed to update user role')
  }
})

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Admin access required', 403)
    }

    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.userId) {
      return errorResponse(res, 'Cannot delete your own account', 400)
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    return successResponse(res, null, 'User deleted successfully')
    
  } catch (error) {
    console.error('Delete user error:', error)
    return errorResponse(res, 'Failed to delete user')
  }
})

// Change password
router.patch('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400)
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    })

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      return errorResponse(res, 'Current password is incorrect', 400)
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { 
        passwordHash: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    return successResponse(res, null, 'Password changed successfully')
    
  } catch (error) {
    console.error('Change password error:', error)
    return errorResponse(res, 'Failed to change password')
  }
})

// Logout (optional - mainly for client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a JWT-based system, logout is mainly handled client-side
    // But we can update the user's last activity
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { updatedAt: new Date() }
    })

    return successResponse(res, null, 'Logged out successfully')
    
  } catch (error) {
    console.error('Logout error:', error)
    return errorResponse(res, 'Failed to logout')
  }
})

// Get user statistics (admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Admin access required', 403)
    }

    const [totalUsers, totalAdmins, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ])

    return successResponse(res, {
      totalUsers,
      totalAdmins,
      totalRegularUsers: totalUsers - totalAdmins,
      recentUsers
    }, 'Statistics retrieved successfully')
    
  } catch (error) {
    console.error('Get stats error:', error)
    return errorResponse(res, 'Failed to get statistics')
  }
})

// Health check with database status
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.user.count()
    
    return successResponse(res, {
      service: 'Auth Service',
      database: 'Connected',
      uptime: process.uptime()
    }, 'Service is healthy')
    
  } catch (error) {
    console.error('Health check error:', error)
    return res.status(503).json({
      success: false,
      message: 'Service unhealthy',
      data: {
        service: 'Auth Service',
        database: 'Disconnected',
        uptime: process.uptime()
      }
    })
  }
})

module.exports = router