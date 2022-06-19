import { HouseToHouseDb } from '../services-db/houseToHouseDbConnection'
import { getTerritoryStreetsService } from './territory-services'
import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { typeDoNotCall, typeHTHTerritory, typeObservation } from '../models/houseToHouse'
import { typeUser } from '../models/user'
import { typeTerritoryNumber } from '../models/household'

const houseToHouseDbConnection = new HouseToHouseDb()

export const getHTHTerritoryService = async (token: string, territory: typeTerritoryNumber): Promise<typeHTHTerritory|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    const hthTerritory: typeHTHTerritory|null = await houseToHouseDbConnection.GetHTHTerritory(territory)
    return hthTerritory
}

export const getHTHStreetsByTerritoryService = async (token: string, territory: typeTerritoryNumber) => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    const streets: string[]|null = await getTerritoryStreetsService(territory)
    return streets
}

export const addHTHDoNotCallService = async (token: string, doNotCall: typeDoNotCall, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!doNotCall || !doNotCall.date || !doNotCall.id || !doNotCall.street || !doNotCall.block || !doNotCall.face || !doNotCall.streetNumber) return false
    const success: boolean = await houseToHouseDbConnection.AddHTHDoNotCall(doNotCall, territory)
    return success
}

export const addHTHObservationService = async (token: string, observation: typeObservation, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!observation || !observation.date || !observation.id || !observation.text) return false
    const success: boolean = await houseToHouseDbConnection.AddHTHObservation(observation, territory)
    return success
}

export const deleteHTHDoNotCallService = async (token: string, doNotCallId: number, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    const hthTerritory: typeHTHTerritory|null = await houseToHouseDbConnection.GetHTHTerritory(territory)
    if (!hthTerritory) return false
    let doNotCalls: typeDoNotCall[] = hthTerritory.doNotCalls
    if (!doNotCalls || !doNotCalls.length) return false
    doNotCalls = doNotCalls.filter(currentDoNotCall => currentDoNotCall.id !== doNotCallId)
    const success: boolean = await houseToHouseDbConnection.EditHTHDoNotCall(doNotCalls, territory)
    return success
}

export const deleteHTHObservationService = async (token: string, observationId: number, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    const hthTerritory: typeHTHTerritory|null = await houseToHouseDbConnection.GetHTHTerritory(territory)
    if (!hthTerritory) return false
    let observations: typeObservation[] = hthTerritory.observations
    if (!observations || !observations.length) return false
    observations = observations.filter((observation: typeObservation) => observation.id !== observationId)
    const success: boolean = await houseToHouseDbConnection.EditHTHObservation(observations, territory)
    return success
}

export const editHTHDoNotCallService = async (token: string, doNotCall: typeDoNotCall, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    const hthTerritory: typeHTHTerritory|null = await houseToHouseDbConnection.GetHTHTerritory(territory)
    if (!hthTerritory) return false
    let doNotCalls: typeDoNotCall[] = hthTerritory.doNotCalls
    if (!doNotCalls || !doNotCalls.length) return false
    doNotCalls = doNotCalls.map((currentDoNotCall: typeDoNotCall) => 
        currentDoNotCall.id === doNotCall.id ? { ...doNotCalls, ...currentDoNotCall } : currentDoNotCall
    )
    const success: boolean = await houseToHouseDbConnection.EditHTHDoNotCall(doNotCalls, territory)
    return success
}

export const editHTHObservationService = async (token: string, observation: typeObservation, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    const hthTerritory: typeHTHTerritory|null = await houseToHouseDbConnection.GetHTHTerritory(territory)
    if (!hthTerritory) return false
    let observations: typeObservation[] = hthTerritory.observations
    if (!observations || !observations.length) return false
    observations = observations.map((currentObservations: typeObservation) => 
        currentObservations.id === observation.id ? { ...observations, ...currentObservations } : currentObservations
    )
    const success: boolean = await houseToHouseDbConnection.EditHTHObservation(observations, territory)
    return success
}
