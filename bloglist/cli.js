const { QueryTypes } = require('sequelize');
const sequelize = require('./db');

const printBlogs = async () => {
  try {
    const blogs = await sequelize.query('SELECT * FROM blogs', {
      type: QueryTypes.SELECT,
    });
    blogs.forEach((b) =>
      console.log(`${b.author}: '${b.title}', ${b.likes} likes`)
    );
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    sequelize.close();
  }
};

printBlogs();
