const express = require('express')
const Sequelize = require('sequelize')
const { check, validationResult} = require('express-validator')
const { group, User, GroupImage, Venue, Event } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { requireAuth } = require('../../utils/auth')
const eventsRouter = require('./events')


const router = express.Router()

// const checkOwner = (userId, group) => {
//     return (userId !== group.organizerId)
// }
const validateEventPost = [
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
        .isInt({min: 1})
        .withMessage('Capacity must be an integer'),
    check('price')
        .exists()
        .isFloat()
        .custom((value) => {
            value = value.toFixed(2);
            console.log(value);
            if(value.toString().split('.')[1].length > 2) {
                throw new Error("Price is invalid")
            }
            return true
        })
        .withMessage('Price is invalid'),
    check('description')
        .exists()
        .isAlpha('en-US', {ignore: [' ', '-', '!', '.', '?', "'", '"', '(', ')']})
        .withMessage('Description is required'),
    check('startDate')
        .exists()
        .custom(value=>{
            let enteredDate=new Date(value);
            let todaysDate=new Date();
            if(enteredDate <= todaysDate){
                throw new Error("Start date must be in the future");
            }
            return true;
        })
        .withMessage('Start date must be in the future'),
    check('endDate')
        .exists()
        .custom((endDate, { req }) => {

            let enteredDate=new Date(endDate);
            let startDate=new Date(req.body.startDate);

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
        .exists({checkFalsy: true})
        .isIn(['In person', 'Online'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .exists()
        .isBoolean()
        .withMessage("Private must be a boolean"),
    check('city')
        .exists({checkFalsy: true})
        .withMessage("City is required"),
    check('state')
        .exists({checkFalsy: true})
        .withMessage("State is required"),
    handleValidationErrors
];

const validateImage = [
    check('url')
        .exists({ checkFalsy: true})
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
        .exists({checkFalsy: true})
        .withMessage('Street address is required'),
    check('city')
        .exists({checkFalsy: true})
        .withMessage('City is required'),
    check('state')
        .exists({checkFalsy: true})
        .withMessage('State is required'),
    check('lat')
        .exists({checkFalsy: true})
        .isNumeric()
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({checkFalsy: true})
        .isNumeric()
        .withMessage('Longitude is not valid'),
    handleValidationErrors
]

// GET ALL GROUPS
router.get('/', async (req, res) => {
    const groups = await group.findAll({
        include: [
        {
            model: User,
            as: 'Users',
            attributes: [], // excludes the User attributes from the final result
            through: {
              attributes: [] // excludes the join table attributes
            }
        },
        {
            model: GroupImage,
            attributes: [],
            where: {
                preview: true
            }
        }
        ],
        attributes: {
            include: [
                [Sequelize.fn('COUNT', Sequelize.col('Users.id')), 'numMembers'],
                [Sequelize.col('GroupImages.url'), 'previewImage']
            ]
        },
        group: ['Group.id']
    })
    res.json(groups)
})

// GET GROUP ASSOCIATED WITH CURRENT USER
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req
    const allGroups = await group.findAll({
        where: {
            organizerId: user.id
        },
        include: [
        {
            model: User,
            as: 'Users',
            attributes: [], // excludes the User attributes from the final result
            through: {
              attributes: [] // excludes the join table attributes
            }
        },
        {
            model: GroupImage,
            attributes: [],
            where: {
                preview: true
            }
        }
        ],
        attributes: {
            include: [
                [Sequelize.fn('COUNT', Sequelize.col('Users.id')), 'numMembers'],
                [Sequelize.col('GroupImages.url'), 'previewImage']
            ]
        },
        group: ['Group.id']
    })
    res.json(allGroups)
})

// GET GROUP BY ID
router.get('/:groupId', async (req, res) => {
    const id = req.params.groupId
    const groupInfo = await group.findAll({
        where: {
            id: id
        }
    })
    const userInfo = await groupInfo.getUser({
        include: [
            {
                model: User,
                as: 'Users',
                attributes: [],
                through: {
                    attributes: []
                }
            },
            {
                model: GroupImage,
                attributes: ['id', 'url', 'preview'],
            },
            {
                model: Venue,
                as: 'Venues',
                attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
            }
        ],
        where: {
            id: id
        },
        attributes: {
            include: [
                [Sequelize.fn('COUNT', Sequelize.col('Users.id')), 'numMembers'],
            ]
        },
        group: ['Group.id']
    })

    if (groupInfo.length) res.json(groupInfo)
    else {
        res.status(404)
        res.json({
            message: "Group couldn't be found"
        })
    }
})

// CREATE NEW GROUP
router.post('/', validateGroup, async (req, res) => {
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

    const info = await group.findOne({
            where: {
                name
            }
    })
    res.json(info)
})

// ADD NEW IMAGE TO GROUP
router.post('/:groupId/images', requireAuth, validateImage, async (req, res) => {
    const { user } = req;
    const id = user.id;
    console.log(id)
    const groupId = req.params.groupId;
    const { url , preview } = req.body;
    const groupDetails = await group.findByPk(groupId)
    if (!groupDetails) {
        res.json({
            message: "Group couldn't be found"
        })
    }
    if (id !== groupDetails.organizerId) {
        res.json({
            message: 'Forbidden'
        })
    }


    const newImg = await GroupImage.create({
        url,
        preview
    })

    const img = await GroupImage.findOne({
        where: {
            url: url
        },
        attributes: ['id', 'url', 'preview']
    })
    res.json(img)
})

// UPDATE GROUP BY ID
router.put('/:groupId', validateGroup, async (req, res) => {
    // const { user } = req;
    user = {
        id: 1
    }
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

    // if (user.id !== foundGroup.organizerId) {
    //     res.json({
    //         message: 'Forbidden'
    //     })
    // }

})

// DELETE GROUP
router.delete('/:groupId', async (req, res) => {
    const groupId = req.params.groupId
    const toDelete = await group.findOne({
        where: {
            id: groupId
        }
    })
    if (!toDelete) {
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
    const groupVenues = await Venue.findAll({
        where: {
            groupId: groupId
        },
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    if (!foundGroup)  {
        res.json({
            message: "Group couldn't be found"
        })
    } else if (!groupVenues.length) {
        res.json({
            message: "Group has no venues"
        })
    } else {
        res.json(groupVenues)
    }
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
router.get('/:groupId/events', async (req, res)=> {
    const groupdId = req.params.groupId
    const foundGroup = !(await group.findByPk(groupdId)) ? res.json({ message: "Group couldn't be found"}) : res.status(200)
    const allEvents = await Event.findAll({
        where: {
            groupId: groupdId
        },
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

// CREATE EVENT FOR GROUP BY GROUP ID
router.post('/:groupId/events', validateEvent, async (req, res) => {
    const { user } = req
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body
    const groupdId = req.params.groupId
    const foundGroup = !(await group.findByPk(groupdId)) ? res.json({ message: "Group couldn't be found"}) : res.status(200)
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
})

module.exports = router
