import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <div>
      <nav style={{ padding: "10px"}}>
        <Link to="/" style={{ marginRight: "10px" }}>Home</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/:id" element={<UserProfile />} />
      </Routes>
    </div>
  );
}

export default App;