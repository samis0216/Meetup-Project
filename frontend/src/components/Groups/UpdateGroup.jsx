import { useEffect } from 'react'
import UpdateGroupForm from './UpdateGroupForm'
import { useNavigate, useParams, } from 'react-router-dom'
import { getOneGroup } from '../../store/groups'
import { useDispatch, useSelector } from 'react-redux'

export default function UpdateGroup() {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    useEffect(()=> {
        dispatch(getOneGroup(groupId))
    })

    const userId = useSelector(state => state.session.user)
    const groupOrganizer = useSelector(state => state.groups.Groups[groupId])
    console.log(userId, groupOrganizer)

    if(groupOrganizer && userId) return (
        <UpdateGroupForm groupId={groupId} />
    )
    else {
        navigate('/')
    }
}
