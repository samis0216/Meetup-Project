import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SignupFormModal from '../SignupFormModal/SIgnupFormModal';
import { useNavigate, NavLink } from 'react-router-dom';
import './ProfileButton.css'


function ProfileButton({ user }) {
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate()
    const ulRef = useRef();

    const toggleMenu = (e) => {
        e.stopPropagation(); // Keep from bubbling up to document and triggering closeMenu
        setShowMenu(!showMenu);
    };

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
            if (!ulRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', closeMenu);

        return () => document.removeEventListener("click", closeMenu);
    }, [showMenu]);

    const closeMenu = () => setShowMenu(false);

    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
        closeMenu();
        navigate('/')
    };

    const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

    return (
        <>
            <div id="profileBtn" onClick={toggleMenu}>
                <i className="fas fa-user-circle fa-lg" style={{color: 'red'}} />
                {showMenu ? <i className="fa-solid fa-chevron-up" style={{color: 'grey'}}></i> : <i className="fa-solid fa-chevron-down" style={{color: 'grey'}}></i>}
            </div>
            <div className={ulClassName} ref={ulRef}>
                {user ? (
                    <>
                        <p>
                            <b className="truncateLongTxt">Hello, {user.firstName}</b>
                            <i className="truncateLongTxt">{user.email}</i>
                        </p>
                        <div id="manage-group-button">
                            <NavLink to="/groups/current" onClick={closeMenu}>Manage Groups</NavLink>
                        </div>
                        <div onClick={logout}>Log Out</div>
                    </>
                ) : (
                    <>
                        <div>
                            <OpenModalMenuItem
                                buttonText="Sign Up"
                                onButtonClick={closeMenu}
                                modalComponent={<SignupFormModal />}
                            />
                        </div>
                        <hr />
                        <div>
                            <OpenModalMenuItem
                                buttonText="Log In"
                                onButtonClick={closeMenu}
                                modalComponent={<LoginFormModal />}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default ProfileButton;
