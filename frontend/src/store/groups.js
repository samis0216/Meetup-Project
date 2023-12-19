
// CONSTS
const GET_GROUPS = 'groups/groups'

// ACTION CREATORS

export const getGroupsCreator = (groups) => {
    return {
        type: GET_GROUPS,
        groups
    }
}

// THUNKS

export const getGroups = () => async (dispatch) => {
    const response = await fetch('/api/groups', {
        method: 'GET'
    })

    if (response.ok) {
        const groups = await response.json()
        dispatch(getGroupsCreator(groups))
    }
}

const initialState = {}
// REDUCERS
const groupsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_GROUPS:
            return action.groups
        default:
            console.log('hi')
            return state
    }
}
// const groupsReducer

export default groupsReducer
