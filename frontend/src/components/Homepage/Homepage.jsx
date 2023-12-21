import './Homepage.css'
import { Link } from 'react-router-dom'

export default function Homepage () {
    return (
        <div className="home-main-body">
            <div className='home-first-text-container'>
                <div className="home-first-text">
                    <h1>The people platform-Where interests become friendships</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Orci eu lobortis elementum nibh tellus molestie nunc non. Lectus vestibulum mattis ullamcorper velit. Nascetur ridiculus mus mauris vitae ultricies leo. Quisque id diam vel quam elementum pulvinar etiam non quam. Nam at lectus urna duis convallis convallis tellus id interdum. Accumsan sit amet nulla facilisi morbi tempus.</p>
                </div>
                <div className='img-container'>
                    <img id='first-img' src="https://placehold.co/325x325" />
                </div>
            </div>
            <div className='second-body-container'>
                <div className='how-meetup'>
                    <h3>How Meetup Works</h3>
                    <p className='how-meetup-text'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </div>
            </div>
            <div className='third-body-container'>
                <div className='button-boxes'>
                    <img src="https://placehold.co/200x200" />
                    <h4>
                        <Link to='/groups'>See all groups</Link></h4>
                    <p>Something for Groups</p>
                </div>
                <div className='button-boxes'>
                    <img src="https://placehold.co/200x200" />
                    <h4><Link to='/events'>Find an event</Link></h4>
                    <p>Something for Events</p>
                </div>
                <div className='button-boxes'>
                    <img src="https://placehold.co/200x200" />
                    <h4><Link to='/groups/new'>Start a new group</Link></h4>
                    <p>Something for creating group</p>
                </div>
            </div>
            <Link to='/' className='join-meetup'>Join Meetup</Link>
        </div>
    )
}
