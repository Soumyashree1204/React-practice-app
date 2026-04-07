import { Link } from "react-router-dom";

function UserCard({ user }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "25px",
        borderRadius: "20px",
        width: "230px",
        background: "#e4dfdf",
      }}
    >
      <h3>{user.name}</h3>
      <p>{user.email}</p>

      <Link to={`/user/${user.id}`}>
        <button>View Profile</button>
      </Link>
    </div>
  );
}

export default UserCard;