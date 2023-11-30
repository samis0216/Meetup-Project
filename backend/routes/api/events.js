const express = require('express')
const Sequelize = require('sequelize')
const { check, validationResult } = require('express-validator')
const { Event, group, User, GroupImage, Venue, EventImage } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { requireAuth } = require('../../utils/auth')

const router = express.Router()

const validateEventPut = [
    check('venueId')
        .optional()
        .isInt()
        .withMessage('Venue does not exist'),
    check('name')
        .optional()
        .isLength({ min: 5 })
        .withMessage('Name must be 60 characters or less'),
    check('type')
        .optional()
        .isIn(['Online', 'In person'])
        .withMessage('Type must be "Online" or "In person"'),
    check('capacity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Capacity must be an integer'),
    check('price')
        .optional()
        .isFloat()
        .custom((value) => {
            value = value.toFixed(2);
            //   console.log(value);
            if (value.toString().split('.')[1].length > 2) {
                throw new Error("Price is invalid")
            }
            return true
        })
        .withMessage('Price is invalid'),
    check('description')
        .optional()
        .isAlpha('en-US', { ignore: [' ', '-', '!', '.', '?', "'", '"', '(', ')'] })
        .withMessage('Description is required'),
    check('startDate')
        .optional()
        .custom(value => {
            let enteredDate = new Date(value);
            let todaysDate = new Date();
            if (enteredDate <= todaysDate) {
                throw new Error("Start date must be in the future");
            }
            return true;
        })
        .withMessage('Start date must be in the future'),
    check('endDate')
        .optional()
        .custom((endDate, { req }) => {

            let enteredDate = new Date(endDate);
            let startDate = new Date(req.body.startDate);

            if (enteredDate.getTime() < startDate.getTime()) {
                throw new Error('End date is less than start date');
            }
            return true
        })
        .withMessage('End date is less than start date'),
    handleValidationErrors
]

router.get('/', async (req, res) => {
    const allEvents = await Event.findAll({
        include: [{
            model: group,
            attributes: ['id', 'name', 'city', 'state']
        }, {
            model: Venue,
            attributes: ['id', 'city', 'state']
        }],
    })

    let Events = []

    for(let event of allEvents) {
        let attendees = await event.getUsers();

        let numAttending = attendees.length;

        let previewImage = await event.getEventImages({
            where: {
                preview: true
            }
        });

        event = event.toJSON();

        event.numAttending = numAttending;

        if(previewImage.length) {

            event.previewImage = previewImage[0].url;
        }


        allEvents.push(event);
    }


    return res.json({
        Events: allEvents
    });
})


router.get('/:eventId', async (req, res) => {
    const id = parseInt(req.params.eventId);
    let event = await Event.findByPk(id);
    let venue = await event.getVenue({
        attributes: {
            exclude: ['groupId']
        }
    });
    let group = await event.getGroup({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'about', 'type', 'organizerId']
        }
    });
    let attendees = await event.getUsers();

    let numAttending = attendees.length;

    let EventImages = await event.getEventImages({
        attributes: {
            exclude: ['eventId']
        }
    });
    event = event.toJSON();
    event.numAttending = numAttending;
    event.Group = group;
    event.EventImages = EventImages;
    event.Venue = venue;
    return res.json(event)
})








module.exports = router
