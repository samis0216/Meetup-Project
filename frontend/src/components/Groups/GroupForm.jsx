import './GroupForm.css'
import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { postGroup } from '../../store/groups'

export default function GroupForm() {
    const dispatch = useDispatch()
    const [location, setLocation] = useState('')
    const [groupName, setGroupName] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState('Online')
    const [privacy, setPrivacy] = useState('Private')
    const [imageUrl, setImageUrl] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState({})

    const grabLocation = (location) => {
        const city = location.split(',')[0]
        const state = location.split(' ')[1]
        return {
            city,
            state
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setSubmitted(true)
        const locationObj = grabLocation(location)
        const newGroup = {
            name: groupName,
            city: locationObj.city,
            state: locationObj.state,
            about: description,
            type,
            private: privacy,
        }
        console.log(newGroup)
        let group = await dispatch(postGroup(newGroup))
        if (group.errors) {
            console.log(group.errors)
            setErrors(group.errors)
        }

        setDescription('')
        setLocation('')
        setGroupName('')
        setImageUrl('')
        setPrivacy('')
        setType('')
    }

    useEffect(() => {
        const newErrors = {};

        if (!type) {
            newErrors.type = 'Group Type is required';
        }
        if (privacy === '') {
            newErrors.private = 'Visibility Type is required';
        }
        if ((!imageUrl?.endsWith('.png') && !imageUrl?.endsWith('.PNG') && !imageUrl?.endsWith('.jpg') && !imageUrl?.endsWith('.JPG') && !imageUrl?.endsWith('.jpeg') && !imageUrl?.endsWith('.JPEG')) && imageUrl) {
            newErrors.image = 'Image URL must end in .png, .jpg, or .jpeg';
        }
        if (description?.length < 30) {
            newErrors.about = 'Description must be at least 30 characters long';
        }
        if (groupName) {
            newErrors.name = 'Name is required';
        }
        if (!location || location?.split(', ').length <= 1) {
            newErrors.location = 'Location is required (City, state)';
        }

        setErrors(newErrors);
    }, [submitted, type, privacy, imageUrl, description, groupName, location])

    return (
        <div className='group-form-body'>
            <div>
                <p>BECOME AN ORGANIZER</p>
                <h4>We'll walk you through a few steps to build your local community</h4>
            </div>
            <form onSubmit={onSubmit}>
                <div className='form-sections'>
                    <hr />
                    <h4>First, set your group's location</h4>
                    <p>Meetup groups meet locally, in person and online. We'll connect you with people
                        in your area, and more can join you online.</p>
                    {submitted && <span className="errors">{errors.location}</span>}
                    <input type="text" placeholder='City, STATE' value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className='form-sections'>
                    <hr />
                    <h4>What will your group's name be?</h4>
                    <p>Choose a name that will give people a clear idea of what the group is about.
                        Feel free to get creative! You can edit this later if you change your mind.</p>
                        {submitted && <div className="errors">{errors.name}</div>}
                    <input type="text" placeholder='What is your group name?' value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </div>
                <div className='form-sections'>
                    <hr />
                    <h4>Now describe what your group will be about</h4>
                    <p>People will see this when we promote your group, but you'll be able to add to it later, too.</p>
                    <div className='desc-list'>
                        <ol>
                            <li>What's the purpose of the group?</li>
                            <li>Who should join?</li>
                            <li>What will you do at your events?</li>
                        </ol>
                    </div>
                    {submitted && <div className="errors">{errors.about}</div>}
                    <textarea placeholder='Please write at least 30 characters' value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>
                <div className='form-sections'>
                    <hr />
                    <h4>Final steps...</h4>
                    <p>Is this an in person or online group?</p>
                    {submitted && <div className="errors">{errors.type}</div>}
                    <select name="" id="" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="In person">In person</option>
                        <option value="Online">Online</option>
                    </select>
                    <p>Is this group private or public?</p>
                    {submitted && <div className="errors">{errors.private}</div>}
                    <select name="" id="" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                        <option value={true}>Private</option>
                        <option value={false}>Public</option>
                    </select>
                    <p>Please add an image url for your group below:</p>
                    {submitted && <div className="errors">{errors.image}</div>}
                    <input type="text" placeholder='Image URL' value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                    <hr />
                </div>
                <button type='submit'>Create group</button>

            </form>
        </div>
    )
}
