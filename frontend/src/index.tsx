import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme'
import { AppProvider } from './context/AppContext'

ReactDOM.render(
  <React.StrictMode>
    <AppProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </AppProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

reportWebVitals()
