import { typeConfig, typeUser } from '../models'

export const getConfig = async (requesterUser: typeUser): Promise<typeConfig|null> => {
    if (!requesterUser) return null
    return {
        name: "Plaza de la Misericordia",
        numberOfTerritories: 56
    }
}
