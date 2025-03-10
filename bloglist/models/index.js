const Blog = require('./blog');
const User = require('./user');
const ReadingList = require('./readingList');

Blog.belongsTo(User);
User.hasMany(Blog);

User.belongsToMany(Blog, { through: ReadingList, as: 'readings' });
Blog.belongsToMany(User, { through: ReadingList, as: 'readers' });

module.exports = {
  Blog,
  User,
  ReadingList,
};
