const mongoose = require('mongoose');

const ConnectToMongo = async () => {
    try {
           await mongoose.connect('mongodb://127.0.0.1:27017/Project-2');
           console.log('MOngoDatabase is successfully connected!!');
} catch (err) {
           console.error('Database connection error:',err.message);
           process.exit(1);
}
};

module.exports = ConnectToMongo;