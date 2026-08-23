const mongoose = require("mongoose");

const connectToDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB database Connection Established Successfully!!");
};

module.exports = connectToDatabase;
