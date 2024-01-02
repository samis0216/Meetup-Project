import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupForm.css';

function SignupFormModal() {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [disabled, setDisabled] = useState(true)
    const { closeModal } = useModal();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            setErrors({});
            return dispatch(
                sessionActions.signup({
                    email,
                    username,
                    firstName,
                    lastName,
                    password
                })
            )
                .then(closeModal)
                .catch(async (res) => {
                    const data = await res.json();
                    if (data?.errors) {
                        setErrors(data.errors);
                    }
                });
        } else {
            return setErrors({
                confirmPassword: "Confirm Password field must be the same as the Password field"
            });
        }
    };

    useEffect(() => {
        let boolean = true
        if (username.length >= 4 &&
            password.length >= 6 &&
            email.length > 0 &&
            firstName.length > 0 &&
            lastName.length > 0 &&
            confirmPassword.length > 0) {
                boolean = false
        }

        setDisabled(boolean);
    }, [username, password, password, email, firstName, lastName, confirmPassword])

    return (
        <div className='signupFormContainer'>
            <h2 style={{ fontWeight: 400 }}>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                {errors.email && <p className='errors'>{errors.email}</p>}
                <label>
                    Email
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                {errors.username && <p className='errors'>{errors.username}</p>}
                <label>
                    Username
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
                {errors.firstName && <p className='errors'>{errors.firstName}</p>}
                <label>
                    First Name
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </label>
                {errors.lastName && <p className='errors'>{errors.lastName}</p>}
                <label>
                    Last Name
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </label>
                {errors.password && <p className='errors'>{errors.password}</p>}
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                {errors.confirmPassword && (
                    <p className='errors'>{errors.confirmPassword}</p>
                    )}
                <label>
                    Confirm Password
                    <input
                        type="password"
                        value={confirmPassword}
                        required
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </label>
                <button id='submitSignup' type="submit" disabled={disabled}>Sign Up</button>
            </form>
        </div>
    );
}

export default SignupFormModal;
