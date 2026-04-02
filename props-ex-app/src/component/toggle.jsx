import { useState } from "react";
function toggle()
{
    const [isOn, setIsOn] = useState(false);

    const handletoggle =() =>
    {
        setIsOn(!isOn);
    };

    return(
        <>
        <h3>{isOn ? "ON" : "OFF"}</h3>
        <button onClick={handletoggle}
        style={{backgroundColor: isOn ? "yellow" : "gray"}}>Click here!
        </button>
        </>
    );  
}
export default toggle;