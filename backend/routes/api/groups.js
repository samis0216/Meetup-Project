const express = require('express')
const Sequelize = require('sequelize')
const { check, validationResult } = require('express-validator')
const { group, User, GroupImage, Venue, Event, Membership, Attendance } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { requireAuth, authGroup, authVenue, authEvent, checkId, authVenueId, authEventId, strictAuthGroup } = require('../../utils/auth')
const { Op } = require("sequelize");

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
        .isLength([5, 60])
        .withMessage('Name must be at least 5 characters'),
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
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req
    let groupsInfo = [];
    if (user) {
        // groups = await user.getOrganizations();
        // console.log(groups)
        // for (let Group of groups) {
        //     let members = await Group.getMems()
        //     let previewImage = await Group.getGroupImages({
        //         where: {
        //             preview: true
        //         }
        //     });
        //     let numMembers = members.length;
        //     Group = Group.toJSON()
        //     Group.numMembers = numMembers;
        //     if (previewImage.length) Group.previewImage = previewImage[0].url;
        //     delete Group.Membership
        //     groupsInfo.push(Group);
        // }
        let memberships = await Membership.findAll({
            where: {
                userId: user.id
            },
            attributes: ['groupId']
        })
        for (let i of memberships) {
            groupsInfo.push(await group.findByPk(i.groupId))
        }
        let ownedGroups = await group.findAll({
            where: {
                organizerId: user.id
            }
        })

        for (let o of ownedGroups) {
            if(!groupsInfo.includes(o)) groupsInfo.push(o)
        }
    }
    console.log(groupsInfo)
    for (let Group of groupsInfo) {
        let members = await Group.getMems()
        let previewImage = await Group.getGroupImages({
            where: {
                preview: true
            }
        });
        let numMembers = members.length;
        Group.dataValues.numMembers = numMembers;
        if (previewImage.length) Group.dataValues.previewImage = previewImage[0].url;
    }
    res.json({
        Groups: groupsInfo
    })
})

// GET GROUP BY ID
router.get('/:groupId', checkId, async (req, res) => {
    const id = parseInt(req.params.groupId);
    const Group = await group.findByPk(id);
    const numMembers = await Group.getMems()
    console.log(numMembers)
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
        numMembers: numMembers.length,
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
        organizerId: user.id,
        about,
        type,
        private,
        city,
        state
    })
    res.status(201)
    return res.json(newGroup)
})

