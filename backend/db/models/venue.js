'use strict';
const {
  Model
} = require('sequelize');
const event = require('./event');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Venue.belongsTo(models.group, {foreignKey: 'groupId'})

      Venue.hasMany(models.Event, {foreignKey: 'venueId', onDelete: 'CASCADE', hooks: true})

    }
  }
  Venue.init({
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id',

      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Street address is required'
        }
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'City is required'
        }
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'State is required'
        }
      }
    },
    lat: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Latitude is not valid'
        }
      }
    },
    lng: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Longitude is not valid'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Venue',
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    }
  });
  return Venue;
};
