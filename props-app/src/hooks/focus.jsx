import { useRef } from "react";

function Focus() {
    const input1 = useRef(null);

    const onButtonClick = () => {
        input1.curent?.focus();
    };

    return(
        <>
        <input ref={input1} type="text" />
        <button onClick ={onButtonClick}>Focus the input</button>

        </> 

    );
}

export default Focus;
