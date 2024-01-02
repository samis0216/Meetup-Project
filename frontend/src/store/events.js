import { csrfFetch } from "./csrf"

// CONSTS
const GET_EVENTS = 'events/GET_EVENTS'
const CREATE_EVENT = 'events/CREATE_EVENT'
const GET_EVENTS_BY_GROUP = 'events/GET_EVENTS_BY_GROUP'
const GET_EVENT_BY_ID = 'events/GET_EVENT_BY_ID'
const DELETE_EVENT = 'events/DELETE_EVENT';
const POST_EVENT_IMAGE = 'events/CREATE_EVENT_IMAGE';

// ACTION CREATORS

export const getEventsCreator = (events) => {
    return {
        type: GET_EVENTS,
        events
    }
}

export const postEventCreator = (event) => {
    return {
        type: CREATE_EVENT,
        event
    }
}

export const getEventsByGroupIdCreator = (groupId, events) => {
    return {
        type: GET_EVENTS_BY_GROUP,
        groupId,
        events
    }
}

export const getEventByIdCreator = (event) => {
    return {
        type: GET_EVENT_BY_ID,
        event
    }
}

export const deleteEventCreator = (eventId) => {
    return {
        type: DELETE_EVENT,
        eventId
    }
}

export const postEventImageCreator = (eventId, image) => {
    return {
        type: POST_EVENT_IMAGE,
        eventId,
        image
    }
}

// THUNKS

export const getEvents = () => async (dispatch) => {
    const response = await csrfFetch('/api/events', {
        method: 'GET'
    })
    console.log('hello')

    if (response.ok) {
        const events = await response.json()
        dispatch(getEventsCreator(events))
        return events.Events
    } else {
        const errors = await response.json()
        return errors
    }
}

export const getEventsByGroupId = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`, {
        method: 'GET'
    })
    if (response.ok) {
        const events = await response.json()
        dispatch(getEventsByGroupIdCreator(groupId, events.Events))
        return events.Events
    }
}

export const getEventById = (eventId) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${eventId}`);
    if (response.ok) {
        const event = await response.json();
        const groupId = event.groupId;
        const data = await csrfFetch(`/api/groups/${groupId}`)
        const group = await data.json();
        event.Group = group;
        dispatch(getEventByIdCreator(event));
        return event;
    } else {
        const errors = await response.json();
        return errors;
    }
}

export const postEvent = (event, groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    });

    if (response.ok) {
        const event = await response.json();
        const groupId = event.groupId;
        const data = await csrfFetch(`/api/groups/${groupId}`)
        const group = await data.json();
        event.Group = group;
        dispatch(postEventCreator(event));
        return event;
    } else {
        const errors = await response.json();
        return errors;
    }
}

export const postEventImage = (eventId, img) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${eventId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: img,
            preview: true
        })
    });

    if (response.ok) {
        const img = await response.json();
        dispatch(postEventImageCreator(eventId, img));
        return img
    } else {
        const errors = await response.json();
        return errors;
    }
}

export const deleteEvent = (eventId) => async (dispatch) => {

    const response = await csrfFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
        dispatch(deleteEventCreator(eventId));
    } else {
        const errors = await response.json();
        return errors;
    }
}

// REDUCERS
const initialState = { Events: {}, Past: {}, Upcoming: {}, allEvents: {} }
const eventsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_EVENTS: {
            const newState = { Events: { ...state.Events }, Past: {...state.Past}, Upcoming: {...state.Upcoming}, allEvents: {...state.allEvents}}
            action.events.Events.forEach((event) => {
                newState.allEvents[event.id] = event
            })
            return newState
        }
        case GET_EVENTS_BY_GROUP: {
            const newState = { Events: { ...state.Events }, Past: {...state.Past}, Upcoming: {...state.Upcoming}, allEvents: {...state.allEvents}}
            if (action.events.length) {
                newState.Events[action.groupId] = action.events;
            } else {
                newState.Events[action.groupId] = [];
            }
            newState.Upcoming[action.groupId] = [];
            newState.Past[action.groupId] = [];
            action.events.forEach((event) => {
                const marker = new Date().getTime();
                const start = new Date(event.startDate).getTime();
                marker > start ? newState.Past[action.groupId].push(event) : newState.Upcoming[action.groupId].push(event);
            })

            return newState;
        }
        case GET_EVENT_BY_ID: {
            const newState = { Events: {...state.Events}, Past: {...state.Past}, Upcoming: {...state.Upcoming}, allEvents: {...state.allEvents}}
            newState.allEvents[action.event.id] = action.event;
            return newState;
        }
        case CREATE_EVENT: {
            const newState = { Events: {...state.Events}, Past: {...state.Past}, Upcoming: {...state.Upcoming}, allEvents: {...state.allEvents}};
            newState.allEvents[action.event.id] = action.event;
            return newState;
        }
        case POST_EVENT_IMAGE: {
            const newState = { Past: {...state.Past}, Upcoming: {...state.Upcoming}, Events: {...state.Events}, allEvents: {...state.allEvents}};
            return newState;
        }
        case DELETE_EVENT: {
            const newState = { Events: {...state.Events}, Past: {...state.Past}, Upcoming: {...state.Upcoming}, allEvents: {...state.allEvents}};
            delete newState.Past[action.eventId];
            delete newState.Upcoming[action.eventId]
            delete newState.allEvents[action.eventId];
            return newState;
        }
        default:
            return state
    }
}

export default eventsReducer


//
