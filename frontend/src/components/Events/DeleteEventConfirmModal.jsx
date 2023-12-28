import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal.jsx';
import { deleteEvent } from '../../store/events.js';

// import './DeleteEventConfirmationModal.css';

export default function DeleteEventConfirmModal({ eventId }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const navigate = useNavigate();

    const handleSubmit = () => {
        closeModal()

        dispatch(deleteEvent(eventId))
            .then(navigate('/events'))
    };

    const handleCancel = () => {

        return closeModal();
    }

    return (
        <>
            <h1>Confirm Delete</h1>
            <h3>Are you sure you want to remove this event?</h3>
            <button onClick={handleSubmit}>Yes &#40;Delete Event&#41;</button>
            <button onClick={handleCancel}>No &#40;Keep Event&#41;</button>
        </>
    );
}
