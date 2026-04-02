import styles from "./modulecss/card.module.css";

function Card() {
  return (
    <div className={styles.container}>
      <h2 style={{color:"red"}}>This is a card using CSS Modules</h2>
    </div>
  )
}

export default Card