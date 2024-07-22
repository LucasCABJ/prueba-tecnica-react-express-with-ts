import express from 'express'
import cors from 'cors'
import multer from 'multer'
import csvToJson from 'convert-csv-to-json'

const app = express()
const port = process.env.PORT ?? 3000

const storage = multer.memoryStorage()
const upload = multer({ storage })

let userData: Array<Record<string, string>> = []

app.use(cors()) // Enable CORS

app.post('/api/files', upload.single('file'), async (req, res) => {
    // 1. Extract file sent in request
    const { file } = req
    // 2. Validate file exists
    if (!file) return res.status(500).json({ message: 'File not found'})
    // 3. Validate file type (.csv)
    if (file.mimetype != 'text/csv') return res.status(500).json({ message: 'File type not supported, must be .csv' })
    
    let jsonArr: Array<Record<string, string>> = []
    try {
        // 4. Transform Buffer to String
        const csv = Buffer.from(file.buffer).toString('latin1').normalize('NFD').replace(/[\u0300-\u036f]/g,"").toLowerCase()
        // 5. CSV to JSON Array
        jsonArr = csvToJson.fieldDelimiter(';').csvStringToJson(csv)
    } catch (e) {
        return res.status(500).json({message: 'Error while parsing the file'})
    }
    // 6. Save in db or memory
    userData = jsonArr
    // 7. Return 200 with message and json
    return res.status(200).json({ data: jsonArr, message: "El archivo se cargó correctamente" })
})

app.get('/api/users', async (req, res) => {
    // 1. Extract the query param 'q' from request
    const { q } = req.query
    // 2. Validate that query param 'q' exists
    if (!q) return res.status(500).json({ message: 'Query param "q" is required' })
    
    if (Array.isArray(q)) return res.status(500).json({ message: 'Query param "q" must be a string'})
    // 3. Filter the data within db (or memory)
    const search = q.toString().toLowerCase()
    // if (q === "") return res.status(200).json({ data: userData })
    const filteredData = userData.filter(item => {
        return Object
            .values(item)
            .some(value => {
                return value.toLowerCase().includes(search)
            })
    })
    // 4. Return 200 with filter data results
    return res.status(200).json({ data: filteredData })
})

app.get('/api/users/:id', async (req, res) => {
    // 1. Extract the params 'q' from request
    const { id } = req.params
    // 2. Validate that query param 'q' exists and it's a string
    if (!id) return res.status(500).json({ message: 'Request param ":id" is required' })
    if (Array.isArray(id)) return res.status(500).json({ message: 'Request param ":id" must be a string'})
    // 3. Filter the data within db (or memory)
    const search = id.toString().toLowerCase()
    const filteredData = userData.find(item => {
        return item['Codigo'] == id
    })
    // 4. Return 200 with filter data results
    return res.status(200).json({ data: filteredData })
})

app.listen(port, () => {
    console.log(`Server listening on ${port}`)
})

