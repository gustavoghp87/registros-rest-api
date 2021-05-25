export interface statistic {
    count: number
    countContesto: number
    countNoContesto: number
    countDejarCarta: number
    countNoLlamar: number
    countNoAbonado: number
    libres: number

}

export interface localStatistic extends statistic {
    territorio: string
}