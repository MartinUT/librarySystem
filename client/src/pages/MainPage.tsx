import React, { useEffect, useRef, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import throttle from 'lodash/throttle';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faHand, faHandshake, faCancel, faRemove, faCheck } from '@fortawesome/free-solid-svg-icons';
import Moment from 'moment';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Avatar from 'react-avatar';
import httpClient from '../httpClient';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { avatarImage, headerDataLaenaja, headerDataLaenutaja, useStyles } from '../constants';
import {logOutUser} from './MyAccountPage';

let bookDataCopy: any = [];
let tooManyRequestsCounter: number = 0;
let tooManyRequestsCounterOverdue: number = 0;

const updateBookQuantityOrBorrowing = async(bookId: any, n: number, update: string) => {
  const currentBook = await fetch('/books/' + bookId).then(res => res.json());
  const id = currentBook[0]['id'];
  const name = currentBook[0]['name'];
  const author = currentBook[0]['author'];
  let quantity = currentBook[0]['quantity'];
  let borrowingTime = currentBook[0]['borrowing_weeks'];
  let method = 'PUT';

  if (update === 'quantity') {
    if (quantity + n === 0) {
      method = 'DELETE';
    }
    else {
      quantity += n;
    }
  }
  else if (update === 'borrowing') {
    borrowingTime += n;
  }
  if (update === 'quantity' && quantity < 0) {
    alert('Raamatu kogus ei saa olla negatiivne! Saad vähendada kogust ' + currentBook[0]['quantity'] + ' võrra.');
  }
  else if (update === 'borrowing' && borrowingTime < 0) {
    alert('Laenutamise aeg nädalates ei saa olla negatiivne! Saad vähendada kogust ' + (currentBook[0]['borrowing_weeks'] - 1) + ' võrra.');
  }
  else {
    let requestOptionsBook = {
      method: method,
      headers: { 'Content-Type': 'application/json',
                  'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        id: id,
        name: name,
        author: author,
        quantity: quantity,
        borrowing_weeks: borrowingTime
      })
    };
    fetch('/books', requestOptionsBook).then(res => res.json());
    setTimeout(function() {window.location.reload()}, 1000);
  }
}

const deleteBook = async(bookId: any) => {
  const requestOptionsBook = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json',
                'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      id: bookId
    })
  };
  fetch('/books', requestOptionsBook).then(res => res.json());
  setTimeout(function() {window.location.reload()}, 1000);
}

