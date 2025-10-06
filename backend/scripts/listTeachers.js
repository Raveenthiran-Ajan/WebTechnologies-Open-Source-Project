const mongoose = require('mongoose');
const Teacher = require('../models/teacherSchema.js');

const mongoURI = 'mongodb://localhost:27017/your_database_name'; // Replace with your MongoDB URI

async function listTeachers() {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const teachers = await Teacher.find().populate('teachSclasses').lean();
    teachers.forEach(teacher => {
      console.log('Teacher:', teacher.name, 'Email:', teacher.email);
      console.log('Assigned Classes:', teacher.teachSclasses.map(c => ({ id: c._id, name: c.sclassName })));
      console.log('---');
    });

    mongoose.disconnect();
  } catch (error) {
    console.error('Error listing teachers:', error);
  }
}

listTeachers();
