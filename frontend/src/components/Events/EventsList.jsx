import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './EventsList.css'
import { getEvents } from '../../store/events'

export default function EventsList() {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getEvents())
    }, [dispatch])
    const events_initial = useSelector((state) => state.events.Events)
    console.log(events_initial)
    return (
        <div className='main-body'>
            <div className='event-group-nav'>
                <div id='events-groups-buttons'>
                    <h4 className='nav-links' id='current-view'>Events</h4>
                    <Link className='nav-links' to='/groups'>Groups</Link>
                </div>
                <p>Events in Meetup</p>
            </div>
            <div className='groups-list'>
                {events_initial && events_initial.map((event) => (
                    <div key={event.id}>
                        <hr />
                        <div className='group-container'>
                            <img src="https://placehold.co/100x50" alt="" className='groupImg' />
                            <div className='event-desc'>
                                <p>{event.endDate}</p>
                                <h2>{event.name}</h2>
                                <p>{event.Venue.city}, {event.Venue.state}</p>
                            </div>
                                <p>{event.about}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
