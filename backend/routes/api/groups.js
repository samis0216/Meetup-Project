const express = require('express')
const Sequelize = require('sequelize')
const { check, validationResult } = require('express-validator')
const { group, User, GroupImage, Venue, Event } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { requireAuth, authGroup, authVenue, authEvent, checkId, authVenueId, authEventId } = require('../../utils/auth')
const eventsRouter = require('./events')


const router = express.Router()

// const checkOwner = (userId, group) => {
//     return (userId !== group.organizerId)
// }
const validateEvent = [
    check('venueId')
        .exists()
        .isInt()
        .withMessage('Venue does not exist'),
    check('name')
        .exists()
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
            console.log(value);
            if (value.toString().split('.')[1].length > 2) {
                throw new Error("Price is invalid")
            }
            return true
        })
        .withMessage('Price is invalid'),
    check('description')
        .exists()
        .isAlpha('en-US', { ignore: [' ', '-', '!', '.', '?', "'", '"', '(', ')'] })
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

const validateGroup = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength()
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .exists({ checkFalsy: true })
        .isLength()
        .withMessage("About must be 50 characters or more"),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(['In person', 'Online'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .exists()
        .isBoolean()
        .withMessage("Private must be a boolean"),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    handleValidationErrors
];

const validateImage = [
    check('url')
        .exists({ checkFalsy: true })
        .isURL()
        .withMessage('Must provide a valid URL'),
    check('preview')
        .exists()
        .isBoolean()
        .withMessage('Preview must be a boolean'),
    handleValidationErrors
]

const validateVenue = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage('Longitude is not valid'),
    handleValidationErrors
]

// GET ALL GROUPS
router.get('/', async (req, res) => {
    const allGroups = await group.findAll();
    const groupsInfo = []
    for (let Group of allGroups) {
        let members = await Group.getMems();
        let previewImage = await Group.getGroupImages({
            where: {
                preview: true
            }
        });
        console.log(previewImage)
        let numMembers = members.length;
        Group = Group.toJSON()
        Group.numMembers = numMembers;
        if (previewImage[0]) Group.previewImage = previewImage[0].url;
        groupsInfo.push(Group);
    }
    res.json({
        Groups: groupsInfo
    })
})

// GET GROUP ASSOCIATED WITH CURRENT USER
router.get('/current', async (req, res) => {
    const { user } = req
    let groups;
    let groupsInfo = [];
    if (user) {
        groups = await user.getOrganizations();
        for (let Group of groups) {
            let members = await Group.getMems()
            let previewImage = await Group.getGroupImages();

            let numMembers = members.length;
            Group = Group.toJSON()
            Group.numMembers = numMembers;
            Group.previewImage = previewImage[0].url;
            delete Group.Membership
            groupsInfo.push(Group);
        }
    }
    res.json({
        Groups: groupsInfo
    })
})

// GET GROUP BY ID
router.get('/:groupId', async (req, res) => {
    const id = parseInt(req.params.groupId);
    const Group = await group.findByPk(id);
    if (!Group) {
        return res.json({
            message: "Group couldn't be found"
        })
    }
    const organizer = await Group.getUser({
        attributes: ['id', 'firstName', 'lastName']
    })

    const venues = await Group.getVenues();

    const images = await Group.getGroupImages();

    res.json({
        ...Group.dataValues,
        GroupImages: images,
        Organizer: organizer,
        Venues: venues
    })
})

// CREATE NEW GROUP
router.post('/', requireAuth, validateGroup, async (req, res) => {
    const { user } = req
    const { name, about, type, private, city, state } = req.body
    validateGroup
    let newGroup = await group.create({
        name,
        organizerId: 1,
        about,
        type,
        private,
        city,
        state
    })

    res.status(201)
    res.json(newGroup)
})

// ADD NEW IMAGE TO GROUP
router.post('/:groupId/images', requireAuth, authGroup, validateImage, async (req, res) => {
    const { user } = req;
    const groupId = req.params.groupId;
    const { url, preview } = req.body;
    const groupDetails = await group.findByPk(groupId)
    if (!groupDetails) {
        res.json({
            message: "Group couldn't be found"
        })
    }
    const newImg = await groupDetails.createGroupImage({
        url,
        preview
    })

    const img = await GroupImage.findOne({
        where: {
            id: newImg.id
        }
    })
    res.json(img)
})

