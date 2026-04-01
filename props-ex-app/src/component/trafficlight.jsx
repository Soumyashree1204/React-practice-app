function trafficlight({color}) {
    let msg="";
    switch(color)
    {
        case "red":
            msg="Stop";
            break;
        case "yellow":
            msg="Slow down";
            break;
        case "green":
            msg="Go";
            break;
        default:
            msg="Invalid color";
    }
    return (
        <div>
            <h3>{msg}</h3>
        </div>
    );
}
export default trafficlight;