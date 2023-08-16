const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class NotesController {
  async create(req, res) {
    const { title, description, rating, tags } = req.body
    const { user_id } = req.params

    if (typeof rating !== 'number') {
      throw new AppError('Rating format is different from number')
    }

    if (rating > 5 || rating < 1) {
      throw new AppError('Invalid valuation value')
    }

    const note = {
      title,
      description,
      rating,
      user_id
    }

    const [note_id] = await knex('notes').insert(note)

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    })

    await knex('tags').insert(tagsInsert)

    return res.json()
  }

  async update(req, res) {
    const { title, description, rating, tags } = req.body
    const { id } = req.params

    const note = await knex('notes').where({ id }).first()

    if (!note) {
      throw new AppError('Note not found')
    }

    if (typeof rating !== 'number') {
      throw new AppError('Rating format is different from number')
    }

    if (rating > 5 || rating < 1) {
      throw new AppError('Invalid valuation value')
    }

    await knex('notes')
      .where({ id })
      .update({
        title: title ?? note.title,
        description: description ?? note.description,
        rating: rating ?? note.rating,
        updated_at: knex.fn.now()
      })

    await knex('tags').where({ note_id: id }).delete()

    const tagsInsert = tags.map(name => {
      return {
        note_id: id,
        name,
        user_id: note.user_id
      }
    })

    await knex('tags').insert(tagsInsert)

    return res.json()
  }

  async index(req, res) {
    const { title, tags, user_id } = req.query

    let notes

    if (title && tags) {
      const filterTags = tags.split(',').map(tag => tag.trim())

      notes = await knex('tags')
        .select([
          'notes.id',
          'notes.title',
          'notes.description',
          'notes.rating',
          'notes.user_id'
        ])
        .where('notes.user_id', user_id)
        .whereIn('tags.name', filterTags)
        .whereLike('title', `%${title}%`)
        .innerJoin('notes', 'notes.id', 'tags.note_id')
        .orderBy('notes.id')
    } else if (title) {
      notes = await knex('notes')
        .where({ user_id })
        .whereLike('title', `%${title}%`)
    } else if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim())

      notes = await knex('tags')
        .select([
          'notes.id',
          'notes.title',
          'notes.description',
          'notes.rating',
          'notes.user_id'
        ])
        .where('notes.user_id', user_id)
        .whereIn('tags.name', filterTags)
        .innerJoin('notes', 'notes.id', 'tags.note_id')
        .orderBy('notes.id')
    } else {
      notes = await knex('notes').where({ user_id })
    }

    const newNotes = notes.map(async note => {
      const tags = await knex('tags').where({ note_id: note.id })

      const tagsPromise = await Promise.all(tags)

      return {
        ...note,
        tags: tagsPromise
      }
    })

    const notesPromise = await Promise.all(newNotes)

    if (notesPromise.length === 0) {
      throw new AppError('No notes found')
    }

    return res.json(notesPromise)
  }

  async show(req, res) {
    const { id } = req.params

    if (!id) {
      throw new AppError('Enter note id to search')
    }

    let note = await knex('notes').where({ id }).first()

    if (!note) {
      throw new AppError('note not found')
    }

    const tags = await knex('tags')

    const filteredTags = tags.filter(tag => {
      if (tag.note_id === note.id) {
        return tag
      }
    })

    note = {
      ...note,
      tags: filteredTags
    }

    return res.json(note)
  }

  async delete(req, res) {
    const { id } = req.params

    await knex('notes').where({ id }).delete()

    return res.json()
  }
}

module.exports = NotesController
