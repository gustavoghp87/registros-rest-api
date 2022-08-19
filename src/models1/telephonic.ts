import { ObjectId } from 'mongodb'
import { typeBlock, typeTerritoryNumber } from '.'

export type typeCallingState = "No predicado" | "No contestó" | "Contestó" | "No llamar" | "A dejar carta"

export type typeTelephonicTerritory = {
    _id?: ObjectId
    households: typeHousehold[]
    stateOfTerritory: typeStateOfTerritory
    territoryNumber: typeTerritoryNumber
}

export type typeHousehold = {
    address: string
    block: typeBlock
    callingState: typeCallingState
    dateOfLastCall: number
    householdId: number
    isAssigned: boolean
    notSubscribed: boolean
    phoneNumber: string
}

type typeStateOfTerritory = {
    isFinished: boolean
    resetDates: typeResetDate[]
}

export type typeResetDate = {
    date: number
    option: typeOption
}

type typeOption = 1 | 2 | 3 | 4

export type typeTelephonicStatistic = {
    numberOf_ADejarCarta: number
    numberOf_Contesto: number
    numberOf_NoAbonado: number
    numberOf_NoContesto: number
    numberOf_NoLlamar: number
    numberOf_FreePhones: number
    numberOfHouseholds: number
}

export interface typeLocalTelephonicStatistic extends typeTelephonicStatistic {
    isFinished: boolean
    territoryNumber: typeTerritoryNumber
}
