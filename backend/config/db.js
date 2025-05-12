/**
 * MongoDB Connection Configuration
 * Manages connections to MongoDB Atlas with fallback to local MongoDB
 */
const mongoose = require('mongoose');

// MongoDB Connection Options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 2
};

// Local MongoDB URI for fallback
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/floristeria';

/**
 * Validates MongoDB URI format
 * @param {string} uri - MongoDB connection URI
 * @returns {boolean} - Whether the URI is valid
 */
const validateUri = (uri) => {
  return typeof uri === 'string' && 
         (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
};

/**
 * Connects to MongoDB using either Atlas URI from MONGODB_URI env var
 * or falls back to local MongoDB if Atlas connection fails
 * @returns {Promise} - Mongoose connection promise
 */
const connect = async () => {
  // Get MongoDB URI from environment variables, validate and use it
  const atlasUri = process.env.MONGODB_URI;
  
  // Log connection attempt
  console.log('🌐 Attempting to connect to MongoDB Atlas...');
  
  // Try connecting to Atlas MongoDB first
  if (validateUri(atlasUri)) {
    try {
      await mongoose.connect(atlasUri, options);
      console.log('✅ Connected to MongoDB Atlas successfully');
      return { isConnected: true, usingAtlas: true };
    } catch (atlasError) {
      console.error('⚠️ Failed to connect to MongoDB Atlas:', atlasError.message);
      console.log('⚙️ Attempting to connect to local MongoDB...');
      
      // If Atlas connection fails, try local MongoDB
      try {
        await mongoose.connect(LOCAL_MONGODB_URI, options);
        console.log('✅ Connected to local MongoDB successfully');
        return { isConnected: true, usingAtlas: false };
      } catch (localError) {
        console.error('❌ Failed to connect to local MongoDB:', localError.message);
        throw new Error('Failed to connect to both MongoDB Atlas and local MongoDB');
      }
    }
  } else {
    console.warn('⚠️ Invalid or missing Atlas MongoDB URI, falling back to local MongoDB');
    
    // Try local MongoDB
    try {
      await mongoose.connect(LOCAL_MONGODB_URI, options);
      console.log('✅ Connected to local MongoDB successfully');
      return { isConnected: true, usingAtlas: false };
    } catch (localError) {
      console.error('❌ Failed to connect to local MongoDB:', localError.message);
      throw new Error('Failed to connect to local MongoDB and no valid Atlas URI provided');
    }
  }
};

/**
 * Closes the MongoDB connection
 * @returns {Promise} - Mongoose disconnect promise
 */
const close = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
    throw error;
  }
};

// Set up mongoose connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟠 MongoDB connection disconnected');
});

// Export the connection functions and utilities
module.exports = {
  connect,
  close,
  validateUri,
  options,
  LOCAL_MONGODB_URI
};