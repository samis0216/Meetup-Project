import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SignupFormModal from '../SignupFormModal/SIgnupFormModal';
import './Navigation.css';
import { useNavigate } from 'react-router-dom'

function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);
    const navigate = useNavigate()

    const redirect = () => {
        navigate('/')
    }

    return (
        <div>
            <div className='header'>
                <img src="https://assets.stickpng.com/images/584c57c01fc21103bb375bae.png" id='meetup-logo' onClick={redirect}/>
                <ul>
                    <li>
                        <NavLink exact to="/">Home</NavLink>
                    </li>
                    {isLoaded && (
                        <li>
                            <ProfileButton user={sessionUser} />
                        </li>
                    )}
                </ul>
            </div>
            <hr />
        </div>
    );
}

export default Navigation;
