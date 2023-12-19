import './GroupDetails.css'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getGroups} from '../../store/groups'

export default function GroupDetails() {
    const dispatch = useDispatch()
    const { groupId } = useParams()
    useEffect(()=> {
        dispatch(getGroups())
    }, [dispatch])
    const groups = useSelector((state) => state.groups.Groups)
    // const events = useSelector((state) => state.events)
    console.log(groups)
    let group
    if (groups) {
        group = groups.find((group) => group.id === parseInt(groupId))
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
                        <p>(insert # Events) &#x2022; {group.type}</p>
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
                    <h4>Upcoming Events (#)</h4>
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
