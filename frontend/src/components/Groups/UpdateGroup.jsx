import UpdateGroupForm from './UpdateGroupForm'
import { useParams } from 'react-router-dom'

export default function UpdateGroup() {
    const { groupId } = useParams()
    return (
        <UpdateGroupForm groupId={groupId} />
    )
}
