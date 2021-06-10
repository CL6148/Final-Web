const {Schema, model} = require("mongoose");

const LocationSchema = Schema( {
    name: String,
    location: String,
    manager: String,
    id: String
});

module.exports = model('plants', LocationSchema);