import express from 'express'
const router = express.Router()


router.post('/', async (req, res) => {
    let datos2 = await require('../graphql/queries').getLocalStatistics(
        "", {token:req.body.token, territorio:req.body.territorio}
    )
    res.json(datos2)
})


module.exports = router
