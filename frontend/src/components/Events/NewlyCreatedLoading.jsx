import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getEventById, getEvents } from "../../store/events"

export default function NewlyCreatedLoading({eventId}) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const newGroupCheck = useSelector(state=> state.events.allEvents[eventId])
    while(!newGroupCheck) {
        dispatch(getEvents())
        dispatch(getEventById(eventId))
    }

    navigate(`/events/${eventId}`)
}
