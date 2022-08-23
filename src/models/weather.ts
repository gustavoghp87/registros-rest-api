export type typeWeatherResponse = {
    base: string
    clouds: Clouds
    cod: number
    coord: Coord
    dt: number
    id: number
    main: Main
    name: string
    sys: Sys
    visibility: number
    weather: Weather[]
    wind: Wind
}

export type typeForecastResponse = {
    city: City
    cnt: number
    cod: string
    list: List[]
    message: number
}

type Main = {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    sea_level: number
    grnd_level: number
    humidity: number
    temp_kf: number
}

type Weather = {
    id: number
    main: string
    description: string
    icon: string
}

type Clouds = {
    all: number
}

type Wind = {
    speed: number
    deg: number
    gust: number
}

type Rain = {
    '3h': number
}

type Sys = {
    pod: string
}

type List = {
    dt: number
    main: Main
    weather: Weather[]
    clouds: Clouds
    wind: Wind
    visibility: number
    pop: number
    rain: Rain
    sys: Sys
    dt_txt: string
}

type Coord = {
    lat: number
    lon: number
}
 
type City = {
    id: number
    name: string
    coord: Coord
    country: string
    population: number
    timezone: number
    sunrise: number
    sunset: number
}
