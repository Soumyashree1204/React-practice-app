import { useState } from 'react';

function Html() {
    const [html, setHtml] = useState('');
    const [password, setPassword] = useState('');

    const handleChange = (event) => {
        setHtml(event.target.value);
    };

    const handleChangepassword = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        alert("Form submitted!");
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Enter your name :
                <input type="text" value={html} onChange={handleChange} />
            </label>

            <br /><br />

            <label>
                Enter your password:
                <input type="password" value={password} onChange={handleChangepassword} />
            </label>

            <br /><br />

            <button type="submit">Submit</button>

            <p>Your name is : {html}</p>

            
            <p>Your password is :</p>
        </form>
    );
}

export default Html;