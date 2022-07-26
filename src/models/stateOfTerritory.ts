export type typeStateOfTerritory = {
    _id?: object
    isFinished: boolean
    resetDate?: typeResetDate[]
    territorio: string
}

export type typeResetDate = {
    date: number
    option: typeOption
}

type typeOption = 1 | 2 | 3 | 4
