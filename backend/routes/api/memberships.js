const express = require('express')
const Sequelize = require('sequelize')
const { check, validationResult } = require('express-validator')
const { group, User, GroupImage, Venue, Event } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { requireAuth, authGroup, authVenue, authEvent, checkId, authVenueId, authEventId } = require('../../utils/auth')

const router = express.Router()
