import React, { useEffect } from 'react';
import httpClient from '../httpClient';

const moveToLoginPage = () => {
  window.location.href = "/";
}

const checkLoggedIn = async () => {
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

const LoggedOut: React.FC = () => {
  useEffect(() => {
    checkLoggedIn();
  }, []);

  return (
    <div className='mainPage'>
      <div>
        <div className='heading'>Raamatu laenutamise süsteem</div>
        <h1>Oled välja logitud!</h1>
        <button className='loginFormButton' onClick={() => moveToLoginPage()}>Sisselogimise lehele!</button>
      </div>
    </div>
  );
};

export default LoggedOut;