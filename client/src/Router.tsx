import {BrowserRouter, Routes, Route} from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import LoggedOut from './pages/LoggedOut';
import LoggedIn from './pages/LoggedIn';
import MyAccount from './pages/MyAccountPage';
import RegisterAccount from './pages/RegisterPage';

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path = '/' element={<LoginPage/>}/>
                <Route path= '/app' element={<MainPage/>}/>
                <Route path = '/logout' element={<LoggedOut/>}/>
                <Route path = '/loggedin' element={<LoggedIn/>}/>
                <Route path = '/me' element={<MyAccount/>}/>
                <Route path = '/register' element={<RegisterAccount/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default Router;