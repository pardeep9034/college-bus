const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Stop sub-schema
const StopSchema = new Schema({
  stop_name: {
    type: String,
    required: true,
  },
  arrival_time: {
    type: String,
    required: true,
  },
});

// Define the Route schema
const RouteSchema = new Schema({
  route_name: {
    type: String,
    required: true,
  },
  bus_number: {
    type: String,
    required: true,
  },
  departure:{
  type:String,
  required:true,
  },

  source:{
    type: String,
    required: true,
  },
  destination:{
    type: String,
    required: true,
  },
  driver_name: {
    type: String,
    required: true,
  },
  driver_contact: {
    type: String,
    required: true,
  },
  stops: [StopSchema], // Embedding the Stop schema
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Create the Route model
const Route = mongoose.model('Route', RouteSchema);

module.exports = Route;
