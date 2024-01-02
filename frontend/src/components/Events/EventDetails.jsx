import './EventDetails.css'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getEventById, getEvents } from '../../store/events'
import DeleteEventConfirmModal from './DeleteEventConfirmModal'
import OpenModalButton from '../OpenModalButton/OpenModalButton'

export default function EventDetails() {
    const dispatch = useDispatch()
    const { eventId } = useParams()
    useEffect(() => {
        dispatch(getEvents())
        dispatch(getEventById(eventId))
    }, [dispatch])
    const events = useSelector((state) => state.events.allEvents)
    const event = events[eventId]
    const user = useSelector((state) => state.session.user)
    let groupImgs
    event?.Group?.GroupImages ? groupImgs = event.Group.GroupImages[0] : null
    let groupImg
    if (groupImgs) groupImg = groupImgs.url


    if (event && event.Group) return (
        <div className='total-body'>
            <div className='main-event-body'>
                <div>
                    <div>
                        &lt;<Link to='/events'>Events</Link>
                    </div>
                    <h3>{event.name}</h3>
                    <p>Hosted by {event.Group.Organizer.firstName} {event.Group.Organizer.lastName}</p>
                </div>
            </div>
            <div className='content-body2'>
                <div className='event-container'>
                    <div className='event-img'>
                        <img src={event?.EventImages?.find((image) => image.preview === true)?.url} alt="event preview image" className='big-img' />
                    </div>
                    <div className='event-details-container'>
                        <div className='event-group-details'>
                            <img src={groupImg} alt="group image" style={{ maxWidth: 110, maxHeight: 75 }} />
                            <div>
                                <h4>{event.Group.name}</h4>
                                <p>{event.Group.private ? 'Private' : 'Public'}</p>
                            </div>
                        </div>
                        <div className='event-details'>

                            <div className='event-detail'>
                                <i className="fa-regular fa-clock fa-xl" style={{ color: "gray" }}></i>
                                <div className='startend-container'>
                                    <p className='startend'>START</p>
                                    <p className='startend'>END</p>
                                </div>
                                <div className='date-container'>
                                    <p>{event.startDate.substring(0, 10)} &#183; {event.startDate.substring(11, 19)}</p>
                                    <p>{event.endDate.substring(0, 10)} &#183; {event.endDate.substring(11, 19)}</p>
                                </div>
                            </div>
                            <div className='minor-detail'>
                                <div className='icon-detail'>
                                    <i className="fa-solid fa-circle-dollar-to-slot" style={{ color: 'grey' }}></i>
                                    <p>{event.price > 0 && `$${event.price}`}</p>
                                </div>
                            </div>
                            <div className='minor-detail2'>
                                <div className='icon-detail'>
                                    <i className="fa-solid fa-map-pin fa-xl" style={{ color: 'grey' }}></i>
                                    <p>{event.type}</p>
                                </div>
                                {event.Group.organizerId === user?.id && <div className='crud-event'>
                                    <button className='update-event-button' onClick={() => alert('Update Feature coming soon...')}>Update</button>
                                    <OpenModalButton
                                        id='delete-event-button'
                                        buttonText="Delete"
                                        modalComponent={<DeleteEventConfirmModal eventId={eventId} />}
                                    />
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='bottom-text'>
                    <h4>Details</h4>
                    <p>{event.description}</p>
                </div>
            </div>
        </div >
    )
    else {
        dispatch(getEventById(eventId))
    }
}
