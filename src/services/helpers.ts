import { typeHousehold, typeUser } from '../models'

const getRandomCharacter = (i: number): string => Math.random().toString(36).slice(i * -1)

export const getRandomId24 = (): string => getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4)

export const getRandomId12 = (): string => getRandomCharacter(3) + "-" + getRandomCharacter(3) + "-" + getRandomCharacter(4)

export const isTerritoryAssignedToUserService = (user: typeUser, territoryNumber: string): boolean => {
    return user.phoneAssignments?.some((assignedTerritory: number) => assignedTerritory.toString() === territoryNumber)
}

export const filterHouses = (households: typeHousehold[]): typeHousehold[] => {
    return households.filter(x => x.doorBell)
}

export const getCurrentLocalDate = (timestamp?: number) => {
    const argDate = timestamp ? new Date(timestamp) : new Date();
    argDate.setTime(argDate.getTime() - 3 * 60 * 60 * 1000);
    return argDate.toISOString().split('T')[0]
}
