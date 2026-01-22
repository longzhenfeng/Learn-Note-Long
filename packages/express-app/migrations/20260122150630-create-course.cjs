"use strict"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Courses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      categoryId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      recommended: {
        type: Sequelize.BOOLEAN,
      },
      introductory: {
        type: Sequelize.BOOLEAN,
      },
      content: {
        type: Sequelize.TEXT,
      },
      likesCount: {
        type: Sequelize.INTEGER,
      },
      chaptersCount: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    })
    await queryInterface.addIndex("Courses", ["categoryId"], { unique: false })
    await queryInterface.addIndex("Courses", ["userId"], { unique: false })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Courses")
  },
}
