import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import * as sessionActions from './store/session';
import Homepage from './components/Homepage/Homepage';
import GroupsList from './components/Groups/GroupsList';
import EventsList from './components/Events/EventsList';
import GroupDetails from './components/Groups/GroupDetails';
import GroupForm from './components/Groups/GroupForm';
import EventDetails from './components/Events/EventDetails';
import CreateEventForm from './components/Events/CreateEventForm'
import UpdateGroup from './components/Groups/UpdateGroup'
import { Modal } from './context/Modal';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      <Modal />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Homepage />,
      },
      {
        path: '/groups',
        element: <GroupsList />,
          // {
          //   path: '/current',
          //   element: <GroupCurrent />
          // },
          // {
          //   path: '/new',
          //   element: <NewGroupForm />
          // },

      },
      {
      path: '/groups/new',
      element: <GroupForm />
      },
      {
        path: '/groups/:groupId',
        element: <GroupDetails />,
      },
      {
        path: '/groups/:groupId/edit',
        element: <UpdateGroup />
      },
      {
        path: '/groups/:groupId/events/new',
        element: <CreateEventForm />
      },
      {
        path: '/events',
        element: <EventsList />
      },
      {
        path: '/events/:eventId',
        element: <EventDetails />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
