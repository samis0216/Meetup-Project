import { Link } from "react-router-dom"
import './EventsListTile.css'
import { useDispatch} from "react-redux"
import { useEffect } from "react"
import { getEventById } from "../../store/events"

export default function EventsListTile({ events, keys }) {
    let key = keys
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getEventById(key))
    }, [dispatch])

    const description = events[key].description
    let image = events[key].EventImages
    let imageUrl
    if(image) imageUrl = image[0]
    if(imageUrl) imageUrl = imageUrl.url
    console.log(imageUrl)


    if(description) return (
        <div key={events[key].id}>
            <hr />
            <Link to={`/events/${events[key].id}`} className='event-link'>
                <div className='event-list-container'>
                        <img src={imageUrl} alt="" className='groupImg' />
                        <div className='event-desc'>
                            <p style={{color: 'teal'}}>{events[key].endDate.substring(0, 10)} &#183; {events[key].endDate.substring(11, 16)}</p>
                            <h2 className="group-name-list">{events[key].name}</h2>
                            <p style={{ color: '#999c9a' }}>{events[key].Venue.city}, {events[key].Venue.state}</p>
                        </div>
                </div>
                <div className="description">
                    <p>{events[key].description}</p>
                </div>
            </Link>
        </div>
    )
    else {
        dispatch(getEventById(key))
    }
}
