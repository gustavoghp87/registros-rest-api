import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { NODE_ENV, app, port } from '../server'
import { createServer } from 'http'
import { ApolloServer } from 'apollo-server-express'

const router = express.Router()
const resolvers = require('./resolvers')


const typeDefs = readFileSync(
  resolve(__dirname, "..", "..", "src", "graphql", "schema.graphql"),
  'utf-8'
)
export const schema = makeExecutableSchema({typeDefs, resolvers})

router.use('/', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: NODE_ENV === 'dev' ? true : false
}))


module.exports = router

const server = new ApolloServer({ typeDefs, resolvers })

server.applyMiddleware({app})

const httpServer = createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen(port, () => {
  console.log(`\n\nServer ready at http://localhost:${port}${server.graphqlPath}`)
  console.log(`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`)
})


//////////////////////////////////////////////////

// const port2 = process.env.PORT ? process.env.PORT + 1 : 4006

// const apollo = new ApolloServer({
//     typeDefs,
//     resolvers,
//     playground: {
//         endpoint: `http:localhost:${port2}`
//     }
// })

// apollo.applyMiddleware({app})

// const ws = createServer(app)
// apollo.installSubscriptionHandlers(ws)

// ws.listen({port: port2}, () => {
//     console.log("\n\nSubscriptions URL: port", port2, '/graphql')
// })
