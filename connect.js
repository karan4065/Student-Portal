const mongoose = require('mongoose');

const ConnectToMongo = async () => {
    try {
           await mongoose.connect('mongodb+srv://main_portal:2005@cluster0.ffw67.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
           console.log('MOngoDatabase is successfully connected!!');
} catch (err) {
           console.error('Database connection error:',err.message);
           process.exit(1);
}
};

module.exports = ConnectToMongo;
