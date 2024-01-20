import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import Room from './components/Room'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/room' element={<Room />} />
      </Routes>
    </div>
  )
}

export default App