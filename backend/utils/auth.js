const jwt = require('jsonwebtoken');
const { jwConfig, jwtConfig } = require('../config');
const { User } = require('../db/models');
const { group, Venue, Event, GroupImage, EventImage, Attendance, Membership } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

const setTokenCookie = (res, user) => {
    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
    };
    const token = jwt.sign(
        { data: safeUser },
        secret,
        { expiresIn: parseInt(expiresIn) }
    )

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie('token', token, {
        maxAge: expiresIn * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax"
    });

    return token
}

const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;
    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
            return next();
        }

        try {
            const { id } = jwtPayload.data;
            req.user = await User.findByPk(id, {
                attributes: {
                    include: ['email', 'createdAt', 'updatedAt']
                }
            });
        } catch (e) {
            res.clearCookie('token');
            return next();
        }

        if (!req.user) res.clearCookie('token');

        return next();
    });
};

const requireAuth = function (req, _res, next) {
    if (req.user) return next();
    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
};

const strictAuthGroup = async function (req, res, next) {
    const { user } = req;
    let Group;
    let status;
    const groupId = parseInt(req.params.groupId);
    if (groupId) {
        Group = await group.findByPk(groupId);
        status = await Membership.findOne({
            where: {
                userId: user.id,
                groupId: groupId
            }
        })
    }
    if (Group) {
        if (user.id == Group.organizerId) {
            return next();
        }
        else {
            const err = new Error('Forbidden');
            err.title = 'Require proper authorization'
            err.status = 403;
            err.errors = { message: 'Require proper authorization' };
            return next(err);
        }
    }
}

const authGroup = async (req, res, next) => {
    const { user } = req;
    const groupId = parseInt(req.params.groupId)
    let Group;
    let status;
    if (groupId) {
        Group = await group.findByPk(groupId)
        status = await Membership.findOne({
            where: {
                userId: user.id,
                groupId: groupId
            }
        })
    }
    if (Group) {
        if (user.id == Group.organizerId) {
            return next();
        }
        else if (status) {
            if (status.status === 'co-host') {
                return next()
            }
        }
        else {
            const err = new Error('Forbidden');
            err.title = 'Require proper authorization'
            err.status = 403;
            err.errors = { message: 'Require proper authorization' };
            return next(err);
        }
    }
}

const authVenue = async (req, res) => {
    const { user } = req;
    const venueId = parseInt(req.params.venueId);
    let venue;
    let venueGroup;
    if (venueId) {
        venue = await Venue.findByPk(venueId);
        venueGroup = await Group.findByPk(venue.groupId);
    }
    if (venueGroup) {
        if (venueGroup.organizerId === user.id) {
            return next();
        }
        else {
            const err = new Error('Forbidden');
            err.title = 'Require proper authorization'
            err.status = 403;
            err.errors = { message: 'Require proper authorization' };
            return next(err);
        }
    }
}

const authEvent = async function (req, res, next) {
    const { user } = req;
    const eventId = parseInt(req.params.eventId);
    let event;
    let attendance;
    if (eventId) {
        event = await Event.findByPk(eventId);
    }
    if (event) {
        attendance = await event.getUsers({
            where: {
                id: user.id
            }
        })
        if (req.method === 'POST') {
            if (attendance.length) {
                return next();
            } else {
                const err = new Error('Forbidden');
                err.title = 'Require proper authorization'
                err.status = 403;
                err.errors = { message: 'Require proper authorization' };
                return next(err);
            }
        }
        else if (req.method === 'PUT' || req.method === 'DELETE') {
            let group = await event.getGroup();
            let memberships = await Membership.findOne({
                where: {
                    userId: user.id,
                    groupId: group.id,
                    status: 'co-host'
                }
            })
            if (memberships || group.organizerId === user.id) {
                return next();
            } else {
                const err = new Error('Forbidden');
                err.title = 'Require proper authorization'
                err.status = 403;
                err.errors = { message: 'Require proper authorization' };
                return next(err);
            }
        }
    }
}



const checkId = async function (req, res, next) {
    try {
        const id = parseInt(req.params.groupId);
        const foundGroup = await group.findByPk(id);
        if (!foundGroup) {
            throw new Error();
        } else {
            return next()
        }
    } catch (e) {
        res.status(404)
        return res.json({
            message: "Group couldn't be found"
        })
    }
}

const authVenueId = async function (req, res, next) {
    try {
        let id = req.params.venueId || req.body.venueId;
        id = parseInt(id);
        const venue = await Venue.findByPk(id);
        if (!venue) {
            throw new Error();
        } else {
            return next()
        }
    } catch (e) {
        res.status(404)
        return res.json({
            message: "Venue couldn't be found"
        })
    }
}

const authEventId = async function (req, res, next) {
    try {
        const id = parseInt(req.params.eventId);
        const event = await Event.findByPk(id);
        if (!event) {
            throw new Error();
        } else {
            return next()
        }
    } catch (e) {
        res.status(404)
        return res.json({
            message: "Event couldn't be found"
        })
    }
}

module.exports = { setTokenCookie, restoreUser, requireAuth, strictAuthGroup, authGroup, authVenue, authEvent, checkId, authVenueId, authEventId };
