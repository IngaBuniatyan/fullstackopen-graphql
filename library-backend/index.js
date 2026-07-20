require("dotenv").config()

const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const { GraphQLError } = require("graphql")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const User = require("./models/user")
const resolvers = require("./resolvers")
const typeDefs = require("./schema")

const start = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required")
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required")
  }

  mongoose.set("strictQuery", false)
  await mongoose.connect(process.env.MONGODB_URI)
  console.log("connected to MongoDB")

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4000 },
    context: async ({ req }) => {
      const authorization = req?.headers?.authorization

      if (!authorization?.toLowerCase().startsWith("bearer ")) {
        return { currentUser: null }
      }

      try {
        const decodedToken = jwt.verify(
          authorization.substring(7),
          process.env.JWT_SECRET,
        )
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      } catch {
        throw new GraphQLError("invalid or expired token", {
          extensions: { code: "UNAUTHENTICATED" },
        })
      }
    },
  })

  console.log(`Server ready at ${url}`)
}

start().catch((error) => {
  console.error("failed to start server:", error.message)
  process.exit(1)
})

