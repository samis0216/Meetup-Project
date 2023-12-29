import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [disabled, setDisabled] = useState(true)
    const { closeModal } = useModal();

    useEffect(()=> {
        if(credential.length >= 4 && password.length >= 6) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(sessionActions.login({ credential, password }))
            .then(closeModal)
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            });
    };

    return (
        <div className='login-form-container'>
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                    {errors.credential && (
                        <p className='error-message'>{errors.credential}</p>
                    )}
                <label>
                    Username or Email
                    <input
                        type="text"
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button className='log-in-button' disabled={disabled} type="submit">Log In</button>
                <button onClick={()=> {
                    setCredential('samis')
                    setPassword('testtest')
                }}>Log in as Demo User</button>
            </form>
        </div>
    );
}

export default LoginFormModal;
