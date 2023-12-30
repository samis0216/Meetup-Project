import { useSelector } from 'react-redux'
import './Homepage.css'
import { Link } from 'react-router-dom'

export default function Homepage () {
    const sessionUser = useSelector(state => state.session.user)
    return (
        <div className="home-main-body">
            <div className='home-first-text-container'>
                <div className="home-first-text">
                    <h1>The people platform-Where interests become friendships</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Orci eu lobortis elementum nibh tellus molestie nunc non. Lectus vestibulum mattis ullamcorper velit. Nascetur ridiculus mus mauris vitae ultricies leo. Quisque id diam vel quam elementum pulvinar etiam non quam. Nam at lectus urna duis convallis convallis tellus id interdum. Accumsan sit amet nulla facilisi morbi tempus.</p>
                </div>
                <div className='img-container'>
                    <img id='first-img' src="https://secure.meetupstatic.com/next/images/indexPage/irl_event.svg?w=828" />
                </div>
            </div>
            <div className='second-body-container'>
                <div className='how-meetup'>
                    <h3 style={{fontWeight: 600}}>How Meetup Works</h3>
                    <p className='how-meetup-text'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </div>
            </div>
            <div className='third-body-container'>
                <div className='button-boxes'>
                    <img className='section3Images' src="https://cdn.vectorstock.com/i/preview-1x/11/61/high-five-salute-concept-friends-hands-union-vector-46211161.jpg" />
                    <h4>
                        <Link className='link-headers' to='/groups'>See all groups</Link></h4>
                    <p>Something for Groups</p>
                </div>
                <div className='button-boxes'>
                    <img className='section3Images' src="https://keepn.com/graphics/lpgraphics/landing_pages/free_online_calendar.png" />
                    <h4 ><Link className='link-headers' to='/events'>Find an event</Link></h4>
                    <p>Something for Events</p>
                </div>
                <div className='button-boxes'>
                    <img className='section3Images' src="https://lordicon.com/icons/wired/lineal/274-male-and-two-female.svg" />
                    <h4 style={{color: 'grey'}}>{sessionUser ? <Link to='/groups/new' className='link-headers'>Start a new group</Link> : 'Start a new group'}</h4>
                    <p>Something for creating group</p>
                </div>
            </div>
            {!sessionUser && <Link to='/' className='join-meetup'>Join Meetup</Link>}
        </div>
    )
}
