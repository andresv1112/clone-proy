const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Workout Service connected to PostgreSQL via Prisma')
  } catch (error) {
    console.error('❌ Workout Service database connection failed:', error)
    throw error
  }
}

const disconnectDB = async () => {
  await prisma.$disconnect()
}

module.exports = { prisma, connectDB, disconnectDB }