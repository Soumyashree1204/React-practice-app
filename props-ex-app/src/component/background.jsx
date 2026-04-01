import { useState } from "react";

function background() {
  const [color, setColor] = useState("blue");

  return (
    <div
      onMouseEnter={() => setColor("red")}
      onMouseLeave={() => setColor("blue")}
      style={{
        width: "200px",
        height: "300px",
        backgroundColor: color,
      }}
    >
    </div>
  );
}

export default background;