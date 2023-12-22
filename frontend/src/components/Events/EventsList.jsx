import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './EventsList.css'
import { getEvents } from '../../store/events'
import EventsListTile from './EventsListTile'

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
                    <EventsListTile events={events} keys={key}/>
                ))}
            </div>
        </div>
    )
    // else dispatch(getEvents())
}
