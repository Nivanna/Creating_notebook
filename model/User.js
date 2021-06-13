const Sequelize = require('sequelize');
const db =  require('../config/db');

const User = db.define('User', {
    id: {
        allowNull: false,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    user_name: {
        allowNull: false,
        type: Sequelize.STRING,
        min: 3
    },
    user_email: {
        allowNull: false,
        type: Sequelize.STRING
    },
    user_password: {
        allowNull: false,
        type: Sequelize.STRING,
        min:8
    }
},{
    timeStamps: false,
    tableName: 'users'
});

User.sync();

module.exports = User;