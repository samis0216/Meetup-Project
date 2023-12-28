import './EventDetails.css'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getEventById, getEvents, getEventsByGroupId } from '../../store/events'
import GroupDeleteModal from '../Groups/DeleteModal/GroupDeleteModal'
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem'

export default function EventDetails() {
    const dispatch = useDispatch()
    const { eventId } = useParams()
    useEffect(() => {
        dispatch(getEventById(eventId))
    }, [dispatch])
    let events
    let event
    try {
        events = useSelector((state) => state.events.allEvents)
        event = events[eventId]
    } catch {
        dispatch(getEvents())
        dispatch(getEventById(eventId))
        events = useSelector((state) => state.events.allEvents)
        console.log(events)
        event = events[eventId]
    }
    if (event && event.Group) return (
        <div className='main-event1-body'>
            <div>
                <div>
                    &lt;<Link to='/events'>Events</Link>
                </div>
                <h3>{event.name}</h3>
                <p>Hosted by {event.Group.Organizer.firstName} {event.Group.Organizer.lastName}</p>
            </div>
            <div className='event-container'>
                <div className='event-img'>
                    <img src="https://placehold.co/325x250" alt="" className='big-img' />
                </div>
                <div className='event-details-container'>
                    <div className='event-group-details'>
                        <img src="https://placehold.co/100x50" alt="" />
                        <div>
                            <h4>{event.Group.name}</h4>
                            <p>{event.Group.private ? 'Private' : 'Public'}</p>
                        </div>
                    </div>
                    <div className='event-details'>
                        <div>
                            <i></i>
                            <div className='event-detail'>
                                <div className='startend-container'>
                                    <p className='startend'>START</p>
                                    <p className='startend'>END</p>
                                </div>
                                <div className='date-container'>
                                    <p>{event.startDate.substring(0, 10)}</p>
                                    <p>{event.endDate.substring(0, 10)}</p>
                                </div>
                                <div className='time-container'>
                                    <p>{event.startDate.substring(11, 19)}</p>
                                    <p>{event.endDate.substring(11, 19)}</p>
                                </div>
                            </div>
                            <div className='minor-detail'>
                                <i></i>
                                <p>{event.price > 0 && `$${event.price}`}</p>
                            </div>
                            <div className='minor-detail'>
                                <i></i>
                                <p>{event.type}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='bottom-text'>
                <h4>Details</h4>
                <p>{event.description}</p>
            </div>
        </div>
    )
}
