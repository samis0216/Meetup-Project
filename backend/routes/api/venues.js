const express = require('express')
const Sequelize = require('sequelize')
const { check, validationResult} = require('express-validator')
const { group, User, GroupImage, Venue } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { requireAuth, authGroup, authVenue, authEvent, checkId, authVenueId, authEventId, strictAuthGroup } = require('../../utils/auth')

const router = express.Router()

const validateVenue = [
    check('address')
        .exists({checkFalsy: true})
        .isString()
        .withMessage('Street address is required'),
    check('city')
        .exists({checkFalsy: true})
        .isString()
        .withMessage('City is required'),
    check('state')
        .exists({checkFalsy: true})
        .isString()
        .withMessage('State is required'),
    check('lat')
        .exists({checkFalsy: true})
        .isNumeric({min: -90, max: 90})
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({checkFalsy: true})
        .isNumeric({min: -180, max: 180})
        .withMessage('Longitude is not valid'),
    handleValidationErrors
]

// UPDATE VENUE BY ID
router.put('/:venueId', requireAuth, authVenueId, authVenue, validateVenue, async (req, res) => {
    const venueId = req.params.venueId;
    const { groupId, address, city, state, lat, lng } = req.body;
    const foundVenue = await Venue.findByPk(venueId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    });
    if(!foundVenue) {
        res.json({
            message: "Venue couldn't be found"
        })
    } else {
        const updated = await foundVenue.update({
            address,
            city,
            state,
            lat,
            lng
        })
        // res.json(updated)
        res.json(await Venue.findByPk(venueId, {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }))
    }
})

module.exports = router
