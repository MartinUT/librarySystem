import React, {useState, useEffect} from 'react';
import httpClient from '../httpClient';


const checkLoggedIn = async() => {
    try {
        const respCheckLoggedIn = await httpClient.get('//localhost:5000/protected');
        if (respCheckLoggedIn.data['username'] !== 'Unauthorized' || respCheckLoggedIn.data['msg'] != 'Token has expired') {
            window.location.href = '/app';
        }
    }
    catch (error: any) {
        return;
    }
}

const RegisterAccount: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<boolean>(true);
    
    
    useEffect(() => {
        checkLoggedIn();
      }, []);
    
    const registerUser = async () => {
        try {
            const resp = await httpClient.post('//localhost:5000/register', {
                username,
                password,
                role: 'laenutaja'
            });
            if (resp.status === 200) {
                alert("Registreeritud!");
                window.location.href = '/';
            }   
        }
        catch (error: any) {
            setErrorMessage(false);
            setUsername('');
            setPassword('');
        }
    }

    const moveToLoginPage = () => {
        window.location.href = '/';
    }

    return (
        <div className = 'loginPageBox'>
            <h1>Registreeri kasutaja</h1>
            <p className = 'errorMessage' hidden = {errorMessage}>Selline kasutaja juba eksisteerib!</p>
            <form action = 'login' method = 'POST'>
                <input className = 'loginInput' type = 'text' name = 'username' id = 'username' value = {username} placeholder = 'kasutajanimi' onChange = {(e) => setUsername(e.target.value)} />
                <input className = 'loginInput' type = 'password' name = 'password' id = 'password' value = {password} placeholder = 'parool' onChange = {(e) => setPassword(e.target.value)} />
                <button className = 'loginFormButton' type = 'button' onClick = {() => registerUser()}>Kinnita</button>
                <button className = 'registrationButton' type = 'button' onClick = {() => moveToLoginPage()}>Tagasi sisselogimise lehele</button>
            </form>
        </div>
    );
};

export default RegisterAccount;

