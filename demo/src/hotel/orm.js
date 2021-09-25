import { orm } from '*'
import './logger'

// pass func for await const bookOrm = ... execution
export const userOrm = orm(() => ({
  favoriteBooks: [bookOrm]
}), 'user')

export const bookOrm = orm(() => ({
  author: authorOrm
}), 'book')

export const authorOrm = orm(() => ({
  booksPreview: [bookOrm]
}), 'author')
