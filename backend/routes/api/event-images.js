const express = require('express');
const { setTokenCookie, restoreUser, requireAuth, strictAuthGroup, authGroup, authGroupImage, authVenue, authEvent, authEventImage, checkId, authVenueId, authEventId } = require('../../utils/auth');
const { Group, GroupImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const router = express.Router();

router.delete('/:imageId', requireAuth, authEventImage, async (req, res) => {
    const imgId = req.params.imageId;
    let img = await GroupImage.findByPk(imgId)
    await img.destroy();
    res.json({
        message: "Successfully deleted"
    })

})

module.exports = router;
