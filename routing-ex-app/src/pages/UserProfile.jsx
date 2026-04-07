import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px",background: "#ebc9f5", borderRadius: "15px", maxWidth: "400px", margin: "20px auto" }}>
      <h2>{user.name}</h2>

      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>Website:</strong> {user.website}</p>

      <h3>Address</h3>
      <p>
        {user.address.street}, {user.address.city}
      </p>

      <h3>Company</h3>
      <p>{user.company.name}</p>

      <Link to="/">
        <button>Back</button>
      </Link>
    </div>
  );
}

export default UserProfile;