import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { schema } from "../services/graphql/schema"
import { resolvers } from '../services/graphql/resolvers'
import { NODE_ENV } from '../services/env-variables'

export const router = express.Router()

router.use('/', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: NODE_ENV === 'dev' ? true : false
  })
)
