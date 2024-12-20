const app = require('./app');
const logger = require('./utils/logger');
const { PORT } = require('./utils/config');
const { connectToDatabase } = require('./utils/db');

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
