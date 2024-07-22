import { useEffect, useState } from "react"
import { Data } from "../types"
import { searchData } from "../services/search"
import { toast } from "sonner"
import { useDebounce } from "@uidotdev/usehooks"

const DEBOUNCE_TIME = 250

export const Search = ({ initialData }: { initialData: Data }) => {
    const [data, setData] = useState<Data>(initialData)
    const [search, setSearch] = useState<string>(() => {
        const searchParams = new URLSearchParams(window.location.search)
        return searchParams.get('q') ?? ''
    })

    const debounceSearch = useDebounce(search, DEBOUNCE_TIME)

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value)
    }

    useEffect(() => {
        const newPathName = (debounceSearch === '')
          ? window.location.pathname 
          : `q=${debounceSearch}`
        window.history.replaceState({}, '', newPathName)
    }, [debounceSearch, initialData])

    useEffect(() => {

        if(!debounceSearch) {
            setData(initialData)
            return
        }

        // call api for results
        searchData(debounceSearch)
            .then(response => {
                const [err, newData] = response
                if (err) {
                    toast.error(err.message)
                    return
                }
                if (newData) setData(newData)
            })
    }, [debounceSearch, initialData])

    return (
        <div>
            <h2>Search in CSV</h2>
            <form>
                <input type="search" onChange={handleSearch} placeholder="Buscar información en el archivo" value={search}/>
            </form>
            <ul style={{listStyle: 'none', width: '100%', padding: 0}}>
                {
                    data.map((row) => (
                        <li key={row.codigo}>
                            <hr />
                            <article>
                                {Object
                                  .entries(row)
                                  .map(
                                    ([key, value]) => <p key={key} style={{textTransform: 'capitalize'}}><strong>{key}: </strong>{value}</p>)
                                }
                            </article>
                        </li>
                    )
                )
            }
            </ul>
        </div>
    )
}