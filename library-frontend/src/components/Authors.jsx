import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'

import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const Authors = ({ show }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const result = useQuery(ALL_AUTHORS)
  const [editAuthor, mutationResult] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const authors = result.data?.allAuthors ?? []
  const selectedName = authors.some((author) => author.name === name)
    ? name
    : (authors[0]?.name ?? '')

  if (!show) {
    return null
  }

  if (result.loading) {
    return <p>loading authors...</p>
  }

  if (result.error) {
    return <p role="alert">could not load authors</p>
  }

  const submit = async (event) => {
    event.preventDefault()
    await editAuthor({
      variables: {
        name: selectedName,
        setBornTo: Number(born),
      },
    })
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>born</th>
            <th>books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born ?? ''}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>set birthyear</h2>
      <form onSubmit={submit}>
        <label>
          name
          <select
            value={selectedName}
            onChange={({ target }) => setName(target.value)}
          >
            {authors.map((author) => (
              <option key={author.name} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
            required
          />
        </label>
        <button type="submit" disabled={mutationResult.loading}>
          update author
        </button>
        {mutationResult.error && (
          <p role="alert">could not update author</p>
        )}
      </form>
    </div>
  )
}

export default Authors
