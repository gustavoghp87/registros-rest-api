import { dbClient, maintenanceMode } from '../server'
import { stateOfTerritory } from '../models/territorio'

export class TerritoryDb {
    async GetStateOfTerritory(territorio: string): Promise<stateOfTerritory|null> {
        try {
            const obj: stateOfTerritory =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collTerr).findOne({ territorio }) as stateOfTerritory
            return obj
        } catch (error) {
            console.log("Territory Db SearchStateOfTerritory", error)
            return null
        }
    }
    async GetStateOfTerritories(): Promise<stateOfTerritory[]|null> {
        try {
            const obj: stateOfTerritory[]|null =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collTerr).find().toArray() as stateOfTerritory[]
            return obj
        } catch (error) {
            console.log("Territory Db SearchStatesOfTerritories", error)
            return null
        }
    }
    async ChangeStateOfTerritory(territorio: string, isFinished: boolean): Promise<boolean> {
        try {
            if (!maintenanceMode)
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collTerr).updateOne({ territorio }, {
                    $set: { isFinished }
                })
            return true
        } catch (error) {
            console.log("Territory Db ChangeStateOfTerritory", error)
            return false
        }
    }
    async ChangeStateForIsFinished(): Promise<boolean> {
        let states: stateOfTerritory[]|null = await this.GetStateOfTerritories()
        if (!states) return false
        states = states?.sort((a: any, b: any) => parseInt(a.territorio) - parseInt(b.territorio))
        if (states && states.length === 56) {
            let i = 0
            while (i < 56) {
                i++
                try {
                    console.log(states[i-1].territorio);
                    
                    await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collTerr).updateOne({ territorio: states[i-1].territorio }, {
                        $unset: { estado: "" }
                    })
                } catch (error) {
                    console.log("Territory Db ChangeStateOfTerritory", error)
                    return false
                }
            }
            return true
        }
        return false
    }
}
