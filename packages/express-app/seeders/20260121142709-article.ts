import { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Seeder} */
export const up = async (queryInterface: QueryInterface) => {
  const articles = [];
  for (let i = 1; i <= 100; i++) {
    articles.push({
      title: `文章的标题 ${i}`,
      content: `文章的内筒 ${i}.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await queryInterface.bulkInsert('Articles', articles);
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete('Articles', {}, {});
};
