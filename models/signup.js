const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    roll_no:{
        type:String,
        required:true
    },
    route_id: {
        type: Schema.Types.ObjectId,
        ref: 'Route', // Reference to the Route model
        default: null,
      },

    stop:{
        type:String,
        default:null
    },
    
    created_at:{
        type:Date,
        default:Date.now
    }
});

const User = mongoose.model('User',userSchema);
module.exports = User;