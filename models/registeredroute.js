const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registeredRouteSchema = new Schema({
    route_id: {
        type:String,
        default:null,

    },
    user_id: {
        type:String,
        default:null,
    },
    stop_name: {
        type: String,
        default: null,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});
const RegisteredRoute = mongoose.model('RegisteredRoute', registeredRouteSchema);
module.exports = RegisteredRoute;