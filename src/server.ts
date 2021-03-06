import express from 'express'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import { port } from './services/env-variables'
import { createServer } from 'http'
import { ApolloServer } from 'apollo-server-express'
import { router as territoryGQLController } from './controllers/territory-gql-controller'
import { router as territoryController } from './controllers/territory-controller'
import { router as userController } from './controllers/user-controller'
import { router as statisticsController } from './controllers/statistics-controller'
import { router as resetController } from './controllers/reset-controller'
// import { router as campaignController } from './controllers/campaign-controller'
import { typeDefs } from './services/graphql/typeDefs'
import { resolvers } from './services/graphql/resolvers'
import { DbConnection } from './services/database-services/_dbConnection'

export const dbClient = new DbConnection()
const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(morgan('dev'))

const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({app})
const httpServer = createServer(app)
server.installSubscriptionHandlers(httpServer)
httpServer.listen(port, () => {
  console.log(`\n\nServer ready at http://localhost:${port}${server.graphqlPath}`)
  console.log(`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`)
})

app.use('/api/users', userController)
app.use('/api/statistics', statisticsController)
app.use('/api/reset', resetController)
// app.use('/api/campaign', campaignController)
app.use('/api/graphql', territoryGQLController)
app.use('/api/territories', territoryController)

app.use(express.static(path.join(__dirname, 'frontend-src')))
app.use(express.static(path.join(__dirname, 'build')))
