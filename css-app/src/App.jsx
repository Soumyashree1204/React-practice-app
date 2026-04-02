import './App.css';
import styles from './App.module.css';
import TailwindCard from './tailwindcard';
import Styledlib from './styledlib';  


function App() {
  return (
    <div className="container">

      <div className="box">
        <h2>This is External CSS</h2>
      </div>

      <div className={styles.title}>
        This is CSS module.
      </div>

      <div
        className="abc"
        style={{
          color: "white",
          fontSize: "20px",
          height: "200px",
          width: "300px",
          padding: "20px",
          backgroundColor: "blue",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        This is Inline CSS
      </div>
      <Styledlib />
      <TailwindCard />

    </div>
  );
}

export default App;