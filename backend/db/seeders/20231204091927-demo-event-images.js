'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const {EventImage} = require('../models')
/** @type {import('sequelize-cli').Migration} */
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
    await EventImage.bulkCreate([
      {
        eventId: 1,
        url: 'https://dp4g669tqdae4.cloudfront.net/content/uploads/2021/12/83234946_2819316008111585_2463696406100049920_n.jpg',
        preview: true
      },
      {
        eventId: 2,
        url: 'https://media.timeout.com/images/104097116/image.jpg',
        preview: true
      },
      {
        eventId: 3,
        url: 'https://www.davisvanguard.org/wp-content/uploads/2021/02/hackathon.png',
        preview: true
      }
    ], {validate: true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'EventImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['https://dp4g669tqdae4.cloudfront.net/content/uploads/2021/12/83234946_2819316008111585_2463696406100049920_n.jpg', 'https://media.timeout.com/images/104097116/image.jpg', 'https://www.davisvanguard.org/wp-content/uploads/2021/02/hackathon.png'] }
    }, {});
  }
};
