import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import './CreateEventForm.css'
import { useNavigate, useParams } from "react-router-dom";
import { getGroups } from "../../store/groups";
import { getEvents, postEvent, postEventImage } from "../../store/events";

export default function CreateEventForm() {
    const [name, setName] = useState('');
    const [type, setType] = useState('none');
    const [privacy, setPrivacy] = useState('none');
    const [price, setPrice] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [venueId, setVenueId] = useState(1);
    const [errors, setErrors] = useState({});
    // const [preview, setPreview] = useState(false);
    const [capacity, setCapacity] = useState(100);
    const [capExists, setCapExists] = useState(false);
    const [submitted, setSubmitted] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { groupId } = useParams()
    useEffect(() => {
        dispatch(getGroups())
        dispatch(getEvents())
    }, [dispatch])


    useEffect(() => {
        const newErrors = {};
        if (type === 'none') {
            newErrors.type = 'Event Type is required';
        }
        if (privacy == 'none') {
            newErrors.privacy = 'Visibility is required';
        }

        if (!url?.endsWith('.png') && !url?.endsWith('.PNG') && !url?.endsWith('.jpg') && !url?.endsWith('.JPG') && !url?.endsWith('.jpeg') && !url?.endsWith('.JPEG')) {
            newErrors.url = 'Image URL must end in .png, .jpg, or .jpeg';
        }
        if (description?.length < 30) {
            newErrors.description = 'Description must be at least 30 characters long';
        }
        if (!name) {
            newErrors.name = 'Name is required';
        }
        if (name?.length > 60) {
            newErrors.name = 'Name must be between 60 and 3 characters';
        }
        if (name?.length < 3) {
            newErrors.name = 'Name must be 3 character or more'
        }
        if (!price) {
            newErrors.price = 'Price is required';
        }
        if (!startDate) {
            newErrors.startDate = 'Event start is required'
        }
        if (new Date(startDate).getTime() < new Date().getTime()) {
            newErrors.startDate = 'Event start must be in the future'
        }
        if (!endDate) {
            newErrors.endDate = 'Event end is required'
        }
        if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
            newErrors.endDate = 'Event end must be after the start'
        }
        setErrors(newErrors);
    }, [submitted, type, privacy, url, description, name, price, startDate, endDate])

    const group = useSelector((state) => state.groups.Groups[groupId])
    // const events = useSelector((state) => state.events.Events[groupId])

    const onSubmit = async (e) => {
        e.preventDefault()

        setSubmitted(true)

        const newEvent = {
            venueId,
            name,
            type,
            capacity,
            price: Number(price),
            description,
            startDate,
            endDate
        }

        if (Object.values(errors).length) {
            newEvent.errors = errors
        }

        if (!newEvent.errors) {
            const event = await dispatch(postEvent(newEvent, groupId))
            const imageShit = await dispatch(postEventImage(event.id, url))
            navigate(`/events/${event.id}`)
        }
    }

    if (group) return (
        <div className="event-create-body">
            <div>
                <div>
                    <h2 className="questions">Create an event for {group.name}</h2>
                    {submitted && <div className="errors">{errors.name}</div>}
                    <p>What is the name of your event?</p>
                    <input type="text" placeholder="Event Name" onChange={(e) => setName(e.target.value)} />
                </div>
                <hr />
                <div>
                    {submitted && <div className="errors">{errors.type}</div>}
                    <p>Is this an in person or online event?</p>
                    <select name="type" value={type} id="type-select" onChange={(e) => setType(e.target.value)}>
                        <option disabled={true} value={'none'}>(select one)</option>
                        <option value="In person">In person</option>
                        <option value="Online">Online</option>
                    </select>
                </div>
                <div>
                    {submitted && <div className="errors">{errors.privacy}</div>}
                    <p>Is this event private or public?</p>
                    <select name="type" id="type-select" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                        <option disabled={true} value={'none'}>(select one)</option>
                        <option value={true}>Private</option>
                        <option value={false}>Public</option>
                    </select>
                </div>
                <div>
                    <p>Does your event have a capacity limit?</p>
                    <div className="cap-q">
                        <label htmlFor="yes-capacity">Yes</label>
                        <input type="radio" id="yes-capacity" name="capacityExists" value={true} onClick={() => setCapExists(true)} />
                    </div>
                    <div className="cap-q">
                        <label htmlFor="no-capacity">No</label>
                        <input type="radio" id="no-capacity" name="capacityExists" value={false} onClick={() => { setCapExists(false); setCapacity(100); console.log(capacity) }} />
                    </div>
                </div>
                {capExists &&
                    <div>
                        <p>What is your event capacity?</p>
                        <input min={0} value={capacity} type="number" placeholder="Capacity" onChange={(e) => setCapacity(e.target.value)} />
                    </div>}
                <div>
                    {submitted && <div className="errors">{errors.price}</div>}
                    <p>What is the price for your event?</p>
                    <div id="price-container">
                        <i id='dollar-sign' className="fa-solid fa-dollar-sign"></i>
                        <input value={price} type="number" id="price-input" onChange={(e) => setPrice(e.target.value)}></input>
                    </div>
                </div>
                <hr />
                {submitted && <div className="errors">{errors.startDate}</div>}
                <p>When does your event start?</p>
                <div className="calendar-entry">
                    <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <i class="fa-regular fa-calendar-days"></i>
                </div>
                {submitted && <div className="errors">{errors.endDate}</div>}
                <p>When does your event end?</p>
                <div className="calendar-entry">
                    <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <i class="fa-regular fa-calendar-days"></i>
                </div>
                <hr />
                <div>
                    {submitted && <div className="errors">{errors.url}</div>}
                    <p>Please add an image url for your event below:</p>
                    <input value={url} type="text" placeholder="Image URL" onChange={(e) => setUrl(e.target.value)} />
                </div>
                <hr />
                {submitted && <div className="errors">{errors.description}</div>}
                <div>
                    <p>Please describe your event:</p>
                    <textarea id='event-description-text' value={description} name="event-description" cols="70" rows="12" placeholder="Please include at least 30 characters"
                        onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>
                <button onClick={(e) => onSubmit(e)}>Create Event</button>
            </div>
        </div>


    )
    else dispatch(getGroups())
}
