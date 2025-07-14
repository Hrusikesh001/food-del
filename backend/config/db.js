import mongoose from "mongoose"

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://hrushikeshs113:39cD7wqGJDKHf6Fa@cluster0.hccyzkq.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}