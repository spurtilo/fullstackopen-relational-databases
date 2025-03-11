module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.renameColumn('reading_list', 'is_read', 'read');
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.renameColumn('reading_list', 'read', 'is_read');
  },
};
