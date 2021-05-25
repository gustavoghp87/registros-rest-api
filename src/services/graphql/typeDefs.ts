import { readFileSync } from 'fs'
import { resolve } from 'path'

export const typeDefs = readFileSync(
    resolve(__dirname, "..", "..", "..", "src", "services", "graphql", "schema.graphql"),
    'utf-8'
)