function MainPage() {
  const elementsPerPage = 10;
  const [value, setValue] = useState('');
  const [bookDataDict, setBookDataDict] = useState([]);
  const [collection, setCollection] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loggedInUserName, setLoggedInUserName] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loggedInUserRole, setLoggedInUserRole] = useState('');
  const [cancellationIDs, setCancellationIDs] = useState<number[]>([]);
  const [handedOverDatetimes, setHandedOverDatetimes] = useState<number[]>([]);
  const [newBookHeading, setNewBookHeading] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookQuantity, setNewBookQuantity] = useState(1);
  const [modifyCurrentBookQuantity, setModifyCurrentBookQuantity] = useState(0);
  const [modifyBorrowingTime, setModifyBorrowingTime] = useState(1);
  const [errorMessageNewBookOpen, setErrorMessageNewBookOpen] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);
  const classes = useStyles();

  const getLoggedInCredentials = async () => {
    try {
      const resp = await httpClient.get('//localhost:5000/protected');
      if (resp.data['username'] !== 'Unauthorized' || resp.data['msg'] !== 'Token has expired') {
        setLoggedInUserName(resp.data['username']);
      }
      if (resp.data['user_id'] !== 'Unauthorized' || resp.data['msg'] !== 'Token has expired') {
        setLoggedInUserId(resp.data['user_id']);
      }
      if (resp.data['role'] !== 'Unauthorized' || resp.data['msg'] !== 'Token has expired') {
        setLoggedInUserRole(resp.data['role']);
      }
    }
    catch (error: any) {
      window.location.href = '/';
    }
  }
  if (loggedInUserId === null && loggedInUserName === '' && loggedInUserRole === '') {
    getLoggedInCredentials();
  }

  const getLoggedInUserBookings = async () => {
    tooManyRequestsCounter += 1;
    const bookedIDs: number[] = [];
    const handedOverDates: any = {};
    let bookStatuses: any;
    if (loggedInUserRole === 'laenutaja') {
      bookStatuses = await httpClient.get('/book_statuses/' + loggedInUserId);
    }
    else if (loggedInUserRole === 'laenaja') {
      bookStatuses = await httpClient.get('/book_statuses');
    }
    bookStatuses.data.forEach((bookElement: any) => { 
      bookedIDs.push(bookElement['book_id'])
      handedOverDates[bookElement['book_id']] = bookElement['handed_over_borrower']
    });
    setCancellationIDs(bookedIDs);
    setHandedOverDatetimes(handedOverDates);
  }

  const bookDeadline = async(bookId: any) => {
    tooManyRequestsCounterOverdue += 1;
    const currentBook = await fetch('/books/' + bookId).then(res => res.json());
    const weeks = currentBook[0]['borrowing_weeks']
    if (bookId in handedOverDatetimes) {
      const startTime = new Date(handedOverDatetimes[bookId]);
      const endTime = new Date(startTime.setDate(startTime.getDate() + weeks));
      const currentTime = new Date();
      if (endTime < currentTime) {
        setIsOverdue(true);
      }
    }
  }

  if (loggedInUserId !== null) {
    if (tooManyRequestsCounter < 5) {
      getLoggedInUserBookings();
    }
  }

  const handleDialogOpen = (msg: any) => {
    setOpen(true);
    setMessage(msg);
    setTimeout(() => {setOpen(false)}, 2000);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    async function fetchBooks() {
      if (bookDataDict.length === 0) {
        await fetch('/books').then(res => res.json()).then(data => {
          setBookDataDict(data);
          setCollection(data.slice(0, elementsPerPage));
        });
      }
    };
    fetchBooks();
    bookDataCopy = bookDataDict;
    if (!value) {
      updatePage(1);
    }
    else {
      searchBook.current(value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const addNewBook = async() => {
    const requestOptions: any = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        name: newBookHeading,
        author: newBookAuthor,
        quantity: newBookQuantity,
      })
    };
    if (newBookHeading.length === 0 && newBookAuthor.length === 0) {
      setErrorMessage('Raamatu pealkiri ja autor puudu!');
      setErrorMessageNewBookOpen(false);
    }
    else if (newBookHeading.length === 0) {
      setErrorMessage('Raamatu pealkiri puudu!');
      setErrorMessageNewBookOpen(false);
    }
    else if (newBookAuthor.length === 0) {
      setErrorMessage('Raamatu autor puudu!');
      setErrorMessageNewBookOpen(false);
    }
    else {
      try {
        await fetch('/books', requestOptions).then(res => res.json());
        setErrorMessageNewBookOpen(true);
        setTimeout(function() {window.location.reload()}, 1000);
      }
      catch (error: any) {
        setErrorMessage('Selline raamat juba eksisteerib. Vajadusel muuda tabelis kogust!');
        setErrorMessageNewBookOpen(false);
      }
    }
  }

  const handleBookStatus = async(bookId: any, statusValue: any) => {
    let method;
    let readyToIncreaseQuantity = false;
    let reserved = null;
    let received_borrowing = null;
    let returned_borrowing = null;
    let handed_over_borrower = null;
    let returned_borrower = null;
    const currentBookStatus = await fetch('/book_status/' + bookId).then(res => res.json());
    const time = Moment().format('YYYY-MM-DD hh:mm:ss a');
    if (currentBookStatus.length > 0) {
      reserved = currentBookStatus[0]['reserved']
      received_borrowing = currentBookStatus[0]['received_borrowing'];
      returned_borrowing = currentBookStatus[0]['returned_borrowing'];
      handed_over_borrower = currentBookStatus[0]['handed_over_borrower'];
      returned_borrower = currentBookStatus[0]['returned_borrower']
      
      method = 'PUT';
      if (statusValue === 'received') {
        if (reserved !== null && handed_over_borrower !== null && received_borrowing === null) {
          received_borrowing = time;
          handleDialogOpen('Raamat märgitud kättesaaduks!');
        }
        else {
          alert('Raamatut ei saa märkida kättesaanuks!');
        }
      }
      else if (statusValue === 'returned') {
        if (reserved !== null && received_borrowing !== null && handed_over_borrower !== null && returned_borrowing === null) {
          returned_borrowing = time;
          handleDialogOpen('Raamat märgitud tagastatuks!');
        }
        else {
          alert('Raamatut ei saa märkida tagastatuks!');
        }
      }
      else if (statusValue === 'handedOver') {
        if (reserved !== null && handed_over_borrower === null) {
          handed_over_borrower = time;
          handleDialogOpen('Raamat märgitud üleantuks!');
        }
        else {
          alert('Raamatut ei saa märkida üleantuks!');
        }
      }
      else if (statusValue === 'returnedBack') {
        if (reserved !== null && received_borrowing !== null && returned_borrowing !== null && handed_over_borrower !== null && returned_borrower === null) {
          returned_borrower = time;
          readyToIncreaseQuantity = true;
          handleDialogOpen('Raamat märgitud tagastatuks!');
        }
        else {
          alert('Raamatut ei saa märkida tagastatuks!');
        }
      }
      else if (statusValue === 'cancelBooking') {
        method = 'DELETE';
      }
    }
    else if (statusValue === 'booked') {
      method = 'POST';
      reserved = time;
      handleDialogOpen('Raamat broneeritud!');
    }

    let requestOptions: any = {
      method: method,
      headers: { 'Content-Type': 'application/json',
                'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        book_id: bookId,
        user_id: loggedInUserId,
        reserved: reserved,
        received_borrowing: received_borrowing,
        returned_borrowing: returned_borrowing,
        handed_over_borrower: handed_over_borrower,
        returned_borrower: returned_borrower
      })
    };
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TODO: currently we assume there are maximum of two registered users: laenaja as ID = 1 and laenutaja as ID 2.        //
    // For being able to keep track which booking belongs two who, then currently as the solution isn't fully implemented   //
    // we assign the user_id in requestOptions to 2. That way the status of a book borrowed by laenutaja is updated.        //
    if (loggedInUserRole === 'laenaja') {                                                                                   //
      let newBody = JSON.parse(requestOptions['body']);                                                                     //
      newBody['user_id'] = 2;                                                                                               //
      requestOptions['body'] = JSON.stringify(newBody);                                                                     //
    }                                                                                                                       //  
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (method === 'POST') {
      await fetch('/book_status', requestOptions).then(res => res.json());
      updateBookQuantityOrBorrowing(bookId, -1, 'quantity');
    }
    else if (method === 'PUT') {
      if (returned_borrower === null) {
        await fetch('/book_status', requestOptions).then(res => res.json());
      }
      else if (reserved !== null && received_borrowing !== null && returned_borrowing !== null && 
              handed_over_borrower !== null && returned_borrower !== null && readyToIncreaseQuantity === true) {
                updateBookQuantityOrBorrowing(bookId, 1, 'quantity');
        requestOptions['method'] = 'DELETE';
        fetch('/book_status', requestOptions).then(res => res.json());
      }
    }
    else if (method === 'DELETE' && reserved !== null && received_borrowing === null && returned_borrowing === null && 
    handed_over_borrower === null && returned_borrower === null) {
      updateBookQuantityOrBorrowing(bookId, 1, 'quantity');
      fetch('/book_status', requestOptions).then(res => res.json());
      handleDialogOpen('Raamatu broneering tühistatud!');
      setTimeout(function() {window.location.reload()}, 1000);
    }
    else if (method === 'DELETE' && reserved !== null && handed_over_borrower !== null) {
      alert('Raamat on juba üle antud!');
    }
    else {
      alert('Viga: Raamat broneerimata või pole enne tagastamist märgitud üleantuks või kätte saaduks!');
    }
  }

  const searchBook = useRef(
    throttle((val: any) => {
      const query = val.toLowerCase();
      setCurrentPage(1);
      const newData = cloneDeep(
        bookDataCopy
          .filter((item: any) => item.name.toLowerCase().indexOf(query) > -1)
          .slice(0, elementsPerPage)
      );
      setCollection(newData);
    }, 400)
  );

  const updatePage = (p: any) => {
    setCurrentPage(p);
    const to = elementsPerPage * p;
    const from = to - elementsPerPage;
    setCollection(cloneDeep(bookDataDict.slice(from, to)));
  };

  const tableElements = (row: any, headerData: any) => {
    const { key, index } = row;
    const tableCell = Object.keys(headerData);
    const columnData = tableCell.map((i, j) => {
      if (loggedInUserRole === 'laenutaja') {
        if (i === 'booked') {
          return <td key = {j}><button className = 'tableButton' onClick = {() => handleBookStatus(key['id'], i)}><FontAwesomeIcon icon={faBook} /></button></td>;
        }
        else if (i === 'received') {
          return <td key = {j}><button className = 'tableButton' onClick = {() => handleBookStatus(key['id'], i)}><FontAwesomeIcon icon={faHandshake} /></button></td>;
        }
        else if (i === 'returned') {
          return <td key = {j}><button className = 'tableButton' onClick = {() => handleBookStatus(key['id'], i)}><FontAwesomeIcon icon={faHand} /></button></td>;
        }
        else if (i === 'cancelBooking' && cancellationIDs.includes(key['id'])) {
          return <td key = {j}><button className = 'tableButton' onClick = {() => handleBookStatus(key['id'], i)}><FontAwesomeIcon icon={faCancel} /></button></td>;
        }
        else if (isOverdue && key['id'] in handedOverDatetimes && (i === 'name' || i === 'author')) {
          return <td className = 'overdue' key = {j}>{key[i]}</td>;
        }
        else {
          return <td key = {j}>{key[i]}</td>;
        }
      }
      else if (loggedInUserRole === 'laenaja') {
        //TODO: too many requests
        if (tooManyRequestsCounterOverdue < 10) {
          bookDeadline(key['id']);
        }
        if (i === 'handedOver') {
          return <td key = {j}><button className = 'tableButton' onClick = {() => handleBookStatus(key['id'], i)}><FontAwesomeIcon icon={faHandshake} /></button></td>;
        }
        else if (i === 'returnedBack') {
          return <td key = {j}><button className = 'tableButton' onClick = {() => handleBookStatus(key['id'], i)}><FontAwesomeIcon icon={faHand} /></button></td>;
        }
        else if (i === 'cancelBooking' && cancellationIDs.includes(key['id'])) {
          return <td key = {j}><button className = 'tableButton' onClick = {() => handleBookStatus(key['id'], i)}><FontAwesomeIcon icon={faCancel} /></button></td>;
        }
        else if (i === 'remove') {
          return <td key = {j}><button className = 'tableButton' onClick = {() => deleteBook(key['id'])}><FontAwesomeIcon icon={faRemove} /></button></td>;
        }
        else if (i === 'changeQuantity') {
          return <td key = {j}><input className = 'modifyCounter' type = 'number' name = 'newBookQuantityInput' id = 'newBookQuantityInput' placeholder = '0' 
                                      onChange = {(e) => setModifyCurrentBookQuantity(e.target.valueAsNumber)} />
                               <button className = 'modifyCounterButton' onClick = {() => updateBookQuantityOrBorrowing(key['id'], modifyCurrentBookQuantity, 'quantity')}><FontAwesomeIcon icon={faCheck} /></button></td>
        }
        else if (i === 'changeBorrowingTime') {
          return <td key = {j}><input className = 'modifyCounter' type = 'number' name = 'newBorrowingTimeInput' id = 'newBorrowingTimeInput' placeholder = '0' 
                                      onChange = {(e) => setModifyBorrowingTime(e.target.valueAsNumber)} />
                               <button className = 'modifyCounterButton' onClick = {() => updateBookQuantityOrBorrowing(key['id'], modifyBorrowingTime, 'borrowing')}><FontAwesomeIcon icon={faCheck} /></button></td>
        }
        else if (isOverdue && key['id'] in handedOverDatetimes && (i === 'name' || i === 'author')) {
          return <td className = 'overdue' key = {j}>{key[i]}</td>;
        }
        else {
          return <td key = {j}>{key[i]}</td>;
        }
        
      }
    });
    return <tr key = {index}>{columnData}</tr>;
    
  };

  const table = (headerData: any) => {
    return collection.map((key, index) => tableElements({ key, index }, headerData));
  };

  const header = (headerData: any) => {
    const headerCell = Object.values(headerData);
    return headerCell.map((title: any, index) => (
      <td key = {index}>{title}</td>
    ));
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openAnchorEl = Boolean(anchorEl);
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const moveToMyAccount = () => {
    window.location.href = '/me';
  }

  return (
    <div className = 'mainPage'>
      <div>
        <Avatar onClick = {(e) => setAnchorEl(e.currentTarget)} className = 'avatar' 
          src = {avatarImage}/>
        <Menu
          anchorEl = {anchorEl}
          open = {openAnchorEl}
          onClose = {handleCloseMenu}
          anchorOrigin = {{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => moveToMyAccount()}>Minu konto</MenuItem>
          <MenuItem onClick={() => {handleCloseMenu(); logOutUser();}}>Logi välja</MenuItem>
        </Menu>
        <p className = 'avatarText'>Tere, {loggedInUserName}!</p>
      </div>
      <div className = 'heading'>Raamatu laenutamise süsteem
      </div>
        <div className = 'otsing'>
          <input
            className = 'searchField'
            placeholder = 'Otsi raamatut pealkirja alusel'
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <table>
          <thead>
            {loggedInUserRole === 'laenaja' ? (
              <tr className = 'header'>{header(headerDataLaenaja)}</tr>
            ) : (
              <tr className = 'header'>{header(headerDataLaenutaja)}</tr>
            )}
          </thead>
          {loggedInUserRole === 'laenaja' ? (
            <tbody className = 'table'>{table(headerDataLaenaja)}</tbody>
          ) : (
            <tbody className = 'table'>{table(headerDataLaenutaja)}</tbody>
          )}
        </table>
        <Pagination
          className = 'pagination'
          pageSize = {elementsPerPage}
          onChange = {updatePage}
          current = {currentPage}
          total = {bookDataDict.length}
        />
        <Dialog
          open = {open}
          onClose = {handleDialogClose}
        >
          <DialogContent className = 'dialog'>
            <DialogContentText>
            <Typography component = 'span' className={classes.custom}>
              {message}
            </Typography>
            </DialogContentText>
          </DialogContent>
        </Dialog>
        {loggedInUserRole === 'laenaja' ? (
        <><form className='addBookForm'>
          <div className='addBookFormHeading'>Lisa uus raamat laenamiseks</div>
          <p className='errorMessageNewBook' hidden={errorMessageNewBookOpen}>{errorMessage}</p>
          <input className='addBookInput' type='text' name='newBookHeadingInput' id='newBookHeadingInput' value={newBookHeading} placeholder='pealkiri' onChange={(e) => setNewBookHeading(e.target.value)} />
          <input className='addBookInput' type='text' name='newBookAuthorInput' id='newBookAuthorInput' value={newBookAuthor} placeholder='autor' onChange={(e) => setNewBookAuthor(e.target.value)} />
          <input className='addBookInputQuantity' type='number' min='1' name='newBookQuantityInput' id='newBookQuantityInput' value={newBookQuantity} placeholder='kogus' onChange={(e) => setNewBookQuantity(e.target.valueAsNumber)} />
        </form><button className='newBookConfirmButton' type='button' onClick={() => addNewBook()}>Kinnita!</button></>
        ) : (<></>)}
    </div>
  );
}

export default MainPage;
