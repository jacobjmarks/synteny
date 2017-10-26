const mongoose = require('mongoose');
const optional = require('optional');
// mongoose.connect('mongodb://localhost:27017/syntenyDB');

const conf = optional('./mongodb.json');
const connectionString = conf && `mongodb://${conf.user}:${conf.pass}@syntenycluster-shard-00-00-viwso.mongodb.net:27017,syntenycluster-shard-00-01-viwso.mongodb.net:27017,syntenycluster-shard-00-02-viwso.mongodb.net:27017/test?ssl=true&replicaSet=syntenyCluster-shard-0&authSource=admin`;

mongoose.connect(connectionString, (err) => {
    if (err) return console.log(err);
    console.log("Database connected.");
});

const db = mongoose.connection;

const comparisonSchema = mongoose.Schema({
    date_posted: {type: Date, required: true, default: Date.now},
    divisions: {type: [String], required: true},
    species: {
        type: [{
            name: {type: String, required: true},
            common_name: {type: String, required: true},
            display_name: {type: String, required: true}
        }],
        required: true},
    karyotypes: {type: [[String]], required: true}
});

comparisonSchema.pre("save", (next) => {
    Comparison.count({}, (err, count) => {
        if (err) console.error.bind(console, 'count error:');
        if (count + 1 > 10) {
            Comparison.findOneAndRemove().sort({ date_posted: 1}).exec((err, _) => {
                if (err) console.error.bind(console, 'deletion error:');
                next();
            });
        } else {
            next();
        }
    })
})

const Comparison = mongoose.model('Comparison', comparisonSchema);

module.exports.comparisons = (callback) => {
    if (db.readyState === 0) {
        return callback(new Error("Cannot connect to database."));
    }
    
    Comparison.find((err, comparisons) => {
        callback(err, comparisons);
    }).sort({ date_posted: -1 });
}

module.exports.addComparison = (comparison, callback) => {
    if (db.readyState === 0) {
        return callback(new Error("Cannot connect to database."));
    }

    new Comparison(comparison).save((err, _) => {
        callback(err);
    });
}

module.exports.truncateComparisons = (callback) => {
    if (db.readyState === 0) {
        return callback(new Error("Cannot connect to database."));
    }

    Comparison.remove({}, (err) => {
        callback(err);
    });
}