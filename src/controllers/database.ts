import dotenv from 'dotenv'
dotenv.config()

const MongoClient = require('mongodb').MongoClient

export const dbMW = "Misericordia-Web"
export const collUsers = "usuarios"
export const collTerr = "viviendas"

export const client = new MongoClient( process.env.DB_URL,
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
);


(async () => {
    await client.connect()
})()
