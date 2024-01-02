import { Link } from 'react-router-dom'
import { useEffect } from 'react'
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
        <div className='page-eventlist'>

            <div className='main-body'>
                <div className='event-group-nav'>
                    <div id='events-groups-buttons'>
                        <h3><Link className='nav-links' to='/events'>Events</Link></h3>
                        <h3 className='nav-links' id='current-view'>Groups</h3>
                    </div>
                    <p style={{ color: 'gray' }}>Groups in Meetup</p>
                </div>
                <div className='groups-list'>
                    {groups_initial && groups_initial.map((group) => (
                        <GroupListTile group={group} groupId={group.id} />
                    ))}
                </div>
            </div>
        </div>
    )
}
