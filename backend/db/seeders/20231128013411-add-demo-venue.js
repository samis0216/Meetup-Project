'use strict';
const { Venue } = require('../models')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await Venue.bulkCreate([
    {
      groupId: 1,
      address: '11 Willowridge',
      city: 'Irvine',
      state: 'California',
      lat: 65.1,
      lng: 72.0
    },
    {
      groupId: 1,
      address: '115 Williams St',
      city: 'Pico Rivera',
      state: 'California',
      lat: 65.1,
      lng: 72.0
    },
    {
      groupId: 1,
      address: '660 Kent Ave',
      city: 'Vacaville',
      state: 'California',
      lat: 65.1,
      lng: 72.0
    }
  ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Venues';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      address: { [Op.in]: ['11 Willowridge', '115 Williams St', '660 Kent Ave'] }
    }, {});
  }
};
