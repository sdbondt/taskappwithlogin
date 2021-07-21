const express = require('express');
const { createTask, getTaskPage, myTasks, getTask, deleteTask } = require('../controllers/taskController');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/create', auth, getTaskPage);

router.post('/create', createTask);

router.get('/mytasks', auth, myTasks);

router.get('/mytasks/:page', auth, myTasks);

router.get('/:id', auth, getTask);

router.post('/delete/:id', deleteTask);

module.exports = router;