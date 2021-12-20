import { dbClient } from '../server'
import { ObjectId } from 'mongodb'
import { typeHTHBuilding, typeHTHHousehold } from '../models/houseToHouse'

export class HouseToHouseDb {
    async GetBuildingsByTerritory(territory: string): Promise<typeHTHBuilding[]|null> {
        try {
            const buildings: typeHTHBuilding[] =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collCasa).find({territory}).toArray() as typeHTHBuilding[]
            return buildings
        } catch (error) {
            console.log(error)
            return null
        }
    }
    async AddBuilding(newHousehold: typeHTHBuilding): Promise<boolean> {
        try {
            const building: typeHTHBuilding = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collCasa).findOne({
                territory: newHousehold.territory,
                street: newHousehold.street,
                streetNumber: newHousehold.streetNumber
            }) as typeHTHBuilding
            if (building) return false
            await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collCasa).insertOne(newHousehold as Object)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async ModifyHTHHousehold(household: typeHTHHousehold, buildingId: string): Promise<boolean> {
        try {
            console.log(household)

            household.lastTime = +new Date()
            
            const building: typeHTHBuilding|null = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collCasa)
                .findOne({ _id: new ObjectId(buildingId) }) as typeHTHBuilding
            if (!building) return false
            const households: typeHTHHousehold[] = building.households
            for (let i = 0; i < households.length; i++) {
                if (households[i].idNumber === household.idNumber) households[i] = household
            }
            await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collCasa).updateOne({ _id: new ObjectId(buildingId) },
                {$set: { households }}
            )
            
            // , {
            //     $set: {
            //         piso: household.piso,
            //         depto: household.depto,
            //         idNumber: household.idNumber,
            //         estado: household.estado,
            //         lastTime: household.lastTime
            //     }
            // })

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}

// isChecked: boolean         // provisional
// piso: string
// depto: string
// idNumber: number
// estado: typeEstado
// lastTime: number
