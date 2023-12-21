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
    const events = useSelector((state) => state.events.allEvents)
    const eventKeys = Object.keys(events)
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
                {events && eventKeys.map((key) => (
                    <div key={events[key].id}>
                        <hr />
                        <div className='group-container'>
                            <img src="https://placehold.co/100x50" alt="" className='groupImg' />
                            <div className='event-desc'>
                                <p>{events[key].endDate}</p>
                                <h2>{events[key].name}</h2>
                                <p>{events[key].Venue.city}, {events[key].Venue.state}</p>
                            </div>
                                <p>{events[key].about}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
    // else dispatch(getEvents())
}
