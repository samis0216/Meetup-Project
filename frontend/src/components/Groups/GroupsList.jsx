import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './GroupsList.css'
import { getGroups } from '../../store/groups'

export default function GroupsList() {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getGroups())
    }, [])
    const groups_initial = useSelector((state) => state.groups.Groups)
    console.log(groups_initial)
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
                    <div key={group.id}>
                        <hr />
                        <div className='group-container'>
                            <img src="https://placehold.co/100x50" alt="" className='groupImg' />
                            <div className='group-desc'>
                                <h2>{group.name}</h2>
                                <p>{group.city}, {group.state}</p>
                                <p>{group.about}</p>
                                <p>(Insert # Events ) • {group.type}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
