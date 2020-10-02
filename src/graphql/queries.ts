import { client, dbMW, collUsers, collTerr } from '../controllers/database'
import { IVivienda } from '../types/types'


module.exports = {

    getVivienda: async () => {
        const vivienda = await client.db(dbMW).collection(collTerr).findOne()
        return vivienda
    },
    getVivienda2: async (root:any, args:IVivienda) => {
        const vivienda =  await client.db(dbMW).collection(collTerr).findOne({inner_id:args.inner_id})
        return vivienda
    }
    
}

