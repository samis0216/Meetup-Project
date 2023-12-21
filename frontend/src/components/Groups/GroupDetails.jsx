import './GroupDetails.css'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getOneGroup} from '../../store/groups'
import { getEventsByGroupId } from '../../store/events'

export default function GroupDetails() {
    const dispatch = useDispatch()
    const { groupId } = useParams()
    useEffect(()=> {
        dispatch(getOneGroup(groupId))
        dispatch(getEventsByGroupId(groupId))
    }, [dispatch])
    const groups = useSelector((state) => state.groups.Groups)
    const events = useSelector((state) => state.events)
    console.log(events)
    const numEvents = events.Events[groupId] ? events.Events[groupId].length : 0
    let group
    if (groups) {
        group = groups[groupId]
    }
    return (
        <div className='details-main'>
            <div className='breadcrumb-container'>
                &lt; <Link to='/groups'>Groups</Link>
            </div>
            <div className='top-body'>
                <div className='top-group-container'>
                    <img src="https://placehold.co/325x250" alt="" />
                    <div className='top-group-info'>
                        <h2>{group.name}</h2>
                        <p>{group.city}, {group.state}</p>
                        <p>{numEvents} {numEvents > 1 ? 'events' : 'event'} &#x2022; {group.type}</p>
                        <p>Organized by (firstName) (lastName)</p>
                        <div className='join-group-button'>
                        <button>Join this group</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='bottom-body'>
                <div className='organizer-container'>
                    <h3>Organizer</h3>
                    <p>firstName lastName</p>
                </div>
                <div className='details-about-container'>
                    <h4>What we're about</h4>
                    <p>{group.about}</p>
                </div>
                <div className='upcoming-events-container'>
                    <h4>Upcoming Events ({events.Upcoming[groupId] && events.Upcoming[groupId].length})</h4>
                    <div>
                        <div className='top-group-container'>
                            <img src="https://placehold.co/50x25" alt="" />
                            <div className='groupDetail-events'>

                            </div>
                        </div>
                        <div >

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
