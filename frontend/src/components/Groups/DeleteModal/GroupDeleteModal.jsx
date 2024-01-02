import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useModal } from '../../../context/Modal.jsx';
import { deleteGroup } from '../../../store/groups.js';

import './GroupDeleteModal.css'

function GroupDeleteModal({ groupId }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const navigate = useNavigate();

    const handleSubmit = () => {
        dispatch(deleteGroup(groupId))
            .then(closeModal)
            .then(navigate('/groups'))
    };

    const handleCancel = () => {

        return closeModal();
    }

    return (
        <div className='modal-content'>
            <h3 id='delete-group-header' style={{fontWeight: 500}}>Confirm Delete</h3>
            <p style={{marginTop: 0}}>Are you sure you want to remove this group?</p>
            <div className='button-container-delete'>
                <button className='delete-buttons' id='delete-confirm' onClick={handleSubmit}>Yes &#40;Delete Group&#41;</button>
                <button className='delete-buttons' id='delete-cancel' onClick={handleCancel}>No &#40;Keep Group&#41;</button>
            </div>
        </div>
    );
}

export default GroupDeleteModal;
