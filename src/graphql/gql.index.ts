import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { makeExecutableSchema,  } from 'graphql-tools'
import { readFileSync } from 'fs'
import { join } from 'path'
import { NODE_ENV } from '../server'
const router = express.Router()
const resolvers = require('./resolvers')

const typeDefs = readFileSync(
    join(__dirname, "schema.graphql"),
    'utf-8'
)

const schema = makeExecutableSchema({typeDefs, resolvers})

router.use('/', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: NODE_ENV === 'dev' ? true : false
}))


module.exports = router
