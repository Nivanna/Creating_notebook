const Sequelize =  require('sequelize');
const db = require('../config/db');
const User = require('./User');
const Note = db.define('Note', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    note: {
        type: Sequelize.TEXT,
        allowNull: true,
    }
},{
    timeStamps: false,
    tableName: 'notes'
});

User.hasMany(Note);
Note.belongsTo(User);
Note.sync();

module.exports = Note;