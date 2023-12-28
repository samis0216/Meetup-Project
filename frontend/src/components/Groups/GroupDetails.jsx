import './GroupDetails.css'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getGroups, getOneGroup } from '../../store/groups'
import { getEventsByGroupId } from '../../store/events'
import GroupDeleteModal from './DeleteModal/GroupDeleteModal'
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem'
// import GroupEventsTile from './GroupEventsTile.jsx'

export default function GroupDetails() {
    const dispatch = useDispatch()
    const { groupId } = useParams()
    const navigate = useNavigate()

    function updateClick() {
        navigate(`/groups/${groupId}/edit`);
    }

    function createEventClick() {
        navigate(`/groups/${groupId}/events/new`);
    }

    useEffect(() => {
        dispatch(getOneGroup(groupId))
        dispatch(getEventsByGroupId(groupId))
    }, [dispatch])

    const groups = useSelector((state) => state.groups.Groups)
    const events = useSelector((state) => state.events)
    const user = useSelector((state) => state.session.user)
    const numEvents = events.Events[groupId] ? events.Events[groupId].length : 0
    let group
    if (groups) group = groups[groupId]
    if (Object.values(groups).length) return (
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
                        <p>Organized by {user && group.organizerId === user?.id ? `${user.firstName} ${user.lastName}` : 'firstName lastName'}</p>
                        {user && group.organizerId === user?.id ? <div className='group-buttons-container'>
                            <button className='crud-buttons' onClick={createEventClick}>Create event</button>
                            <button className='crud-buttons' onClick={updateClick}>Update</button>
                            <OpenModalMenuItem itemText="Delete" modalComponent={<GroupDeleteModal groupId={groupId} />}
                        />
                        </div>
                        :
                        <div className='group-buttons-container'>
                            <button className='crud-buttons' onClick={()=> {alert('Feature Coming Soon...')}}>Join this Group</button>
                        </div>
                        }
                    </div>
                </div>
            </div>
            <div className='bottom-body'>
                <div className='organizer-container'>
                    <h3>Organizer</h3>
                    <p>{user && group.organizerId === user.id ? `${user.firstName} ${user.lastName}` : 'firstName lastName'}</p>
                </div>
                <div className='details-about-container'>
                    <h4>What we're about</h4>
                    <p>{group.about}</p>
                </div>
                <div className='upcoming-events-container'>
                    <h4>Upcoming Events ({events.Upcoming[groupId] && events.Upcoming[groupId].length})</h4>
                    <div>
                        {/* <GroupEventsTile /> */}
                    </div>
                </div>
            </div>
        </div>
    )
    else dispatch(getGroups())
}
