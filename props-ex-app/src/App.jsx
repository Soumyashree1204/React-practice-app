import './App.css'
import Buttonprops from './component/Buttonprops'
import Toggle from './component/toggle'
import TextMirror from './component/textmirror'
import Background from './component/background'
import Trafficlight from './component/trafficlight'
import Todolist from './component/todolist' 

function App() {

  return (
    <>
    <div>
      <Buttonprops label="Delete" color="red" />
      <Buttonprops label="Success" color="green" />
    </div>
    <br></br>
    <Toggle />
    <br></br>
    <TextMirror />
    <br></br>
    <Background />
    <br></br>
    <Trafficlight color="red"/>
    <Trafficlight color="yellow"/>
    <Trafficlight color="green"/>
    <br></br>
    <Todolist />
      
    </>
  )
}

export default App
