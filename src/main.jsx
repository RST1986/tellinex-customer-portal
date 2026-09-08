import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MyTellinexNext from './next/MyTellinexNext'
import './index.css'

const useNext = import.meta.env.VITE_MYTELLINEX_NEXT === 'true'
const RootApp = useNext ? MyTellinexNext : App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
)
