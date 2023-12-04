const express = require('express')
const Sequelize = require('sequelize')
const { check, query, validationResult } = require('express-validator')
const { Event, group, User, GroupImage, Venue, EventImage, Membership, Attendance } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { setTokenCookie, restoreUser, requireAuth, strictAuthGroup, authGroup, authVenue, authEvent, checkId, authVenueId, authEventId } = require('../../utils/auth')
const event = require('../../db/models/event')

const router = express.Router()

const validateEvent = [
    check('venueId')
        .optional()
        .isInt()
        .custom(async (value) => {
            let venue = await Venue.findByPk(value);

            if (!venue) {
                throw new Error("Venue does not exist")
            }
            return true
        })
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
        .custom(async (endDate, { req }) => {
            let event = await Event.findByPk(parseInt(req.params.eventId))
            let start = event.startDate;

            if (req.body.startDate) {
                start = req.body.startDate;
            }

            let enteredDate = new Date(endDate);
            let startDate = new Date(start);

            if (enteredDate.getTime() < startDate.getTime()) {
                throw new Error('End date is less than start date');
            }
            return true
        })
        .withMessage('End date is less than start date'),
    handleValidationErrors
]

const validateQuery = [
    query('page')
        .default('1')
        .custom((value) => {
            if (parseInt(value) < 1) {
                throw new Error('Page must be greater than or equal to 1')
            }
            return true
        })
        .withMessage('Page must be greater than or equal to 1'),
    query('size')
        .default('20')
        .custom((value) => {
            if (parseInt(value) < 1) {
                throw new Error('Size must be greater than or equal to 1')
            }
            return true
        })
        .withMessage('Size must be greater than or equal to 1'),
    query('name')
        .optional()
        .isAlpha('en-US', { ignore: [' ', '-', '"'] })
        .withMessage('Name must be a string'),
    query('type')
        .optional()
        .isIn(['Online', 'In person'])
        .withMessage('Type must be "Online" or "In person"'),
    query('startDate')
        .optional()
        .custom((startDate) => {

            startDate = new Date(startDate);

            if (!startDate.getTime()) {
                throw new Error('Start date must be a valid datetime (YYYY-MM-DD)');
            }
            return true
        })
        .withMessage('Start date must be a valid datetime (YYYY-MM-DD)'),
    handleValidationErrors
]

router.get('/', validateQuery, async (req, res) => {
    let { page, size, name, type, startDate } = req.query;

    page = parseInt(page);

    if (page > 10) {
        page = 10;
    }

    size = parseInt(size);

    if (size > 20) {
        size = 20;
    }

    let queryObj = {};

    queryObj.include = [{
        model: Group,
        attributes: ['id', 'name', 'city', 'state']
    }, {
        model: Venue,
        attributes: ['id', 'city', 'state']
    }]

    let limit = size;

    let offset = (page - 1) * size;

    queryObj.limit = limit;

    queryObj.offset = offset;

    // console.log(queryObj);

    queryObj.where = {};
    if (name) {
        queryObj.where.name = name;
        // console.log(queryObj);
    }
    if (type) {
        queryObj.where.type = type;
        // console.log(queryObj);
    }
    if (startDate) {
        queryObj.where.startDate = new Date(startDate);
        // console.log(new Date('10-22-2023'));
        // console.log(queryObj);
    }
    const allEvents = await Event.scope("noDesc").findAll(queryObj)
    let Events = []
    for (let event of allEvents) {
        let attendees = await event.getUsers();
        let numAttending = attendees.length;
        let previewImage = await event.getEventImages({
            where: {
                preview: true
            }
        });
        event.dataValues.numAttending = numAttending;
        if (previewImage.length) {
            event.dataValues.previewImage = previewImage[0].url;
        }
        Events.push(event);
    }
    return res.json({
        Events: allEvents
    });
})


router.get('/:eventId', authEventId, async (req, res) => {
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
    let numAttending = (await event.getUsers()).length;
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

router.post('/:eventId/images', requireAuth, authEventId, async (req, res) => {
    const { user } = req;
    const eventId = parseInt(req.params.eventId);
    const { url, preview } = req.body;
    const event = await Event.findByPk(eventId)
    if (!event) return res.json({
        message: "Event couldn't be found"
    })
    const newImg = await event.createEventImage({
        url,
        preview
    })

    res.json(await EventImage.findByPk(newImg.id, {
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'eventId']
        }
    }))
})

router.put('/:eventId', requireAuth, authEventId, authVenueId, validateEvent, authEvent, async (req, res) => {
    const { user } = req;
    const eventId = parseInt(req.params.eventId);
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body
    const venue = await Venue.findByPk(venueId)
    const event = await Event.findByPk(eventId)
    if (!venue) {
        res.code(404)
        return res.json({ message: "Venue couldn't be found" })
    }
    if (!event) {
        res.code(404)
        return res.json({ message: "Event couldn't be found" })
    }
    const updatedEvent = await event.update({
        venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    })

    return res.json(await Event.findOne({
        where: {
            id: updatedEvent.id,
        },
        attributes: {
            exclude: ['updatedAt']
        }
    }))

})

