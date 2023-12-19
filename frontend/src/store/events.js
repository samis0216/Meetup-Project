import { csrfFetch } from "./csrf"

// CONSTS
const GET_EVENTS = 'events/GET_EVENTS'
const CREATE_EVENT = 'events/CREATE_EVENT'

// ACTION CREATORS

export const getEventsCreator = (events) => {
    return {
        type: GET_EVENTS,
        events
    }
}

export const createEventCreator = (event) => {
    return {
        type: CREATE_EVENT,
        event
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

// REDUCERS
const initialState = {}
const eventsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_EVENTS:
            return action.events
        // case CREATE_EVENT:

        default:
            return state
    }
}

export default eventsReducer
