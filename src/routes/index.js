const { Router } = require('express')

const usersRoutes = require('./users.routes')
const tagsRoutes = require('./tags.routes')
const notesRoutes = require('./notes.routes')

const routes = Router()

routes.use('/users', usersRoutes)
routes.use('/tags', tagsRoutes)
routes.use('/notes', notesRoutes)

module.exports = routes
