const fetchData = (url, body, method = 'GET') =>
  fetch(`http://localhost:7337/${url}`, { body, method, headers: { 'Content-Type': method === 'GET' ? 'text/plain' : 'application/json', } })
    // .then(a => console.log(a) || a)
    .then(res => res.json())

const api = {
  author: {
    get: authorId => fetchData(`author/${authorId}`)
  },
  authors: {
    get: () => fetchData('authors')
  },
  book: {
    get: bookId => fetchData(`book/${bookId}`),
    put: (bookId, diff) => fetchData(
      `book/${bookId}`,
      JSON.stringify(
        { diff }, 
        (key, val) => key === 'author' ? void 7 : val
      ),
      'PUT'
    )
  },
  favoriteBooks: {
    get: () => fetchData('favoriteBooks'),
  }
}

export default api

// const delay = (func, ms = 999) =>
//   new Promise(resolve =>
//     setTimeout(
//       () => resolve(func()), 
//       ms
//     )
//   )
