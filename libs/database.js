const mongoose = require('mongoose');
const optional = require('optional');
// mongoose.connect('mongodb://localhost:27017/syntenyDB');

const conf = optional('./mongodb.json');
conf && mongoose.connect(`mongodb://${conf.user}:${conf.pass}@syntenycluster-shard-00-00-viwso.mongodb.net:27017,syntenycluster-shard-00-01-viwso.mongodb.net:27017,syntenycluster-shard-00-02-viwso.mongodb.net:27017/test?ssl=true&replicaSet=syntenyCluster-shard-0&authSource=admin`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Database connected.");
});

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
        console.log(count);
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
    Comparison.find((err, comparisons) => {
        callback(err, comparisons);
    }).sort({ date_posted: -1 });
}

module.exports.addComparison = (comparison, callback) => {
    new Comparison(comparison).save((err, _) => {
        callback(err);
    });
}

// module.exports.deletePost = (post_id, callback) => {
//     Post.findByIdAndRemove(post_id, (err, _) => {
//         callback(err);
//     });
// }

module.exports.truncateComparisons = (callback) => {
    Comparison.remove({}, (err) => {
        callback(err);
    });
}