import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import { getEventById } from "../../../store/events";
import './GroupEventsTile.css'

export default function GroupEventsTile({ event }) {
    const dispatch = useDispatch()
    const eventId = event.id;

    useEffect(()=> {
        dispatch(getEventById(eventId))
    }, dispatch)


    const eventAbout = useSelector(state=> state.events.allEvents[eventId])
    console.log(eventAbout)
    if(eventAbout) return (
        <div className="group-event-details">
            <div className="group-event-top">
                <img src={event.previewImage} alt="" />
                <div>
                    <p>{event.startDate.substring(0, 10)} {event.startDate.substring(11, 16)}</p>
                    <h4>{event.name}</h4>
                    <p>{event.Venue.city}, {event.Venue.state}</p>
                </div>
            </div>
            <div className="group-event-description">
                <p>{eventAbout.description}</p>
            </div>
        </div>
    )
}
