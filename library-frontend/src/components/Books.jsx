import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'

import { ALL_BOOKS } from '../queries'

const Books = ({ show }) => {
  const [selectedGenre, setSelectedGenre] = useState('')
  const allBooksResult = useQuery(ALL_BOOKS, {
    variables: { genre: null },
    fetchPolicy: 'cache-and-network',
  })
  const filteredResult = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
    skip: !selectedGenre,
    fetchPolicy: 'network-only',
  })

  const genres = useMemo(() => {
    const books = allBooksResult.data?.allBooks ?? []
    return [...new Set(books.flatMap((book) => book.genres))].sort()
  }, [allBooksResult.data])

  if (!show) {
    return null
  }

  const activeResult = selectedGenre ? filteredResult : allBooksResult

  if (activeResult.loading && !activeResult.data) {
    return <p>loading books...</p>
  }

  if (activeResult.error) {
    return <p role="alert">could not load books</p>
  }

  const books = activeResult.data?.allBooks ?? []

  const chooseGenre = async (genre) => {
    if (genre === selectedGenre && genre) {
      await filteredResult.refetch({ genre })
      return
    }

    setSelectedGenre(genre)
    if (!genre) {
      await allBooksResult.refetch({ genre: null })
    }
  }

  return (
    <section>
      <h2>books</h2>

      {selectedGenre && (
        <p>
          <span>in genre</span> <strong>{selectedGenre}</strong>
        </p>
      )}

      <table>
        <thead>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="genre-buttons" aria-label="filter books by genre">
        {genres.map((genre) => (
          <button key={genre} onClick={() => chooseGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => chooseGenre('')}>all genres</button>
      </div>
    </section>
  )
}

export default Books
