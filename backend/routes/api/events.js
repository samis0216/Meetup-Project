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
        .exists()
        .isInt()
        .withMessage('Venue does not exist'),
    check('name')
        .exists()
        .isString()
        .isLength({ min: 5 })
        .withMessage('Name must be 60 characters or less'),
    check('type')
        .exists()
        .isIn(['Online', 'In person'])
        .withMessage('Type must be "Online" or "In person"'),
    check('capacity')
        .exists()
        .isInt({ min: 1 })
        .withMessage('Capacity must be an integer'),
    check('price')
        .exists()
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
        .exists()
        .isString()
        .withMessage('Description is required'),
    check('startDate')
        .exists()
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
        .exists()
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

const validateQuery = [
    query('page')
        .default('1')
        .isInt()
        .custom((page) => {
            if (parseInt(page) < 1) {
                throw new Error('Page must be greater than or equal to 1')
            } else {
                return true
            }
        })
        .withMessage("Page must be greater than or equal to 1"),
    query('size')
        .default('20')
        .isInt()
        .custom((size) => {
            if (size < 1) {
                throw new Error('Page must be greater than or equal to 1')
            } else {
                return true
            }
        })
        .withMessage("Size must be greater than or equal to 1"),
    query('name')
        .optional()
        .isString()
        .withMessage("Name must be a string"),
    query('type')
        .optional()
        .isString()
        .isIn(['Online', 'In person'])
        .withMessage("Type must be 'Online' or 'In person'"),
    query('startDate')
        .optional()
        .custom((date) => {
            date = date.slice(1, date.length - 1)
            date = new Date(date);
            if (!date.getTime()) {
                throw new Error('Start date must be a valid datetime');
            } return true
        })
        .withMessage('Start date must be a valid datetime'),
    handleValidationErrors
]

router.get('/', validateQuery, async (req, res) => {
    const pagination = {};
    const { page, size, name, type, startDate } = req.query;
    if(page > 10) page = 10
    if(size > 20) size = 20
    pagination.include = [{
        model: group,
        attributes: ['id', 'name', 'city', 'state']
    }, {
        model: Venue,
        attributes: ['id', 'city', 'state']
    }]
    const offset = (page - 1) * size;
    const limit = size;
    pagination.offset = offset;
    pagination.limit = limit;
    if(name) {
        pagination.where = {};
        name = name.slice(1, name.length - 1)
        pagination.where.name = name;
    }
    if(type) {
        type = type.slice(1, type.length - 1)
        pagination.where.type = type;
    }
    if(startDate) {
        startDate = startDate.slice(1, startDate.length - 1)
        pagination.where.startDate = new Date(startDate);
    }
    const allEvents = await Event.findAll(pagination)
    let Events = []
    for (let event of allEvents) {
        let attendees = await event.getUsers();
        let numAttending = attendees.length;
        let previewImage = await event.getEventImages({
            where: {
                preview: true
            }
        });
        event = event.toJSON();
        event.numAttending = numAttending;
        if (previewImage.length) {
            event.previewImage = previewImage[0].url;
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

    res.json(updatedEvent)

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
    if (!membership) {
        const err = new Error('Forbidden');
        err.title = 'Require proper authorization'
        err.status = 403;
        err.errors = { message: 'Require proper authorization' };
        return next(err);
    } else {
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
