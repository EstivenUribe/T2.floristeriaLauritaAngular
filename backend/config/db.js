// Ensure environment variables are loaded or use a fallback
// IMPORTANT: In production, NEVER store credentials in code
// Create a .env file with proper MongoDB credentials
// Check if we have valid MongoDB URI in environment variables
const defaultMongoUri = 'mongodb://localhost:27017/floristeria'; // Local fallback

module.exports = {
    url: process.env.MONGODB_URI || defaultMongoUri,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, 
        socketTimeoutMS: 60000,
        connectTimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
        maxPoolSize: 10, // Connection pooling for better performance
        minPoolSize: 2
    },
    // Helper function to validate MongoDB connection string
    validateUri: (uri) => {
        // Basic validation (should be improved in production)
        return typeof uri === 'string' && 
               (uri.startsWith('mongodb://') || 
                uri.startsWith('mongodb+srv://'));
    }
}