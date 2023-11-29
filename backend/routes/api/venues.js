const express = require('express')
const Sequelize = require('sequelize')
const { check, validationResult} = require('express-validator')
const { group, User, GroupImage, Venue } = require('../../db/models')
const { handleValidationErrors } = require('../../utils/validation')
const { requireAuth } = require('../../utils/auth')

const router = express.Router()
