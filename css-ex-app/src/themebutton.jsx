import { useState } from "react"
import styles from "./modulecss/themebutton.module.css"

function ThemeButton() {
  const [theme, setTheme] = useState("light")

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className={theme === "dark" ? styles.dark : styles.light}
      style={{ minHeight: "200px",width: "300px", display: "flex", 
               justifyContent: "center", alignItems: "center",padding: "20px",gap: "30px" }}>

      <button
        className={`${styles.base} ${theme === "light" ? styles.light : styles.dark}`}
        onClick={toggleTheme}
      >
        {theme === "light" ? "Switch to Dark" : "Switch to Light"}
      </button>

    </div>
  )
}

export default ThemeButton