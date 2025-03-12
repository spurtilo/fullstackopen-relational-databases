const Blog = require('./blog');
const User = require('./user');
const ReadingList = require('./readingList');
const Session = require('./session');

Session.belongsTo(User);
User.hasOne(Session);

Blog.belongsTo(User);
User.hasMany(Blog);

User.belongsToMany(Blog, { through: ReadingList, as: 'readings' });
Blog.belongsToMany(User, { through: ReadingList, as: 'readers' });

module.exports = {
  Session,
  Blog,
  User,
  ReadingList,
};
