const dotenv = require('dotenv');
dotenv.config();
const connectToDb = require('./db/db.js')
connectToDb();
const express = require('express');
const app = express();
const cors = require('cors');
const adminRoutes = require('./routes/admin.routes.js');
const teacherRoutes = require('./routes/teacher.routes.js');
const studentRoutes = require('./routes/student.routes.js');
const externalTeacherRoutes = require('./routes/externalTeacher.routes.js');

app.use(cors());
app.use(express.json());



app.get('/', (req, res) => { res.send('Hello world') });

app.use('/v1/api/admin', adminRoutes);
app.use('/v1/api/teacher', teacherRoutes);
app.use('/v1/api/student', studentRoutes);
app.use('/v1/api/external-teacher', externalTeacherRoutes);



module.exports = app;
