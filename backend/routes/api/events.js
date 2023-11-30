const express = require('express')
const Sequelize = require('sequelize')
const { check, validationResult} = require('express-validator')
const { Event, group, User, GroupImage, Venue, EventImage } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { requireAuth } = require('../../utils/auth')

const router = express.Router()

router.get('/', async (req, res) => {
    const allEvents = await Event.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    for (let event of allEvents) {
        event.dataValues.Group = await event.getGroup({
            attributes: ['id', 'name', 'city', 'state']
        })

        event.dataValues.Venue = await event.getVenue({
            attributes: ['id', 'city', 'state']
        })

    }


    res.json({
        Events: allEvents
    })
})

router.get('/:eventId', async(req, res) => {
    const eventId = req.params.eventId;
    const event = await Event.findByPk(eventId, {
        include: {
            model: EventImage
        },
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })
    if(!event) return res.json({message: "Event couldn't be found"})

    event.dataValues.Group = await event.getGroup({
        attributes: ['id', 'name', 'city', 'state']
    })

    event.dataValues.Venue = await event.getVenue({
        attributes: ['id', 'city', 'state']
    })

    res.json(event)
})






module.exports = router
