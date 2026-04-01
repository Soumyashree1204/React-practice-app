function Buttonprops({label,color})
{
    return (
    <button style={{ backgroundColor: color, color: "white"}}>
      {label}
    </button>
  );
}
export default Buttonprops;