const Sequelize = require('sequelize');

module.exports = new Sequelize('notedb', 'sreanponlue', '', {
    host: 'localhost',
    dialect: 'postgres' 
  });