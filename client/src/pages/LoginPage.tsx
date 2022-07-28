import React, {useState, useEffect} from 'react';
import httpClient from '../httpClient';

const checkLoggedIn = async() => {
    try {
        const respCheckLoggedIn = await httpClient.get('//localhost:5000/protected');
        if (respCheckLoggedIn.data['username'] !== 'Unauthorized' || respCheckLoggedIn.data['msg'] != 'Token has expired') {
            window.location.href = '/loggedin';
        }
    }
    catch (error: any) {
        if (window.location.href !== 'http://localhost:3000/') {
            window.location.href = '/';
        }
    }
}

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessageOpen, setErrorMessageOpen] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState('');
    
    useEffect(() => {
        checkLoggedIn();
      }, []);
    
    const logInUser = async () => {
        try {
            const resp = await httpClient.post('//localhost:5000/login', {
                username,
                password
            });
            if (resp.status === 200) {
                window.location.href = '/app';
            }
        }
        catch (error: any) {
            if (error.response.status === 403) {
                setErrorMessage('Vale parool!');
            }
            else if (error.response.status === 401) {
                setErrorMessage('Kasutajat "' + username + '" ei eksisteeri!');
            }
            setErrorMessageOpen(false);
            setUsername('');
            setPassword('');
        }
    }

    const moveToRegistrationPage = () => {
        window.location.href = '/register';
    }

    return (
        <div className = 'loginPageBox'>
            <h1>Logi sisse</h1>
            <p className = 'errorMessage' hidden = {errorMessageOpen}>{errorMessage}</p>
            <form action = 'login' method = 'POST'>
                <input className = 'loginInput' type = 'text' name = 'username' id = 'username' value = {username} placeholder = 'kasutajanimi' onChange = {(e) => setUsername(e.target.value)} />
                <input className = 'loginInput' type = 'password' name = 'password' id = 'password' value = {password} placeholder = 'parool' onChange = {(e) => setPassword(e.target.value)} />
                <button className = 'loginFormButton' type = 'button' onClick = {() => logInUser()}>Kinnita</button>
                <button className = 'registrationButton' type = 'button' onClick = {() => moveToRegistrationPage()}>Registreeri uus kasutaja</button>
            </form>
        </div>
    );
};

export default LoginPage;

