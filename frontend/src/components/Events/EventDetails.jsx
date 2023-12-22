import './EventDetails.css'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getGroups, getOneGroup } from '../../store/groups'
import { getEventsByGroupId } from '../../store/events'
import GroupDeleteModal from '../Groups/DeleteModal/GroupDeleteModal'
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem'

export default function EventDetails() {

}
