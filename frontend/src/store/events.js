// CONSTS
const GET_EVENTS = 'events/events'

// ACTION CREATORS

export const getEventsCreator = (events) => {
    return {
        type: GET_EVENTS,
        events
    }
}

// THUNKS

export const getEvents = () => async (dispatch) => {
    const response = await fetch('/api/events', {
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
        default:
            return state
    }
}

export default eventsReducer
