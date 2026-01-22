'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const articles = [];

    for (let i = 1; i <= 100; i++) {
      articles.push({
        title: `文章的标题 ${i}`,
        content: `文章的内容 ${i}.`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Articles', articles);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Articles', null, {});
  },
};
