import { csrfFetch } from "./csrf"

// CONSTS
const GET_GROUPS = 'groups/GET_GROUPS'
const GET_ONE_GROUP = 'groups/GET_ONE_GROUP'
const CREATE_GROUP = 'groups/CREATE_GROUP'
const EDIT_GROUP = 'groups/EDIT_GROUP'
const DELETE_GROUP = 'groups/DELETE_GROUP'

// ACTION CREATORS

export const getGroupsCreator = (groups) => {
    return {
        type: GET_GROUPS,
        groups
    }
}

export const postGroupCreator = (newGroup) => {
    return {
        type: CREATE_GROUP,
        newGroup
    }
}

export const getOneGroupCreator = (groupId) => {
    return {
        type: GET_ONE_GROUP,
        groupId
    }
}

// THUNKS

export const getGroups = () => async (dispatch) => {
    const response = await csrfFetch('/api/groups', {
        method: 'GET'
    })
    console.log('hello')

    if (response.ok) {
        const groups = await response.json()
        dispatch(getGroupsCreator(groups))
    }
}

export const getOneGroup = (groupId) => async (dispatch) => {
    const res = await csrfFetch(`/api/groups/${groupId}`, {
        method: 'GET'
    })

    if (res.ok) {
        const group = await res.json()
        dispatch(getOneGroupCreator(group))
    }
}

export const postGroup = (newGroup) => async (dispatch) => {
    const response = await csrfFetch('/api/groups', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newGroup)
    })

    if (response.ok) {
        const newGroup = await response.json()
        dispatch(postGroupCreator(newGroup))
    }
}

const initialState = {}
// REDUCERS
const groupsReducer = (state = initialState, action) => {
    let newState
    switch (action.type) {
        case GET_GROUPS:
            return action.groups
        case GET_ONE_GROUP:
            let group = state.groups.Groups.find((group)=> group.id === parseInt(action.groupId))
            return group
        case CREATE_GROUP:
            newState = {Groups: {
                ...state.groups.Groups,
                [action.newGroup.id - 1]: action.newGroup
            }}
            return newState
        // case EDIT_GROUP:
        //     newState = {Groups: {...state.groups.Groups}}
        //     newState[action.group.id] = action.group
        //     return {Groups: newState}
        default:
            return state
    }
}
// const groupsReducer

export default groupsReducer
