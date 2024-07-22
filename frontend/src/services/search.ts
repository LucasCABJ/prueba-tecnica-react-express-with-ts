import { API_HOST } from "../config";
import { Data, ApiSearchResponse } from "../types";

export const searchData = async(search: string): Promise<[Error?, Data?]> => {
    try {
        const res = await fetch(`${API_HOST}/api/users?q=${search}`)

        if(!res.ok) return [new Error(`(${res.status}) Error en la búsqueda`)]
        const json = await res.json() as ApiSearchResponse
        return [undefined, json.data]
    } catch (err) {
        if (err instanceof Error) return [err]
        return [new Error("Unknown error")]
    }
}