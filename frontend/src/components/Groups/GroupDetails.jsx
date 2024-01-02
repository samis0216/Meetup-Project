import './GroupDetails.css'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getGroups, getOneGroup } from '../../store/groups'
import { getEventsByGroupId } from '../../store/events'
import GroupDeleteModal from './DeleteModal/GroupDeleteModal'
import OpenModalButton from '../OpenModalButton/OpenModalButton'
import GroupEventsTile from './GroupEventTiles/GroupEventsTile'

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
    let groupImage;
    let arr;
    if (groups) group = groups[groupId]
    if(group) arr = group?.GroupImages? group.GroupImages : null
    console.log('group image', group)
    arr? groupImage = arr.url : null
    if (Object.values(groups).length) return (
        <div className='details-main'>
            <div className='top-body'>
                <div className='breadcrumb-container'>
                    &lt; <Link to='/groups'>Groups</Link>
                </div>
                <div className='top-group-container'>
                    <img src={groupImage} alt="" style={{ width: '700px', height: '400px' }} />
                    <div className='top-group-info'>
                        <h2>{group.name}</h2>
                        <p className='grey-text'>{group.city}, {group.state}</p>
                        <p className='grey-text'>{numEvents} {numEvents > 1 ? 'events' : 'event'} &#x2022; {group.private ? 'Private' : 'Public'}</p>
                        <p className='grey-text'>Organized by {group?.Organizer ? `${group.Organizer.firstName} ${group.Organizer.lastName}` : 'firstName lastName'}</p>
                        {user && group.organizerId === user?.id ? <div className='group-buttons-container'>
                            <button className='crud-buttons' onClick={createEventClick}>Create event</button>
                            <button className='crud-buttons' onClick={updateClick}>Update</button>
                            <OpenModalButton id='crud-buttons' buttonText="Delete" modalComponent={<GroupDeleteModal groupId={groupId} />}
                            />
                        </div>
                            :
                            <div className='group-buttons-container'>
                                {user && <button className='crud-buttons' id='join-button' onClick={() => { alert('Feature Coming Soon...') }}>Join this Group</button>}
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className='bottom-body'>
                <div className='organizer-container'>
                    <h3>Organizer</h3>
                    <p className='grey-text'>{group?.Organizer ? `${group.Organizer.firstName} ${group.Organizer.lastName}` : 'firstName lastName'}</p>
                </div>
                <div className='details-about-container'>
                    <h4>What we're about</h4>
                    <p>{group.about}</p>
                </div>
                <div className='upcoming-events-container'>
                    {events.Upcoming[groupId]?.length ? (<h4>Upcoming Events ({events.Upcoming[groupId] && events.Upcoming[groupId].length})</h4>) : null}
                    <div className='group-events-tile-container'>
                        {events.Upcoming[groupId]?.length ? events.Upcoming[groupId].map((event) => (
                            <GroupEventsTile event={event} key={event.id} />
                        )) : console.log('no future events')}
                    </div>
                </div>
                <div className='past-events-container'>
                    {events.Past[groupId]?.length ? (<h4>Past Events ({events.Past[groupId] && events.Past[groupId].length})</h4>) : null}
                    <div className='group-events-tile-container'>
                        {events.Past[groupId]?.length ? events.Past[groupId].map((event) => (
                            <GroupEventsTile event={event} key={event.id} />
                        )) : console.log('no past events')}
                    </div>
                </div>
            </div>
        </div>
    )
    else {
        dispatch(getOneGroup(groupId))
    }
}
