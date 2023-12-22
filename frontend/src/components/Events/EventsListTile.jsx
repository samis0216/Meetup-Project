import { Link } from "react-router-dom"
import './EventsListTile.css'

export default function EventsListTile({ events, keys }) {
    let key = keys
    console.log(events, ' key: ', key)
    return (
        <div key={events[key].id}>
            <hr />
            <Link to={`/events/${events[key].id}`} className='event-link'>
                <div className='group-container'>
                    <img src="https://placehold.co/100x50" alt="" className='groupImg' />
                    <div className='event-desc'>
                        <p>{events[key].endDate}</p>
                        <h2>{events[key].name}</h2>
                        <p>{events[key].Venue.city}, {events[key].Venue.state}</p>
                    </div>
                    <p>{events[key].about}</p>
                </div>
            </Link>
        </div>
    )
}
