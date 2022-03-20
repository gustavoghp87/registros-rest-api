import { HouseToHouseDb } from '../services-db/houseToHouseDbConnection'
import { getTerritoryStreetsService } from './territory-services'
import { getActivatedUserByAccessTokenService } from './user-services'
import { noPredicadoHTH, typeHTHBuilding, typeHTHHousehold } from '../models/houseToHouse'
import { typeUser } from '../models/user'

const houseToHouseDbConnection = new HouseToHouseDb()

export const getHTHBuildingsService = async (token: string, territory: string): Promise<typeHTHBuilding[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    if (user.email !== 'ghp.2120@gmail.com') return null
    const buildings: typeHTHBuilding[]|null = await houseToHouseDbConnection.GetBuildingsByTerritory(territory)
    return buildings
}

export const addHTHBuildingService = async (token: string, body: any): Promise<typeHTHBuilding[]|null|object> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
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
    
    const building: typeHTHBuilding|null = await houseToHouseDbConnection.GetBuilding(territory, street, streetNumber)
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
            household.estado = noPredicadoHTH
            household.lastTime = 0
            newBuilding.households.push(household)
        }
    })
    if (!newBuilding.households.length) return null
    const success: boolean = await houseToHouseDbConnection.AddBuilding(newBuilding)
    if (!success) return null
    const buildings: typeHTHBuilding[]|null = await houseToHouseDbConnection.GetBuildingsByTerritory(territory)
    return buildings
}

export const modifyHTHBuildingService = async (token: string, building: typeHTHBuilding): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return false
    if (user.email !== 'ghp.2120@gmail.com') return false
    //if (typeof building !== typeHTHBuilding) return false
    const success: boolean = await houseToHouseDbConnection.ModifyHTHBuilding(building)
    return success
}

export const modifyHTHHouseholdStateService = async (token: string, household: typeHTHHousehold, buildingId: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return false
    if (user.email !== 'ghp.2120@gmail.com') return false
    if (!household.estado || !household.piso || !household.depto || !household.idNumber || !buildingId) return false
    const success: boolean = await houseToHouseDbConnection.ModifyHTHHousehold(household, buildingId)
    return success
}

export const getHTHTerritoryStreetsService = async (token: string, territory: string): Promise<string[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territory) return null
    if (user.email !== 'ghp.2120@gmail.com') return null
    const streets: string[]|null = await getTerritoryStreetsService(territory)
    return streets
}
