import { useState } from 'react'
import './App.css'
import Focus from './hooks/focus'
import Eventhandler from './events/eventhandler'

function Home()
{
  return(
    <h3>Home Page</h3>
  )
}

function Login()
{
  return(
    <h3>Login Page</h3>
  )
}

function App() {
  const [count, setCount] = useState(0)

  const isLogin = true;

  const items = ["Apple","Banana","Orange"]

  function handlecount()
  {
    setCount(count + 1)
  }



  return (
    <>
      <p>you clicked {count} times </p>
      {/* <button onClick={() => setCount(count + 1)}>Click here! </button> */}
      <button onClick ={handlecount}>Click here!</button>
      <br></br>
      <Focus />
      <br></br>
      <Eventhandler />
      <br></br>
      {isLogin ? <Home /> : <Login />}

      <select>
      {
        items.map((i, index) => {
          return <option key={index} value={index}>{i}</option>;
        })
      }
    </select>
    </>
  )
}

export default App
