function Eventhandler() 
{
    const handleclick = () =>
    {
        alert("You clicked the button!");
    
    };
    return(
        <button onClick={handleclick}>Click the button!</button>
    );
}
export default Eventhandler;
