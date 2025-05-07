module.exports = {
    url: process.env.MONGODB_URI || 'mongodb+srv://MongodbPrueba:asdfqwer1234@parcial.a6gbmrh.mongodb.net/?retryWrites=true&w=majority&appName=Parcial',
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    }
};