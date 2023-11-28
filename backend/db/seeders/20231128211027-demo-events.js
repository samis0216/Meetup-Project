'use strict';

const { Event } = require('../models')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

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
    await Event.bulkCreate([
      {
        venueId: 1,
        groupId: 1,
        name: 'Kids Lazer Tag Night',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A iaculis at erat pellentesque. Quisque non tellus orci ac auctor augue mauris augue. Sit amet volutpat consequat mauris nunc congue nisi vitae suscipit. Leo vel orci porta non pulvinar. Rutrum quisque non tellus orci ac auctor augue. Sit amet nisl purus in mollis. Lectus nulla at volutpat diam ut venenatis tellus. Vivamus arcu felis bibendum ut tristique et egestas. Libero volutpat sed cras ornare arcu dui vivamus. Tincidunt ornare massa eget egestas.',
        type: 'In person',
        capacity: 20,
        price: 20,
        startDate: '11-29-2023',
        endDate: '11-30-2023'
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'Event 2',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A iaculis at erat pellentesque. Quisque non tellus orci ac auctor augue mauris augue. Sit amet volutpat consequat mauris nunc congue nisi vitae suscipit. Leo vel orci porta non pulvinar. Rutrum quisque non tellus orci ac auctor augue. Sit amet nisl purus in mollis. Lectus nulla at volutpat diam ut venenatis tellus. Vivamus arcu felis bibendum ut tristique et egestas. Libero volutpat sed cras ornare arcu dui vivamus. Tincidunt ornare massa eget egestas.',
        type: 'Online',
        capacity: 15,
        price: 15,
        startDate: '12-05-2023',
        endDate: '12-06-2023'
      },
      {
        venueId: 3,
        groupId: 3,
        name: 'Event 3',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A iaculis at erat pellentesque. Quisque non tellus orci ac auctor augue mauris augue. Sit amet volutpat consequat mauris nunc congue nisi vitae suscipit. Leo vel orci porta non pulvinar. Rutrum quisque non tellus orci ac auctor augue. Sit amet nisl purus in mollis. Lectus nulla at volutpat diam ut venenatis tellus. Vivamus arcu felis bibendum ut tristique et egestas. Libero volutpat sed cras ornare arcu dui vivamus. Tincidunt ornare massa eget egestas.',
        type: 'In person',
        capacity: 30,
        price: 50,
        startDate: '11-30-2023',
        endDate: '12-02-2023'
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
    options.tableName = 'Events';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Kids Lazer Tag Night', 'Event 2', 'Event 3'] }
    }, {});
  }
};
