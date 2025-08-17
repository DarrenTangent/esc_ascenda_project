import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    email: this.email,
    username: this.username
  };
};

export default mongoose.model('HotelUser', userSchema);
