const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Auth Service connected to PostgreSQL via Prisma')
    
    // Create admin user if it doesn't exist
    const adminExists = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await prisma.user.create({
        data: {
          username: 'admin',
          passwordHash: hashedPassword,
          role: 'admin'
        }
      })
      console.log('👑 Admin user created (username: admin, password: admin123)')
    }
  } catch (error) {
    console.error('❌ Auth Service database connection failed:', error)
    throw error
  }
}

const disconnectDB = async () => {
  await prisma.$disconnect()
}

module.exports = { prisma, connectDB, disconnectDB }