'use strict';
const { GroupImage } = require('../models')

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
    await GroupImage.bulkCreate([
      {
        groupId: 1,
        url: "https://www.carlislesportsemporium.com/content/uploads/2018/02/Screen-Shot-2014-06-23-at-8.35.12-PM.png",
        preview: true
      },
      {
        groupId: 2,
        url: "https://www.visartscenter.org/x/lc-content/uploads/2018/07/Team-Building_Our-Hive.jpg",
        preview: true
      },
      {
        groupId: 3,
        url: "https://www.codemotion.com/magazine/wp-content/uploads/2023/07/Collaborative-Coding.-A-developer-team-working-together.-min-896x504.jpg",
        preview: true
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
    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['random url1', 'random url2', 'random url3'] }
    }, {});
  }
};
