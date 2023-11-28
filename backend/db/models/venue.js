'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    }
  }
  Venue.init({
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'groups',
        id: 'id'
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNull: {
          args: false,
          msg: 'Street address is required'
        }
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNull: {
          args: false,
          msg: 'City is required'
        }
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNull: {
          args: false,
          msg: 'State is required'
        }
      }
    },
    lat: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      validate: {
        isNumeric: {
          args: true,
          msg: 'Latitude is not valid'
        }
      }
    },
    lng: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      validate: {
        isNumeric: {
          args: true,
          msg: 'Longitude is not valid'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};