router.delete('/:eventId', requireAuth, authEventId, authEvent, async (req, res) => {
    const { user } = req;
    const eventId = parseInt(req.params.eventId);
    const event = await Event.findByPk(eventId)
    if (!event) {
        res.status(404);
        res.json({
            message: "Event couldn't be found"
        })
    }
    await event.destroy()
    return res.json({
        message: "Successfully deleted"
    })
})

router.get('/:eventId/attendees', authEventId, async (req, res) => {
    const { user } = req;
    const eventId = parseInt(req.params.eventId)
    const event = await Event.findByPk(eventId)
    const foundGroup = await group.findByPk(event.groupId)
    let attendants;
    let finalResult = [];
    const cohost = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: foundGroup.id,
            status: 'co-host'
        }
    })
    if (foundGroup.organizerId === user.id || cohost) {
        attendants = await event.getUsers({
            attributes: {
                exclude: ['username']
            },
            through: ['status']
        })
        return res.json({
            Attendees: attendants
        })
    } else {
        attendants = await event.getUsers({
            attributes: {
                exclude: ['username']
            },
            through: ['status']
        })
        for (let attendee of attendants) {
            if (attendee.Attendance.status !== 'pending') {
                finalResult.push(attendee);
            }
        }
        return res.json({
            Attendees: finalResult
        });
    }
})

router.post('/:eventId/attendance', requireAuth, authEventId, async (req, res, next) => {
    const { user } = req;
    const eventId = parseInt(req.params.eventId);
    let event = await Event.findByPk(eventId);
    let groupId = event.groupId;
    let membership = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: groupId
        }
    });
    let attending = await Attendance.findOne({
        where: {
            userId: user.id,
            eventId: eventId
        }
    })
    if (!membership) {
        const err = new Error('Forbidden');
        err.title = 'Require proper authorization'
        err.status = 403;
        err.errors = { message: 'Require proper authorization' };
        return next(err);
    } else if (attending) {
        if (attending.status === 'pending') {
            res.status(400)
            return res.json({
                message: "Attendance has already been requested"
            })
        } else if (attending.status === 'attending') {
            res.status(400)
            return res.json({
                message: "User is already an attendee of the event"
            })
        }
    }
    else {
        await Attendance.create({
            userId: user.id,
            eventId: eventId,
            status: 'pending'
        })
        return res.json({
            userId: user.id,
            status: 'pending'
        })
    }

})

router.put('/:eventId/attendance', requireAuth, authEventId, authEvent, async (req, res, next) => {
    const { user } = req;
    const { userId, status } = req.body;
    const eventId = parseInt(req.params.eventId);
    let event = await Event.findByPk(eventId);
    let groupId = event.groupId;
    const foundGroup = await group.findByPk(groupId);
    const organizer = foundGroup.organizerId;
    let attendanceUser = await User.findByPk(userId);
    let attendance = await Attendance.findOne({
        where: {
            userId: userId,
            eventId: eventId
        }
    })
    if (!attendanceUser) {
        res.status(400);
        return res.json({
            message: "Validation Error",
            errors: {
                userId: "User couldn't be found"
            }
        });
    } else if (!attendance) {
        res.status(404);
        return res.json({
            message: "Attendance between the user and the event does not exist"
        });
    }
    const membership = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: groupId,
            status: 'co-host'
        }
    });
    if (status === 'pending') {
        res.status(400);
        return res.json({
            message: "Validations Error",
            errors: {
                status: "Cannot change an attendance status to pending"
            }
        })
    }
    if ((organizer == user.id || membership)) attendance.status = status
    else {
        const err = new Error('Forbidden');
        err.title = 'Require proper authorization'
        err.status = 403;
        err.errors = { message: 'Require proper authorization' };
        return next(err);
    }
    return res.json({
        id: attendance.id,
        groupId: groupId,
        memberId: attendance.userId,
        status: attendance.status
    });
})

router.delete('/:eventId/attendance', requireAuth, authEventId, async (req, res, next) => {
    const { user } = req;
    const { userId } = req.body;
    const eventId = parseInt(req.params.eventId);
    let event = await Event.findByPk(eventId, {
        include: {
            model: group
        }
    })
    let organizerId = event.group.organizerId;
    let attendance = await Attendance.findOne({
        where: {
            eventId: eventId,
            userId: userId
        }
    })
    if (!attendance) {
        res.status(404);
        return res.json({
            message: "Attendance does not exist for this user"
        });
    }
    if (userId == user.id || user.id == organizerId) {
        await attendance.destroy();
        return res.json({
            message: "Successfully deleted attendance from event"
        })
    } else {
        const err = new Error('Forbidden');
        err.title = 'Require proper authorization'
        err.status = 403;
        err.errors = { message: 'Require proper authorization' };
        return next(err);
    }
})

module.exports = router
