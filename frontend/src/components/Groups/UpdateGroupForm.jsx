import './GroupForm.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getOneGroup, patchGroup } from '../../store/groups'

export default function GroupForm({ groupId }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(getOneGroup(groupId))
    }, [dispatch])

    const group = useSelector(state => state.groups.Groups[groupId])
    const user = useSelector(state => state.session.user)
    if (user?.id !== group?.organizerId) navigate('/')

    if (!group) {
        dispatch(getOneGroup(groupId))
    }

    const [location, setLocation] = useState(`${group.city}, ${group.state}`)
    const [groupName, setGroupName] = useState(group.name)
    const [description, setDescription] = useState(group.about)
    const [type, setType] = useState(group.type)
    const [privacy, setPrivacy] = useState(group.private)
    const [imageUrl, setImageUrl] = useState(group.url ? group.url : '')
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
        let group = await dispatch(patchGroup(newGroup, groupId))

        if (group?.errors) {
            console.log(group.errors)
            setErrors(group.errors)
        }

        setDescription('')
        setLocation('')
        setGroupName('')
        setImageUrl('')
        setPrivacy('')
        setType('')

        navigate(-1)
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
        if (!groupName) {
            newErrors.name = 'Name is required';
        }
        if (!location || location?.split(', ').length <= 1) {
            newErrors.location = 'Location is required (City, state)';
        }

        setErrors(newErrors);
    }, [submitted, type, privacy, imageUrl, description, groupName, location])

    if (group && (user.id === group.Organizer.id)) return (
        <div className='group-form-body'>
            <div>
                <p style={{ color: 'teal' }}>UPDATE YOUR GROUPS INFORMATION</p>
                <h2 className='questions'>We'll walk you through a few steps to update your group's information</h2>
            </div>
            <form onSubmit={onSubmit}>
                <div className='form-sections'>
                    <hr />
                    <h2 className='questions'>First, set your group's location</h2>
                    <p>Meetup groups meet locally, in person and online. We'll connect you with people
                        in your area, and more can join you online.</p>
                    {submitted && <span className="errors">{errors.location}</span>}
                    <input type="text" placeholder={`${group.city}, ${group.state}`} value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className='form-sections'>
                    <hr />
                    <h2 className='questions'>What is the name of your group?</h2>
                    <p>Choose a name that will give people a clear idea of what the group is about.
                        Feel free to get creative!</p>
                    {submitted && <div className="errors">{errors.name}</div>}
                    <input type="text" placeholder={groupName} value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </div>
                <div className='form-sections'>
                    <hr />
                    <h2 className='questions'>Now describe what your group will be about</h2>
                    <p>People will see this when we promote your group, but you'll be able to add to it later, too.</p>
                    <div className='desc-list'>
                        <ol>
                            <li>What's the purpose of the group?</li>
                            <li>Who should join?</li>
                            <li>What will you do at your events?</li>
                        </ol>
                    </div>
                    {submitted && <div className="errors">{errors.about}</div>}
                    <textarea rows={15} cols={60} placeholder='Please write at least 30 characters' value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>
                <div className='form-sections'>
                    <hr />
                    <h2 className='questions'>Final steps...</h2>
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
                <button type='submit'>Update group</button>

            </form>
        </div>
    )
}
