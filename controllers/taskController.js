const Task = require('../models/TaskModel');

exports.getTaskPage = (req, res, next) => {
    res.render('createtask', {
        pageTitle: 'Create a task',
    })
};

exports.createTask = async (req, res, next) => {
    const { title, description } = req.body;
    const newTask = new Task({
        title,
        description,
        owner: req.user._id,
    });

    try {
        const task = await newTask.save();
        req.user.tasks.push(task);
        await req.user.save();
        res.redirect('/task/mytasks')    
    } catch (e) {
        next(e)
    }

};

exports.myTasks = async (req, res, next) => {
    let page = parseInt(req.params.page) || 1;
    const limit = 2;
    const skip = (limit * page) - limit;
    
    try {
        const tasksPromise = Task
        .find({owner: req.user._id })
        .skip(skip)
        .limit(limit);

        const countPromise = Task.find({ owner: req.user._id }).countDocuments();
        const [tasks, count] = await Promise.all([tasksPromise, countPromise]);
        const pages = Math.ceil(count/ limit);
        
        if (page> pages) {
            return res.redirect(`/task/mytasks/${pages}`)
        }

        res.render('tasks', {
            pageTitle: 'See my tasks',
            tasks,
            count,
            pages,
            page,
        })
    } catch (e) {
        next(e)
    }
};

exports.getTask = async (req, res, next) => {
    const { id } = req.params;
    try {
        const task = await Task.findById(id);
        res.render('task', {
            pageTitle: task.title,
            task,
        })
    } catch (e) {
        next(e)
    }
};

exports.deleteTask = async (req, res, next) => {
    const { id } = req.params;
    try {
        await Task.findByIdAndDelete(id);
        req.user.tasks = req.user.tasks.filter(task => task._id.toString() !== id);
        await req.user.save();
        res.redirect('/task/mytasks')
    } catch (e) {
        next(e)
    }
};
