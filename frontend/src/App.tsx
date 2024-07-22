import { useState } from 'react'
import './App.css'
import { Toaster, toast } from 'sonner'
import { uploadFile } from './services/upload'
import { type Data } from './types'
import { Search } from './components/Search'

const APP_STATUS = {
  IDLE: "idle", // FIRST VIEW 
  ERROR: "error", // WHEN ERROR
  READY_UPLOAD: "ready-upload", // WHILE SELECTING FILE
  UPLOADING: "uploading", // WHILE UPLOADING
  READY_USAGE: "ready-usage" // AFTER UPLOAD
}

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD]: "Subir archivos",
  [APP_STATUS.UPLOADING]: "Subiendo..."
}

type AppStatusType = typeof APP_STATUS[keyof typeof APP_STATUS]

function App() {

  console.log(import.meta.env.VITE_API_HOST);
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE)
  const [ data, setData ] = useState<Data>([])
  const [file, setFile] = useState<File | null>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? []

    if (file) {
      setFile(file)
      setAppStatus(APP_STATUS.READY_UPLOAD)
    }

  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (appStatus != APP_STATUS.READY_UPLOAD || !file) {
      return
    }

    setAppStatus(APP_STATUS.UPLOADING)

    const [err, newData] = await uploadFile(file)

    if(err) {
      setAppStatus(APP_STATUS.ERROR)
      toast.error(err.message)
      return
    }

    setAppStatus(APP_STATUS.READY_USAGE)
    if (newData) setData(newData)
    toast.success("Archivo subido exitosamente")

  }

  const showButton = appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING
  const showInput = appStatus != APP_STATUS.READY_USAGE
  const showSearch = appStatus === APP_STATUS.READY_USAGE

  return (
    <>
      <Toaster />
      <h4>Challenge: Upload CSV + Search</h4>
      {
        showSearch && (
          <Search initialData={data} />
        )
      }
      { showInput && (
        <form onSubmit={handleSubmit}>
        <label htmlFor="file">
          <input
            onChange={handleInputChange}
            name="file"
            type="file"
            accept='.csv' />
        </label>
        {showButton
          &&
          (<button disabled={appStatus === APP_STATUS.UPLOADING}>{BUTTON_TEXT[appStatus]}</button>)
        }
      </form>
      )}
    </>
  )
}

export default App
