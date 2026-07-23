import mongoose from "mongoose";

const connectDB = async () => {
  while (true) {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log("✅ MongoDB connected successfully");
      break;
    } catch (error) {
      console.error("❌ MongoDB connection failed");
      console.error(error.message);

      console.log("🔄 Retrying MongoDB connection in 5 seconds...");

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

export default connectDB;