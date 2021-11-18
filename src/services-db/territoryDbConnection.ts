import { dbClient, maintenanceMode } from '../server'
import { stateOfTerritory } from '../models/territorio'

export class TerritoryDb {

    async SearchStateOfTerritory(territorio: string): Promise<stateOfTerritory|null> {
        try {
            const obj: stateOfTerritory =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collTerr).findOne({ territorio }) as stateOfTerritory
            return obj
        } catch (error) {
            console.log("Territory Db SearchStateOfTerritory", error)
            return null
        }
    }
    async SearchStateOfTerritories(): Promise<stateOfTerritory[]|null> {
        try {
            const obj: stateOfTerritory[]|null =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collTerr).find().toArray() as stateOfTerritory[]
            return obj
        } catch (error) {
            console.log("Territory Db SearchStatesOfTerritories", error)
            return null
        }
    }
    async ChangeStateOfTerritory(territorio: string, estado: boolean): Promise<boolean> {
        try {
            if (!maintenanceMode)
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collTerr).updateOne({ territorio }, { $set: { estado } })
            return true
        } catch (error) {
            console.log("Territory Db ChangeStateOfTerritory", error)
            return false
        }
    }
}
