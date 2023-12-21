import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './GroupsList.css'
import { getGroups } from '../../store/groups'
import { getEvents, getEventsByGroupId } from '../../store/events'
import GroupListTile from './GroupListTile'



export default function GroupsList() {
    const dispatch = useDispatch()
    let groups_initial = useSelector((state) => state.groups.Groups)
    groups_initial = Object.values(groups_initial)
    useEffect(() => {
        dispatch(getGroups())
        dispatch(getEvents())
    }, [dispatch])
    const events = useSelector((state) => state.events.allEvents)
    console.log(events)
    return (
        <div className='main-body'>
            <div className='event-group-nav'>
                <div id='events-groups-buttons'>
                    <Link className='nav-links' to='/events'>Events</Link>
                    <h4 className='nav-links' id='current-view'>Groups</h4>
                </div>
                <p>Groups in Meetup</p>
            </div>
            <div className='groups-list'>
                {groups_initial && groups_initial.map((group) => (
                    <GroupListTile group={group} groupId={group.id} />
                    // <div key={group.id}>
                    //     <hr />
                    //     <Link className='group-links' to={`/groups/${group.id}`}>
                    //         <div className='group-container' >
                    //             <img src="https://placehold.co/100x50" alt="" className='groupImg' />
                    //             <div className='group-desc'>
                    //                 <h2>{group.name}</h2>
                    //                 <p>{group.city}, {group.state}</p>
                    //                 <p>{group.about}</p>

                    //                 <p>{events[group.id] ? events[group.id].length : '0'} {events[group.id] && events[group.id].length === 1 ? 'event' : 'events'} • {group.private ? 'Private' : 'Public'}</p>
                    //             </div>
                    //         </div>
                    //     </Link>
                    // </div>
                ))}
            </div>
        </div>
    )
}