// ADD NEW IMAGE TO GROUP
router.post('/:groupId/images', requireAuth, checkId, strictAuthGroup, validateImage, async (req, res) => {
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
router.put('/:groupId', requireAuth, checkId, strictAuthGroup, validateGroup, async (req, res) => {
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
router.delete('/:groupId', requireAuth, checkId, strictAuthGroup, async (req, res) => {
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
router.get('/:groupId/venues', requireAuth, checkId, authGroup, async (req, res) => {
    const groupId = req.params.groupId
    const foundGroup = await group.findByPk(groupId)
    const venues = await foundGroup.getVenues();
    res.json({ Venues: venues })
})

// CREATE NEW VENUE BY GROUP ID
router.post('/:groupId/venues', requireAuth, checkId, authGroup, validateVenue, async (req, res) => {
    const groupId = req.params.groupId
    const { address, city, state, lat, lng } = req.body
    const groupToAdd = await group.findByPk(groupId);
    if (!groupToAdd) {
        return res.json({
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

        return res.json(await Venue.findOne({
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
router.get('/:groupId/events', checkId, async (req, res) => {
    const groupdId = req.params.groupId
    const foundGroup = !(await group.findByPk(groupdId)) ? res.json({ message: "Group couldn't be found" }) : res.status(200)
    const allEvents = await Event.scope('noDesc').findAll({
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
router.post('/:groupId/events', requireAuth, checkId, validateEvent, authGroup, async (req, res) => {
    const { user } = req
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body
    const groupdId = req.params.groupId
    const foundGroup = await group.findByPk(groupdId)
    if (!foundGroup) return res.json({
        message: "Group couldn't be found"
    })
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

    const finalEvent = await Event.findByPk(newEvent.id)
    res.json(finalEvent)
})

// GET GROUP MEMBERS BY GROUP ID
router.get('/:groupId/members', checkId, async (req, res) => {
    const { user } = req;
    const groupId = parseInt(req.params.groupId);
    const foundGroup = await group.findByPk(groupId);
    if (!foundGroup) {
        res.statusCode(404)
        return res.json({ message: "Group couldn't be found" })
    }
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
        console.log(members)
        return res.json({
            Members: members
        })
        // members = await User.findAll({
        //     include: {
        //         model: Membership
        //     },
        //     where: {
        //         id: userId
        //     }
        // })
    } else {
        members = await foundGroup.getMems({
            attributes: {
                exclude: ['username']
            },
            through: ['status']
        })
        // console.log(members)
        for (let member of members) {
            if (member.Memberships.status !== 'pending') {
                // const userNames = await User.findByPk(member.userId)
                // console.log(userNames)
                // let firstName = userNames.firstName;
                // let lastName = userNames.lastName
                // member.firstName = firstName;
                // member.lastName = lastName
                result.push(member);
            }
        }
        return res.json({
            Members: result
        });
    }
})

router.post('/:groupId/membership', requireAuth, checkId, async (req, res) => {
    const { user } = req;
    const groupId = parseInt(req.params.groupId);
    const foundGroup = await group.findByPk(groupId)
    let response = {}
    let membership = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: user.id
        }
    })
    if (membership) {
        res.status(400)
        if (membership.status === 'member' || membership.status === 'co-host') {
            response.message = "User is already a member of the group"
        } else {
            response.message = "Membership has already been requested"
        }
        return res.json(response)
    } else {
        await Membership.create({
            groupId,
            userId: user.id,
            status: 'pending'
        })

        let groupApplicant = {};
        groupApplicant.memberId = user.id;
        groupApplicant.status = 'pending';
        return res.json(groupApplicant)
    }

})

router.put('/:groupId/membership', requireAuth, checkId, authGroup, async (req, res) => {
    const { user } = req;
    const { memberId, status } = req.body;
    const groupId = parseInt(req.params.groupId);
    const foundGroup = await group.findByPk(groupId);
    const memberUser = await User.findByPk(memberId);
    const member = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: groupId
        }
    })
    if (!memberUser) {
        res.status(400);
        return res.json({
            message: "Validation Error",
            errors: {
                memberId: "User couldn't be found"
            }
        })
    } else if (!member) {
        res.status(404);
        return res.json({
            message: "Membership between the user and the group does not exist"
        });
    }
    const organizer = foundGroup.organizerId;
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
                status: "Cannot change a membership status to pending"
            }
        })
    }
    console.log(member)
    if ((organizer == user.id || membership) && status === 'member') {
        member.status = status;
        member.save()
    } else if (organizer == user.id && status === 'co-host') {
        member.status = status;
        member.save()
    }
    else {
        res.status(400)
        return res.json({
            message: "Status must be either 'member' or 'co-host'"
        })
    }
    return res.json({
        id: member.id,
        groupId: groupId,
        memberId: member.userId,
        status: member.status
    });
})

router.delete('/:groupId/membership', requireAuth, checkId, async (req, res) => {
    const { user } = req;
    const { memberId } = req.body;
    const groupId = parseInt(req.params.groupId);
    const foundGroup = await group.findByPk(groupId);
    const memberUser = await User.findByPk(memberId);
    const member = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: groupId
        }
    })
    if (!memberUser) {
        res.status(400);
        return res.json({
            message: "Validation Error",
            errors: {
                memberId: "User couldn't be found"
            }
        });
    } else if (!member) {
        res.status(404);
        return res.json({
            message: "Membership does not exist for this user"
        });
    }
    if (memberId == user.id || user.id == foundGroup.organizerId) {
        await member.destroy();
        return res.json({
            message: "Successfully deleted membership from group"
        })
    } else {
        res.status(403)
        const err = new Error('Forbidden');
        err.title = 'Require proper authorization'
        err.errors = { message: 'Require proper authorization' };
        return res.json(err)
    }
})

module.exports = router
