import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../context/Modal.jsx';
import { deleteEvent, getEventById } from '../../store/events.js';

import './DeleteEventConfirmationModal.css';
import { useEffect } from 'react';

export default function DeleteEventConfirmModal({ eventId }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const navigate = useNavigate();

    useEffect(()=> {
        dispatch(getEventById(eventId))

    }, [])

    const groupId = useSelector(state => state.events.allEvents[eventId].groupId)
    console.log(groupId)

    const handleSubmit = () => {
        closeModal()

        dispatch(deleteEvent(eventId))
            .then(navigate('/events'))
    };

    const handleCancel = () => {

        return closeModal();
    }

    return (
        <div className='modal-content'>
            <h3 style={{fontWeight: 500}}>Confirm Delete</h3>
            <p style={{marginTop: 0}}>Are you sure you want to remove this event?</p>
            <div className='button-container-delete'>
                <button className='delete-buttons' id='delete-confirm' onClick={handleSubmit}>Yes &#40;Delete Event&#41;</button>
                <button className='delete-buttons' id='delete-cancel' onClick={handleCancel}>No &#40;Keep Event&#41;</button>
            </div>
        </div>
    );
}
