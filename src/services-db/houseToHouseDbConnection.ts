import { dbClient } from '../server'
import { ObjectId } from 'mongodb'
import { typeHTHBuilding, typeHTHHousehold } from '../models/houseToHouse'
import { ObjectID } from 'bson'

export class HouseToHouseDb {
    async GetBuildingsByTerritory(territory: string): Promise<typeHTHBuilding[]|null> {
        try {
            const buildings: typeHTHBuilding[] =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).find({territory}).toArray() as typeHTHBuilding[]
            return buildings
        } catch (error) {
            console.log(error)
            //logger.Add(`Falló GetBuildingsByTerritory() pasando ${territorio} a ${isFinished}: ${error}`, "error")
            return null
        }
    }

    async AddBuilding(newHousehold: typeHTHBuilding): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).insertOne(newHousehold as Object)
            return true
        } catch (error) {
            console.log(error)
            //logger.Add(`Falló AddBuilding() pasando ${territorio} a ${isFinished}: ${error}`, "error")
            return false
        }
    }

    async GetBuilding(territory: string, street: string, streetNumber: number): Promise<typeHTHBuilding|null> {
        try {
            const building: typeHTHBuilding = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).findOne({
                territory,
                street,
                streetNumber
            }) as typeHTHBuilding
            return building
        } catch (error) {
            console.log(error)
            //logger.Add(`Falló GetBuilding() pasando ${territorio} a ${isFinished}: ${error}`, "error")
            return null
        }
    }

    async ModifyHTHBuilding(building: typeHTHBuilding): Promise<boolean> {
        console.log(building)
        
        try {
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne({ _id: new ObjectID(building._id) }, {
                $set: {
                    street: building.street,
                    streetNumber: building.streetNumber,
                    households: building.households,
                    pisosX: building.pisosX,
                    deptosX: building.deptosX,
                    conLetras: building.conLetras,
                    numCorrido: building.numCorrido,
                    sinPB: building.sinPB
                }
            })
            return true
        } catch (error) {
            console.log(error)
            //logger.Add(`Falló ModifyHTHBuilding() pasando ${territorio} a ${isFinished}: ${error}`, "error")
            return false
        }
    }
    
    async ModifyHTHHousehold(household: typeHTHHousehold, buildingId: string): Promise<boolean> {
        try {
            console.log(household)

            household.lastTime = +new Date()
            
            const building: typeHTHBuilding|null = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa)
                .findOne({ _id: new ObjectId(buildingId) }) as typeHTHBuilding
            if (!building) return false
            const households: typeHTHHousehold[] = building.households
            for (let i = 0; i < households.length; i++) {
                if (households[i].idNumber === household.idNumber) households[i] = household
            }
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne({ _id: new ObjectId(buildingId) },
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
            //logger.Add(`Falló ModifyHTHHousehold() pasando ${household} a ${buildingId}: ${error}`, "error")
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
