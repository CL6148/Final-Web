const {Schema, model} = require("mongoose");

const LocationSchema = Schema( {
    name: String,
    id: String,
    post_date: {
        type: Date, 
        default: Date.now
    }
});

module.exports = model('posts', LocationSchema);