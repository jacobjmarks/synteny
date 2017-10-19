const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/syntenyDB');

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

const Comparison = mongoose.model('Comparison', comparisonSchema);

module.exports.comparisons = (callback) => {
    Comparison.find((err, comparisons) => {
        callback(err, comparisons);
    }).sort({ date_posted: -1 });
}

module.exports.addComparison = (comparison, callback) => {
    console.log(comparison);
    new Comparison({
        divisions: comparison.divisions,
        species: comparison.species,
        karyotypes: comparison.karyotypes
    }).save((err, _) => {
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