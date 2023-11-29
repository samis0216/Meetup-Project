'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      group.belongsTo(models.User, {
        foreignKey: 'organizerId'
      })
      group.belongsToMany(models.User, {
        through: 'Memberships',
        foreignKey: 'groupId',
        otherKey: 'userId'
      })

      group.hasMany(models.GroupImage, {foreignKey: 'groupId', onDelete: 'CASCADE'})
      group.hasMany(models.Venue, {foreignKey: 'groupId', onDelete: 'CASCADE'})
      group.hasMany(models.Event, {foreignKey: 'groupId', onDelete: 'CASCADE'})

      }

  }
  group.init({
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
        onDelete: 'CASCADE'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 60],
          msg: 'Name must be between 1 and 60 characters'
        }
      }
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [50, 300],
          msg: 'About must be at least 50 characters long'
        }
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['Online', 'In person']],
          msg: 'Must be online or in person'
        }
      }
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'group',
  });
  return group;
};
