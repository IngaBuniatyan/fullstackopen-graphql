const { GraphQLError } = require("graphql")
const jwt = require("jsonwebtoken")

const Author = require("./models/author")
const Book = require("./models/book")
const User = require("./models/user")

const requireCurrentUser = (context) => {
  if (!context.currentUser) {
    throw new GraphQLError("not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    })
  }
}

const throwDatabaseError = (error) => {
  throw new GraphQLError(error.message, {
    extensions: {
      code: "BAD_USER_INPUT",
      invalidArgs: error.errors ? Object.keys(error.errors) : undefined,
    },
  })
}

const resolvers = {
  Query: {
    bookCount: () => Book.countDocuments({}).exec(),
    authorCount: () => Author.countDocuments({}).exec(),
    allBooks: async (root, args) => {
      const filter = {}

      if (args.genre) {
        filter.genres = args.genre
      }

      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          return []
        }
        filter.author = author._id
      }

      return Book.find(filter).populate("author").exec()
    },
    allAuthors: () => Author.find({}).exec(),
    me: (root, args, context) => context.currentUser,
  },

  Author: {
    bookCount: (author) =>
      Book.countDocuments({ author: author._id }).exec(),
  },

  Book: {
    author: (book) =>
      book.author?.name
        ? book.author
        : Author.findById(book.author).exec(),
  },

  Mutation: {
    addBook: async (root, args, context) => {
      requireCurrentUser(context)

      try {
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = await new Author({ name: args.author }).save()
        }

        return await new Book({
          title: args.title,
          published: args.published,
          author: author._id,
          genres: args.genres,
        }).save()
      } catch (error) {
        throwDatabaseError(error)
      }
    },

    editAuthor: async (root, args, context) => {
      requireCurrentUser(context)

      try {
        return await Author.findOneAndUpdate(
          { name: args.name },
          { born: args.setBornTo },
          { returnDocument: "after", runValidators: true },
        )
      } catch (error) {
        throwDatabaseError(error)
      }
    },

    createUser: async (root, args) => {
      try {
        return await new User(args).save()
      } catch (error) {
        throwDatabaseError(error)
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return {
        value: jwt.sign(userForToken, process.env.JWT_SECRET),
      }
    },

    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== "test") {
        throw new GraphQLError("database reset is only available in test mode", {
          extensions: { code: "FORBIDDEN" },
        })
      }

      await Promise.all([
        Author.deleteMany({}),
        Book.deleteMany({}),
        User.deleteMany({}),
      ])
      return true
    },
  },
}

module.exports = resolvers
