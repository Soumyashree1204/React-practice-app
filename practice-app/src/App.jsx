import './App.css'
import Dummy from './components/dummy'
import Header from './components/Header'

function App() {

  return (
    <>
      <h1>Hello World</h1>
      <Dummy />
      <h2>Current year : {new Date().getFullYear()}</h2>
      <Header />
    </>
  )
}

export default App
