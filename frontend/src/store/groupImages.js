import { csrfFetch } from './csrf';

const CREATE_GROUP_IMAGE = 'groupImages/CREATE_GROUP_IMAGE';

const postGroupImage = (groupId, image) => {
    return {
        type: CREATE_GROUP_IMAGE,
        groupId,
        image
    }
}

export const createGroupImage = (image, groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/images`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            url: image,
            preview: true
        })
    });

    if(response.ok) {
        const image = await response.json();
        dispatch(postGroupImage(groupId, image));
        return image
    } else {
        const errors = await response.json();
        return errors;
    }
}

const initialState = { };

export default function groupImagesReducer(state = {...initialState}, action ) {
    switch(action.type) {
        case CREATE_GROUP_IMAGE: {
            const newState = {...state};
            if(!newState[action.groupId]) {
                newState[action.groupId] = {};
                newState[action.groupId][action.image.id] = action.image;
            } else {
                newState[action.groupId][action.image.id] = action.image;
            }
            return newState;
        }
        default: {
            return state;
        }
    }
}
