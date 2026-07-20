import { useQuery } from '@apollo/client/react'

import { ALL_BOOKS } from '../queries'

const Books = ({ show }) => {
  const result = useQuery(ALL_BOOKS)

  if (!show) {
    return null
  }

  if (result.loading) {
    return <p>loading books...</p>
  }

  if (result.error) {
    return <p role="alert">could not load books</p>
  }

  const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>

      <table>
        <thead>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
