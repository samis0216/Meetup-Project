import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import { Modal } from '../../context/Modal';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SignupFormModal from '../SignupFormModal/SIgnupFormModal';
import './Navigation.css';
import { useNavigate } from 'react-router-dom'
import OpenModalMenuItem from './OpenModalMenuItem';

function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);
    const navigate = useNavigate()

    const redirect = () => {
        navigate('/')
    }

    return (
        <div>
            <div className='header'>
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Meetup_1.svg" id='meetup-logo' onClick={redirect}/>
                <div className='new-group-and-login'>
                    {sessionUser && <NavLink className='nav-link-navigation' to='/groups/new'>Start a new group</NavLink>}
                    <ul>
                        {isLoaded && sessionUser ? (

                                <ProfileButton user={sessionUser} />

                        ) :
                        <div className='login-signup-button-container'>
                            <OpenModalButton className={'login-signup'} modalComponent={<LoginFormModal />} buttonText={'Login'}/>
                            <OpenModalButton className={'login-signup'} modalComponent={<SignupFormModal />} buttonText={'Sign Up'} />
                        </div>}
                    </ul>
                </div>
            </div>
            <hr />
        </div>
    );
}

export default Navigation;
