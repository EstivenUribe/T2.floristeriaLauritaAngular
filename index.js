/**
 * Main application entry point
 * Loads environment variables first and then starts the server
 */

// Load environment variables before any other code
require('dotenv').config();

// Start the server
require('./server');