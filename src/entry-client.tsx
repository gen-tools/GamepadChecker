import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' 

const container = document.getElementById('root')
if (container) {
  const root = ReactDOM.hydrateRoot(container, <App />)
}