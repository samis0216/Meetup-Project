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
        about: 'Come play lazer tag with Demo User!',
        type: 'Entertainment',
        private: false,
        city: 'Irvine',
        state: 'California'

      },
      {
        organizerId: 1,
        name: 'Painting Group',
        about: 'Come paint 19th century works with Demo User!',
        type: 'Art',
        private: false,
        city: 'Irvine',
        state: 'California'

      },
      {
        organizerId: 2,
        name: 'Coding Group',
        about: 'Come learn C++ with user2!',
        type: 'Education',
        private: false,
        city: 'Irvine',
        state: 'California'

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
    options.tableName = 'groups'
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Lazer Tag Group', 'Painting Group', 'Coding Group'] }
    }, {});
  }
};
