const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class TagsController {
  async index(req, res) {
    const { user_id } = req.params

    const tags = await knex('tags').where({ user_id })

    if (!tags) {
      throw new AppError('No tags found')
    }

    return res.json(tags)
  }
}

module.exports = TagsController
