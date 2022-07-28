import React, { useEffect } from 'react';
import httpClient from '../httpClient';

const moveToMainPage = () => {
    window.location.href = '/app';
}

const checkLoggedIn = async () => {
    try {
        const respCheckLoggedIn = await httpClient.get('//localhost:5000/protected');
        if (respCheckLoggedIn.data['username'] !== 'Unauthorized' || respCheckLoggedIn.data['msg'] != 'Token has expired') {
            if (window.location.href !== 'http://localhost:3000/loggedin') {
                window.location.href = '/loggedin';
            }
        }
    }
    catch (error: any) {
        if (window.location.href !== 'http://localhost:3000/') {
            window.location.href = '/';
        }
    }
}

const LoggedIn: React.FC = () => {
    useEffect(() => {
        checkLoggedIn();
    }, []);

    return (
        <div className='mainPage'>
            <div>
                <div className='heading'>Raamatu laenutamise süsteem</div>
                <h1>Oled sisse logitud</h1>
                <button className='loginFormButton' onClick={() => moveToMainPage()}>Edasi!</button>
            </div>
        </div>
    );
};

export default LoggedIn;