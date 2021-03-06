import { dbClient } from '../../server'
import { collTerr, dbMW } from './_dbConnection'

export class TerritoryDb {

    async SearchStateOfTerritory(territorio:string) {
        try {
            const obj = await dbClient.Client.db(dbMW).collection(collTerr).findOne({ territorio })
            return obj
        } catch (error) {
            console.log("Territory Db SearchStateOfTerritory ", error)
            return null
        }
    }
    async SearchStateOfTerritories() {
        try {
            let obj = await dbClient.Client.db(dbMW).collection(collTerr).find().toArray()
            return obj
        } catch (error) {
            console.log("Territory Db SearchStatesOfTerritories ", error)
            return null
        }
    }
    async ChangeStateOfTerritory(territorio:string, estado:boolean) {
        try {
            await dbClient.Client.db(dbMW).collection(collTerr).updateOne({ territorio }, {$set: { estado }})
            return true
        } catch (error) {
            console.log("Territory Db ChangeStateOfTerritory ", error)
            return false
        }
    }
}
