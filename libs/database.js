const mongoose = require('mongoose');
const optional = require('optional');
// mongoose.connect('mongodb://localhost:27017/syntenyDB');

const conf = optional('./mongodb.json');
const connectionString = conf && `mongodb://${conf.user}:${conf.pass}@syntenycluster-shard-00-00-viwso.mongodb.net:27017,syntenycluster-shard-00-01-viwso.mongodb.net:27017,syntenycluster-shard-00-02-viwso.mongodb.net:27017/test?ssl=true&replicaSet=syntenyCluster-shard-0&authSource=admin`;

// Connect to the database.
mongoose.connect(connectionString, (err) => {
    if (err) return console.log(err);
    console.log("Database connected.");
});
const db = mongoose.connection;

// Setup the comparison schema.
const comparisonSchema = mongoose.Schema({
    date_posted: {type: Date, required: true, default: Date.now},
    divisions: {type: [String], required: true},
    species: [
        mongoose.Schema({
            name: {type: String, required: true},
            common_name: {type: String, required: true},
            display_name: {type: String, required: true}
        }, { _id: false })
    ],
    karyotypes: {type: [[String]], required: true}
});

// Remove a comparison before saving if the total count is above 10.
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

/**
 * Retrieve all recent comparisons from the database.
 * @param {(err?: Error, comparisons: [{divisions: [String], species: [{name: String,common_name: String,display_name: String}],karyotypes: [[String]]}])} callback
 */
module.exports.comparisons = (callback) => {
    if (db.readyState === 0) {
        return callback(new Error("Cannot connect to database."));
    }
    
    Comparison.find((err, comparisons) => {
        callback(err, comparisons);
    }).sort({ date_posted: -1 });
}

/**
 * Add the given comparison to the database.
 * @param {{divisions: [String], species: [{name: String,common_name: String,display_name: String}],karyotypes: [[String]]}} comparison
 * @param {(err?: Error)} callback
 */
module.exports.addComparison = (comparison, callback) => {
    if (db.readyState === 0) {
        return callback(new Error("Cannot connect to database."));
    }
    
    Comparison.remove({
        divisions: comparison.divisions,
        species: comparison.species,
        karyotypes: comparison.karyotypes
    }, (err) => {
        if (err) console.error(err);
        new Comparison(comparison).save((err, _) => {
            callback(err);
        });
    })
}

/**
 * Remove all recent comparisons from the database.
 * @param {(err?: Error)} callback
 */
module.exports.truncateComparisons = (callback) => {
    if (db.readyState === 0) {
        return callback(new Error("Cannot connect to database."));
    }

    Comparison.remove({}, (err) => {
        callback(err);
    });
}