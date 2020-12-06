import express from 'express'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'

export const app = express()
export const port = process.env.PORT || 4005
export const NODE_ENV = process.env.NODE_ENV || "dev"
export const emailPSW = process.env.EMAILPSW || ""
export const myEmail = process.env.myEmail || ""
export const yourEmail = process.env.yourEmail || ""


require('./controllers/database')

// middlewares
app.use(cors())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(morgan('dev'))

// routes
app.all('/', (req, res, next) => {
    res.header({"Access-Control-Allow-Origin":true})
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    next()
})
app.use('/api/graphql', require('./graphql/gql.index'))
app.use('/api/users', require('./routes/users'))

//static files
app.use(express.static(path.join(__dirname, 'frontend-src')))
app.use(express.static(path.join(__dirname, 'build')))


// ;(() => {
//     try {
//         app.listen(port, () => {
//             console.log(`\n\nServer listening on port ${port}`)
//         });
//     } catch (error) {console.log(error)}
// })()
