const TailwindCard = () => {
  return (
    <div
      style={{
        backgroundColor: "gray",
        color: "black",
        padding: "20px",
        width: "300px",
        height: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <h2 style={{ color: "black", fontSize: "20px", marginBottom: "10px" }}>
        This is Tailwind CSS
      </h2>
    </div>
  );
};

export default TailwindCard;