// UPDATE GROUP BY ID
router.put('/:groupId', requireAuth, authGroup, validateGroup, async (req, res) => {
    const groupId = req.params.groupId;
    const { name, about, type, private, city, state } = req.body
    const foundGroup = await group.findByPk(groupId)
    if (!foundGroup) {
        res.json({
            message: "Group couldn't be found"
        })
    } else {
        const updatedGroup = await foundGroup.update(
            {
                name,
                about,
                type,
                private,
                city,
                state
            },
        )


        res.json(await group.findByPk(groupId))
    }
})

// DELETE GROUP
router.delete('/:groupId', async (req, res) => {
    const groupId = parseInt(req.params.groupId)
    const toDelete = await group.findByPk(groupId)
    if (!toDelete) {
        res.status(404)
        res.json({
            message: "Group couldn't be found"
        })
    } else {
        await toDelete.destroy()
        res.json({
            message: "Successfully deleted"
        })
    }

})

// GET ALL VENUES BY GROUP ID
router.get('/:groupId/venues', async (req, res) => {
    const groupId = req.params.groupId
    const foundGroup = await group.findByPk(groupId)
    const venues = await foundGroup.getVenues();
    res.json({ Venues: venues })
})

// CREATE NEW VENUE BY GROUP ID
router.post('/:groupId/venues', validateVenue, async (req, res) => {
    const groupId = req.params.groupId
    const { address, city, state, lat, lng } = req.body
    const groupToAdd = await group.findByPk(groupId);
    if (!groupToAdd) {
        res.json({
            message: "Group couldn't be found"
        })
    } else {
        const newVenue = await Venue.create({
            groupId,
            address,
            city,
            state,
            lat,
            lng
        })

        res.json(await Venue.findOne({
            where: {
                address: address
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }))
    }
})

// GET EVENTS BY GROUP ID
router.get('/:groupId/events', async (req, res) => {
    const groupdId = req.params.groupId
    const foundGroup = !(await group.findByPk(groupdId)) ? res.json({ message: "Group couldn't be found" }) : res.status(200)
    const allEvents = await Event.findAll({
        where: {
            groupId: groupdId
        },
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    for (let event of allEvents) {
        event.dataValues.numAttending = (await event.getUsers()).length

        event.dataValues.Group = await event.getGroup({
            attributes: ['id', 'name', 'city', 'state']
        })

        event.dataValues.Venue = await event.getVenue({
            attributes: ['id', 'city', 'state']
        })

        let previewImage = await event.getEventImages({
            where: {
                preview: true
            }
        })

        if (previewImage[0]) event.dataValues.previewImage = previewImage[0].url

    }

    res.json({
        Events: allEvents
    })
})

// CREATE EVENT FOR GROUP BY GROUP ID
router.post('/:groupId/events', validateEvent, async (req, res) => {
    const { user } = req
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body
    const groupdId = req.params.groupId
    const foundGroup = await group.findByPk(groupdId)
    const newEvent = await Event.create({
        groupId: groupdId,
        venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    })

    res.json(newEvent)
})

router.get('/:groupId/members', async (req, res) => {
    const { user } = req;
    const groupId = parseInt(req.params.groupId);
    const foundGroup = await group.findByPk(groupId);
    const foundCohost = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: foundGroup.id,
            status: 'co-host'
        }
    })
    let members;
    let result = [];
    if (foundGroup.organizerId === user.id || foundCohost) {
        members = await foundGroup.getMems({
            attributes: {
                exclude: ['username']
            },
            through: ['status']
        })
        return res.json({
            Members: members
        })
    } else {
        members = await foundGroup.getMems({
            attributes: {
                exclude: ['username']
            },
            through: ['status']
        })
        for (let member of members) {

            if (member.Membership.status !== 'pending') {
                result.push(member);
            }
        }
        return res.json({
            Members: result
        });
    }
})
module.exports = router
