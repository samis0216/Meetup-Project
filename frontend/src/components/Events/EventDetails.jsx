import './EventDetails.css'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getGroups, getOneGroup } from '../../store/groups'
import { getEventById, getEvents, getEventsByGroupId } from '../../store/events'
import GroupDeleteModal from '../Groups/DeleteModal/GroupDeleteModal'
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem'

export default function EventDetails() {
    const dispatch = useDispatch()
    const { eventId } = useParams()
    useEffect(()=> {
        dispatch(getEvents())
        dispatch(getEventById(eventId))
    }, [dispatch])
    const event = useSelector((state)=> state.events.allEvents[eventId])
    let firstName
    let lastName
    if(event.Group) {
        firstName = event.Group.Organizer.firstName
        lastName = event.Group.Organizer.lastName
    }
    if(event) return (
        <div className='main-event-body'>
            <div>
                <div>
                &lt;<Link to='/events'>Events</Link>
                </div>
                <h3>{event.name}</h3>
                <p>Hosted by {firstName} {lastName}</p>
            </div>
        </div>
    )
    else {
        dispatch(getEventById(eventId))
    }
}
