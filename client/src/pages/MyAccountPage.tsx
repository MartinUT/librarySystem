import React, {useState } from 'react';
import Avatar from 'react-avatar';
import httpClient from '../httpClient';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export const logOutUser = async () => {
  try {
      const resp = await httpClient.get('//localhost:5000/logout');
      if (resp.status === 205) {
        window.location.href = '/logout';
      }
  }
  catch (error: any) {
      return;
  }
}

const MyAccount: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [loggedInUserName, setLoggedInUserName] = useState('');
  const [loggedInUserRole, setLoggedInUserRole] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [numberOfBorrowings, setNumberOfBorrowings] = useState(0);

  const getLoggedInCredentials = async () => {
    try {
      const resp = await httpClient.get('//localhost:5000/protected');
      if (resp.data['username'] !== 'Unauthorized' || resp.data['msg'] != 'Token has expired') {
        setLoggedInUserName(resp.data['username']);
      }
      if (resp.data['role'] !== 'Unauthorized' || resp.data['msg'] != 'Token has expired') {
        setLoggedInUserRole(resp.data['role']);
      }
      if (resp.data['user_id'] !== 'Unauthorized' || resp.data['msg'] != 'Token has expired') {
        setLoggedInUserId(resp.data['user_id']);
      }
    }
    catch (error: any) {
      window.location.href = '/';
    }
  }
  const getNumberOfBorrowings = async () => {
    if (loggedInUserId !== null) {
        const borrowings = await fetch('/book_statuses/' + loggedInUserId).then(res => res.json());
        setNumberOfBorrowings(borrowings.length);
    }
  }

  getLoggedInCredentials();
  getNumberOfBorrowings();

  const openAnchorEl = Boolean(anchorEl);
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const moveToMainPage = () => {
    window.location.href = '/app';
  }

  return (
    <div className = 'mainPage'>
      <div>
        <Avatar onClick = {(e) => setAnchorEl(e.currentTarget)} className = 'avatar' 
          src = 'https://media.istockphoto.com/vectors/user-icon-flat-isolated-on-white-background-user-symbol-vector-vector-id1300845620?k=20&m=1300845620&s=612x612&w=0&h=f4XTZDAv7NPuZbG0habSpU0sNgECM0X7nbKzTUta3n8='/>
        <Menu
          anchorEl = {anchorEl}
          open = {openAnchorEl}
          onClose = {handleCloseMenu}
          anchorOrigin = {{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem>Minu konto</MenuItem>
          <MenuItem onClick={() => {handleCloseMenu(); logOutUser();}}>Logi välja</MenuItem>
        </Menu>
        <p className = 'avatar'>Tere, {loggedInUserName}!</p>
      </div>
      <div className = 'heading'>Raamatu laenutamise süsteem</div>
      <h2>Oled rollis: {loggedInUserRole}</h2>
      {loggedInUserRole === 'laenaja' ? ( 
        <h2>Raamatuid välja laenutatud: {(numberOfBorrowings)}</h2>
      ) : (
        <h2>Sinu praegune laenutuste arv: {(numberOfBorrowings)}</h2>
      )}
      <button className='loginFormButton' onClick={() => moveToMainPage()}>Tagasi pealehele!</button>
    </div>
  );
}

export default MyAccount;