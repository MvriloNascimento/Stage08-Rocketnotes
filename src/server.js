require('express-async-errors')

const express = require('express')
const routes = require('./routes')
const AppError = require('./utils/AppError')

const app = express()

app.use(express.json())

app.use(routes)

app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ status: 'error', message: error.message })
  }

  console.error(error)

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
})

const PORT = 3000

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
