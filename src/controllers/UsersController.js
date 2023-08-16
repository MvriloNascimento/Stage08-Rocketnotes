const { hash, compare } = require('bcryptjs')
const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class UsersController {
  async create(req, res) {
    const { name, email, password, avatar } = req.body

    const userExists = await knex('users').where({ email }).first()

    if (userExists) {
      throw new AppError('E-mail already registered')
    }

    const hashPassword = await hash(password, 8)

    const user = { name, email, password: hashPassword, avatar }

    const [user_id] = await knex('users').insert(user)

    return res.json(user_id)
  }

  async update(req, res) {
    const { name, email, avatar, old_password, new_password } = req.body
    const { id } = req.params

    const user = await knex('users').where({ id }).first()

    if (!user) {
      throw new AppError('User not found')
    }

    const userWithUpdatedEmail = await knex('users').where({ email }).first()

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError('This email is already in use')
    }

    user.name = name ?? user.name
    user.email = email ?? user.email
    user.avatar = avatar ?? user.avatar
    user.updated_at = knex.fn.now()

    if (new_password && !old_password) {
      throw new AppError('Enter old password to set new password')
    }

    if (new_password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('The old password does not match')
      }

      user.password = await hash(new_password, 8)
    }

    await knex('users').where({ id }).update(user)

    return res.json()
  }

  async index(req, res) {
    const users = await knex('users')

    return res.json(users)
  }

  async show(req, res) {
    const { id } = req.params

    const user = await knex('users').where({ id }).first()

    return res.json(user)
  }

  async delete(req, res) {
    const { id } = req.params

    await knex('users').where({ id }).delete()

    return res.json()
  }
}

module.exports = UsersController
