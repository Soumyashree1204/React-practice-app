import { useEffect, useState } from "react";
import UserCard from "../components/UserCard";

function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px",background: "#e0eaf0", minHeight: "100vh" }}>
      <h2>User Directory</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

export default Home;