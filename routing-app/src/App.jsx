import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import About from './components/about'
import Home from './components/home'
import Contact from './components/contact'

function App() {

  return (
    <>
      <nav style={{display: 'flex', gap: '15px'}}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <div className='container'>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
      </Routes>
    </div>
    </>         
  )
}

export default App