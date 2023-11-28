'use strict';
const { group } = require('../models')
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
    await group.bulkCreate([
      {
        organizerId: 1,
        name: 'Lazer Tag Group',
        about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A diam maecenas sed enim ut sem viverra. Magna fringilla urna porttitor rhoncus.',
        type: 'In person',
        private: true,
        city: 'Irvine',
        state: 'California'

      },
      {
        organizerId: 1,
        name: 'Painting Group',
        about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A diam maecenas sed enim ut sem viverra. Magna fringilla urna porttitor rhoncus.',
        type: 'Online',
        private: true,
        city: 'Irvine',
        state: 'California'

      },
      {
        organizerId: 2,
        name: 'Coding Group',
        about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A diam maecenas sed enim ut sem viverra. Magna fringilla urna porttitor rhoncus.',
        type: 'Online',
        private: true,
        city: 'Irvine',
        state: 'California'

      }
    ], { validate: true })


  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'groups'
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Lazer Tag Group', 'Painting Group', 'Coding Group'] }
    }, {});
  }
};
