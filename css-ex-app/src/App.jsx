import Card from "./card"
import ThemeButton from "./themebutton"

    function App() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "20px" }}>
      <Card />
      <br></br>
      <ThemeButton />
    </div>
  )
}

export default App
