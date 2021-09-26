import { door, useDoor } from '*'
import api from '../api'
import { authorOrm, bookOrm } from '../hotel/orm'

export default params => {
  const authorId = Number(params.authorId)
  if (authorDoor.isLoading(authorId)) return
  loadAuthor(authorId)
}

const authorDoor = door(
  authorOrm
)

export const useAuthor = authorId => {
  authorId = Number(authorId)

  return {
    author: useDoor(authorDoor, authorId),
    removeBook: bookOrm.remove
  }
}

const loadAuthor = authorId => {
  authorId = Number(authorId)
  authorDoor.put(
    authorId,
    api.author.get(authorId)
  )
  .catch(() => {})
}
