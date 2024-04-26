const mongoose = require('mongoose');

let _db;
let connectingPromise;

const mongoConnect = () => {
    if (!connectingPromise) {
        connectingPromise = mongoose.connect('mongodb://localhost/node-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        connectingPromise.then(() => {
            console.log('Connected to MongoDB');
        });
    }
    return connectingPromise;
};

const getdb = () => {
    if (_db) {
        return _db;
    } else {
        throw new Error('No Database');
    }
};

exports.getdb = getdb;
exports.mongoConnect = mongoConnect;

