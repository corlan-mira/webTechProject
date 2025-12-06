/**
 * Migrations Folder
 * 
 * Database migration files for Sequelize
 * 
 * Naming convention: [timestamp]-[action].js
 * Example: 20251202120000-init.js
 * 
 * Structure:
 * module.exports = {
 *   up: async (queryInterface, Sequelize) => {
 *     // Forward migration
 *   },
 *   down: async (queryInterface, Sequelize) => {
 *     // Rollback migration
 *   }
 * };
 * 
 * Commands:
 * npm run migrate        - Run pending migrations
 * npm run migrate:undo   - Rollback last migration
 * npm run migrate:undo:all - Rollback all migrations
 * 
 * First Migration: Create users, event_groups, events, attendance tables
 */
