const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename: exerciseId_timestamp.extension
    const exerciseId = req.params.id
    const timestamp = Date.now()
    const extension = path.extname(file.originalname)
    const filename = `exercise_${exerciseId}_${timestamp}${extension}`
    cb(null, filename)
  }
})

// File filter for videos only
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/webm'
  ]
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only video files are allowed (mp4, mpeg, mov, avi, webm)'), false)
  }
}

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
  }
})

// Middleware for single video upload
const uploadVideo = upload.single('video')

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB'
      })
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    })
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
  
  next()
}

module.exports = {
  uploadVideo,
  handleUploadError
}