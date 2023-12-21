import { csrfFetch } from "./csrf"

// CONSTS
const GET_GROUPS = 'groups/GET_GROUPS'
const GET_ONE_GROUP = 'groups/GET_ONE_GROUP'
const GET_USER_GROUPS = 'groups/GET_USER_GROUPS'
const CREATE_GROUP = 'groups/CREATE_GROUP'
const PATCH_GROUP = 'groups/EDIT_GROUP'
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

export const getOneGroupCreator = (group) => {
    return {
        type: GET_ONE_GROUP,
        group
    }
}

export const getUserGroupsCreator = (groups) => {
    return {
        type: GET_USER_GROUPS,
        groups
    }
}

export const deleteGroupCreator = (groupId) => {
    return {
        type: DELETE_GROUP,
        groupId
    }
}

// THUNKS

export const getGroups = () => async (dispatch) => {
    const response = await csrfFetch('/api/groups', {
        method: 'GET'
    })

    if (response.ok) {
        const groups = await response.json()
        dispatch(getGroupsCreator(groups))

    } else {
        const errors = await response.json()
        return errors
    }
}

export const getOneGroup = (groupId) => async (dispatch) => {
    const res = await csrfFetch(`/api/groups/${groupId}`, {
        method: 'GET'
    })

    if (res.ok) {
        const group = await res.json()
        dispatch(getOneGroupCreator(group))
    } else {
        const errors = await response.json()
        return errors
    }
}

export const getUserGroups = () => async (dispatch) => {
    const response = await csrfFetch('/api/groups/current', {
        method: 'GET'
    })

    if (response.ok) {
        const groups = await response.json();
        dispatch(getUserGroupsCreator(groups.Groups))
    } else {
        const errors = await response.json()
        return errors
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
    } else {
        const errors = await response.json();
        return errors
    }
}

export const deleteGroup = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}`, {
        method: 'DELETE'
    })

    if (response.ok) {
        dispatch(deleteGroupCreator(groupId))
    } else {
        const errors = await response.json()
        return errors
    }
}

export const patchGroup = (updatedGroup, groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedGroup)
    })

    if (response.ok) {
        const editedGroup = await response.json()
        dispatch(postGroupCreator(editedGroup))
    } else {
        const errors = await response.json()
        return errors
    }
}

const initialState = {Groups: {}}
// REDUCERS
const groupsReducer = (state = initialState, action) => {
    let newState
    switch (action.type) {
        case GET_GROUPS:
            newState = {...state, Groups: {...state.Groups}}
            action.groups.Groups.forEach((group)=> {
                newState.Groups[group.id] = group
            })
            return newState
        case GET_ONE_GROUP:
            newState = {...state, Groups: {...state.Groups}}
            newState[action.groupId] = action.group
            return newState
        case GET_USER_GROUPS: {
            const newState = {...state, Groups: {...state.Groups, User: {...action.groups}}}
            return newState
        }
        case CREATE_GROUP:
            newState = {...state, Groups: {...state.Groups}};
            newState.Groups[action.group.id] = action.group;
            newState[action.group.id] = action.group
            return newState
        case DELETE_GROUP: {
            const newState = {...state, Groups: {...state.Groups}}
            delete newState.Groups[action.groupId]
            delete newState[action.groupId]
            return newState
        }
        default:
            return state
    }
}
// const groupsReducer

export default groupsReducer
