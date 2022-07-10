import mongoose from 'mongoose';

export const appDB = mongoose.connection.useDb('polymap');

const mapSchema = new mongoose.Schema({
  mapID: String,
  imdf: {}
})

mongoose.model("map", mapSchema)

export const Map = appDB.model("map", mapSchema)




