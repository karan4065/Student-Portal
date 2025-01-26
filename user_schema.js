const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    roll: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: '', // Default value if no profile picture is provided
        validate: {
            validator: function(value) {
                // Check if the value is a valid URL (optional, for URL format validation)
                return /^https?:\/\//.test(value) || value === '' || value.startsWith('/uploads/');
            },
            message: 'Invalid profile picture format. Must be a URL or local path.'
        }
    },
});

const createUser = mongoose.model("createUser", userSchema);

module.exports = createUser;
