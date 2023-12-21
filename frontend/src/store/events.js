import { csrfFetch } from "./csrf"

// CONSTS
const GET_EVENTS = 'events/GET_EVENTS'
const CREATE_EVENT = 'events/CREATE_EVENT'
const GET_EVENTS_BY_GROUP = 'events/GET_EVENTS_BY_GROUP'

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

// THUNKS

export const getEvents = () => async (dispatch) => {
    const response = await csrfFetch('/api/events', {
        method: 'GET'
    })

    if (response.ok) {
        const events = await response.json()
        dispatch(getEventsCreator(events))
    }
}

export const getEventsByGroupId = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`, {
        method: 'GET'
    })

    if (response.ok) {
        const events = await response.json()
        dispatch(getEventsByGroupIdCreator(groupId, events.Events))
    }
}



// REDUCERS
const initialState = {Events: {}, Past: {}, Upcoming: {}}
const eventsReducer = (state = initialState, action) => {
    let newState
    switch (action.type) {
        case GET_EVENTS:
            return action.events
        // case CREATE_EVENT:
        case GET_EVENTS_BY_GROUP: {
            const newState = {...state, Events: {...state.Events}};
            console.log(newState)
            if(action.events.length) {
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
        default:
            return state
    }
}

export default eventsReducer
