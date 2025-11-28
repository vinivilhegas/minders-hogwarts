import React from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import HousesList from './pages/HousesList'
import HouseDetail from './pages/HouseDetail'
import SpellsList from './pages/SpellsList'
import SpellDetail from './pages/SpellDetail'
import logo from './assets/logo.png'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <header className="header">
        <Link to="/home" className="logo-link">
          <img src={logo} alt="Hogwarts Logo" className="logo-img" />
        </Link>

        <nav className="menu">
          <Link to="/spells" className="menu-link">Spells</Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HousesList />} />
          <Route path="/houses/:id" element={<HouseDetail />} />
          <Route path="/spells" element={<SpellsList />} />
          <Route path="/spells/:id" element={<SpellDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}