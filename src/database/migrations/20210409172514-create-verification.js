'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Verifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      verificationKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      verificationValue: {
        allowNull: false,
        type: Sequelize.STRING
      },
      emailId: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isVerified: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Verifications');
  }
};