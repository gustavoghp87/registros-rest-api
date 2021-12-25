import { HouseToHouseDb } from '../services-db/houseToHouseDbConnection'
import { getTerritoryStreets } from './territory-services'
import { getActivatedUserByAccessToken } from './user-services'
import { typeHTHBuilding, typeHTHHousehold } from '../models/houseToHouse'
import { typeUser } from '../models/user'

export const getBuildingsService = async (token: string, territory: string): Promise<typeHTHBuilding[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return null
    if (user.email !== 'ghp.2120@gmail.com') return null
    const buildings: typeHTHBuilding[]|null = await new HouseToHouseDb().GetBuildingsByTerritory(territory)
    return buildings
}

export const addBuildingService = async (token: string, body: any): Promise<typeHTHBuilding[]|null|object> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return null
    if (user.email !== 'ghp.2120@gmail.com') return null

    const conLetras: boolean = body.conLetras
    const deptosX: number = body.deptosX
    const households: typeHTHHousehold[] = body.households
    const numCorrido: boolean = body.numCorrido
    const pisosX: number = body.pisosX
    const sinPB: boolean = body.sinPB
    const street: string = body.street
    const streetNumber: number = body.streetNumber
    const territory: string = body.territory

    if (conLetras === undefined || !deptosX || !households || !households.length || numCorrido === undefined
    || !pisosX || sinPB === undefined || !street || !streetNumber || !territory) return null
    
    const building: typeHTHBuilding|null = await new HouseToHouseDb().GetBuilding(territory, street, streetNumber)
    if (building) return { exists: true }
        
    const newBuilding: typeHTHBuilding = {
        territory,
        street,
        streetNumber,
        manzana: '9',
        households: [],
        pisosX,
        deptosX,
        conLetras,
        numCorrido,
        sinPB
    }

    households.forEach((household: typeHTHHousehold) => {
        if (household.isChecked) {
            household.estado = "No predicado"
            household.lastTime = 0
            newBuilding.households.push(household)
        }
    })

    if (!newBuilding.households.length) return null
    
    const success: boolean = await new HouseToHouseDb().AddBuilding(newBuilding)
    if (!success) return null

    const buildings: typeHTHBuilding[]|null = await new HouseToHouseDb().GetBuildingsByTerritory(territory)
    return buildings
}

export const modifyHTHBuilding = async (token: string, building: typeHTHBuilding): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return false
    if (user.email !== 'ghp.2120@gmail.com') return false
    //if (typeof building !== typeHTHBuilding) return false
    const success: boolean = await new HouseToHouseDb().ModifyHTHBuilding(building)
    return success
}

export const modifyHTHHouseholdState = async (token: string, household: typeHTHHousehold, buildingId: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return false
    if (user.email !== 'ghp.2120@gmail.com') return false
    console.log(household, buildingId)
    
    if (!household.estado || !household.piso || !household.depto || !household.idNumber || !buildingId) return false
    const success: boolean = await new HouseToHouseDb().ModifyHTHHousehold(household, buildingId)
    return success
}

export const getTerritoryStreetsService = async (token: string, territory: string): Promise<string[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return null
    if (user.email !== 'ghp.2120@gmail.com') return null
    const streets: string[]|null = await getTerritoryStreets(territory)
    return streets
}
