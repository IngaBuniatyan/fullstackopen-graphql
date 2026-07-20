import { useQuery } from '@apollo/client/react'

import { ALL_BOOKS, ME } from '../queries'

const Recommendations = ({ show }) => {
  const userResult = useQuery(ME, {
    fetchPolicy: 'cache-and-network',
  })
  const favoriteGenre = userResult.data?.me?.favoriteGenre
  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre,
    fetchPolicy: 'network-only',
  })

  if (!show) {
    return null
  }

  if (userResult.loading || booksResult.loading) {
    return <p>loading recommendations...</p>
  }

  if (userResult.error || booksResult.error || !favoriteGenre) {
    return <p role="alert">could not load recommendations</p>
  }

  return (
    <section>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>
      <table>
        <thead>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {booksResult.data.allBooks.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default Recommendations
