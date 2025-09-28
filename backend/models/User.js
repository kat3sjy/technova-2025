import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    usernameLower: { type: String, required: true }, // removed inline index
    passwordHash: { type: String, required: true },
    email: { type: String, trim: true },
    emailLower: { type: String }, // removed inline index
  },
  { timestamps: true, collection: 'users' }
);

// Unique indexes
UserSchema.index({ usernameLower: 1 }, { unique: true });
UserSchema.index(
  { emailLower: 1 },
  { unique: true, partialFilterExpression: { emailLower: { $exists: true, $type: 'string' } } }
);

// Ensure lowercase fields are set
UserSchema.pre('save', function (next) {
  if (this.isModified('username') || this.isNew) {
    this.username = (this.username || '').trim();
    this.usernameLower = this.username.toLowerCase();
  }
  if (this.isModified('email')) {
    this.email = this.email ? this.email.trim() : undefined;
    this.emailLower = this.email ? this.email.toLowerCase() : undefined;
  }
  next();
});

// Optional: helper to hide sensitive fields when converting to JSON
UserSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email || undefined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Helpers expected by routes (schema-less, safe defaults)
async function createUser(data) {
  const doc = new User(data || {});
  return await doc.save();
}

async function updateUser(id, update) {
  return await User.findByIdAndUpdate(id, update || {}, { new: true, lean: true });
}

async function upsertUserByUsername(username, data = {}) {
  if (!username) throw new Error('username is required for upsertUserByUsername');
  return await User.findOneAndUpdate(
    { username },
    { $set: data },
    { new: true, upsert: true, setDefaultsOnInsert: true, lean: true }
  );
}

async function findUserById(id) {
  return await User.findById(id).lean();
}

async function listUsers(filter = {}, { limit = 50, skip = 0 } = {}) {
  return await User.find(filter).skip(skip).limit(Math.max(1, Math.min(200, limit))).lean();
}

export default User;
export { createUser, updateUser, upsertUserByUsername, findUserById, listUsers };
