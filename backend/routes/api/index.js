const router = require('express').Router();
const { restoreUser } = require('../../utils/auth.js');
const { User } = require('../../db/models');
const usersRouter = require('./users.js');
const sessionRouter = require('./session.js');
const groupsRouter = require('./groups.js');
const venuesRouter = require('./venues.js')
const eventsRouter = require('./events.js')
const membershipRouter = require('./memberships.js')

router.use(restoreUser);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/groups', groupsRouter)
router.use('/venues',venuesRouter)
router.use('/events', eventsRouter)

router.post('/test', (req, res) => {
    res.json({requestBody: req.body})
})

module.exports = router
