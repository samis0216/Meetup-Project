const express = require('express')
const Sequelize = require('sequelize')
const { check, validationResult} = require('express-validator')
const { group, User, GroupImage, Venue } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { requireAuth } = require('../../utils/auth')

const router = express.Router()

// const checkOwner = (userId, group) => {
//     return (userId !== group.organizerId)
// }

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
        .exists({checkFalsy: true})
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
        .exists({checkFalsy: true})
        .isBoolean()
        .withMessage('Preview must be a boolean'),
    handleValidationErrors
]

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

router.get('/current', requireAuth, async (req, res) => {
    // const { user } = req.user
    let user = {id: 1}
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
})

router.get('/:groupId', async (req, res) => {
    const id = req.params.groupId
    const groupInfo = await group.findAll({
        where: {
            id: id
        }
    })
    const userInfo = await groupInfo.getUser({
        attributes: []
    })
        // include: [
        //     {
        //         model: User,
        //         as: 'Users',
        //         attributes: [],
        //         through: {
        //             attributes: []
        //         }
        //     },
        //     {
        //         model: GroupImage,
        //         attributes: ['id', 'url', 'preview'],
        //     },
        //     {
        //         model: Venue,
        //         as: 'Venues',
        //         attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
        //     }
        // ],
        // where: {
        //     id: id
        // },
        // attributes: {
        //     include: [
        //         [Sequelize.fn('COUNT', Sequelize.col('Users.id')), 'numMembers'],
        //     ]
        // },
        // group: ['Group.id']
    if (groupInfo.length) res.json(groupInfo)
    else {
        res.status(404)
        res.json({
            message: "Group couldn't be found"
        })
    }
})

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

router.post('/:groupId/images', requireAuth, validateImage, async (req, res) => {
    const { user } = req;
    const id = user.id;
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

router.delete('/:groupId', async (req, res) => {
    const groupId = req.params.groupId
    const toDelete = await group.findOne({
        where: {
            id: groupId
        }
    })
    if(!toDelete) {
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

module.exports = router
