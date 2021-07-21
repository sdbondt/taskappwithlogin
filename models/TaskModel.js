const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const taskSchema = new Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        }
    }, {
        timestamps: true,
    }
)

const Task = model('Task', taskSchema);

module.exports = Task;