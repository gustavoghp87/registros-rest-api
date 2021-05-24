import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { NODE_ENV } from '../services/env-variables'


export const router = express.Router()
export const resolvers = require('../services/graphql/resolvers')
export const typeDefs = readFileSync(
  resolve(__dirname, "..", "..", "src", "services", "graphql", "schema.graphql"),
  'utf-8'
)
export const schema = makeExecutableSchema({ typeDefs, resolvers })

router.use('/', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: NODE_ENV === 'dev' ? true : false
}))