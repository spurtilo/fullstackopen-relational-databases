const _ = require('lodash');

const dummy = (blogs) => {
  return blogs.length === 0 ? 1 : blogs.length / blogs.length;
};

const totalLikes = (blogs) => {
  return blogs.reduce((total, blogItem) => total + blogItem.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const bestBlog = blogs.reduce(
    (bestItem, currentItem) =>
      currentItem.likes > bestItem.likes ? currentItem : bestItem,
    blogs[0]
  );

  return {
    title: bestBlog.title,
    author: bestBlog.author,
    likes: bestBlog.likes,
  };
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const authors = _.countBy(blogs, _.property('author'));

  const mostFrequentAuthor = Object.keys(authors).reduce(
    (a, b) => (authors[a] > authors[b] ? a : b),
    authors[0]
  );

  return {
    author: mostFrequentAuthor,
    blogs: authors[mostFrequentAuthor],
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const authorStats = blogs.reduce((result, currentBlog) => {
    const existingAuthor = _.find(result, { author: currentBlog.author });

    if (!existingAuthor) {
      result.push({ author: currentBlog.author, likes: currentBlog.likes });
    } else {
      existingAuthor.likes += currentBlog.likes;
    }

    return result;
  }, []);

  const authorWithMostLikes = _.maxBy(authorStats, 'likes');

  return authorWithMostLikes;
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
