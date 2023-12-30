import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { getEventsByGroupId } from "../../store/events"
import './GroupListTile.css'

export default function GroupListTile({ group, groupId }) {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getEventsByGroupId(groupId))
    }, [dispatch])
    const groupEvents = useSelector((state)=> state.events.Events[groupId])
    if(!groupEvents) {
        return

    }
    else {
        return (
        <>
            <hr />
            <Link className='group-links' to={`/groups/${group.id}`}>
                <div className='group-container' >
                    <img src={group.previewImage} alt="" className='groupImg' />
                    <div className='group-desc'>
                        <h2 className="group-name-list">{group.name}</h2>
                        <p style={{color: '#999c9a'}}>{group.city}, {group.state}</p>
                        <p className="group-about-list">{group.about}</p>
                        <p style={{color: '#999c9a'}}>{groupEvents.length} {groupEvents.length && groupEvents.length === 1 ? 'event' : 'events'} • {group.private ? 'Private' : 'Public'}</p>
                    </div>
                </div>
            </Link>
        </>
    )
        }
}
