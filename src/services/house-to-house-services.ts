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

export const addBuildingService = async (token: string, body: any): Promise<typeHTHBuilding[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return null
    if (user.email !== 'ghp.2120@gmail.com') return null

    const territory: string = body.territory
    const street: string = body.calle
    const streetNumber: number = body.numero
    const payloads: typeHTHHousehold[] = body.payloads

    if (!territory || !street || !streetNumber || !payloads) return null

    const newBuilding: typeHTHBuilding = {
        territory,
        street,
        streetNumber,
        manzana: '9',
        households: []
    }

    payloads.forEach((household: typeHTHHousehold) => {
        if (household.isChecked) {
            household.estado = "No predicado"
            household.lastTime = 0
            newBuilding.households.push(household)
        }
    })
    
    const success: boolean = await new HouseToHouseDb().AddBuilding(newBuilding)
    if (!success) return null

    const buildings: typeHTHBuilding[]|null = await new HouseToHouseDb().GetBuildingsByTerritory(territory)
    return buildings
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
