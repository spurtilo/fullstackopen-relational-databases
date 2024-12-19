const { QueryTypes } = require('sequelize');
const sequelize = require('./db');

const printBlogs = async () => {
  try {
    await sequelize.authenticate();
    const blogs = await sequelize.query('SELECT * FROM blogs', {
      type: QueryTypes,
    });
    blogs.forEach((b) =>
      console.log(`${b.author}: '${b.title}', ${b.likes} likes`)
    );
    sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

printBlogs();
