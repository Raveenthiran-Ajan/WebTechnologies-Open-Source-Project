const mongoose = require('mongoose');
const Teacher = require('../models/teacherSchema.js');

const mongoURI = 'mongodb://localhost:27017/your_database_name'; // Replace with your MongoDB URI

async function updateTeacherClasses(teacherEmail, classIds) {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      console.log('Teacher not found');
      return;
    }

    teacher.teachSclasses = classIds;
    await teacher.save();
    console.log(`Updated teachSclasses for teacher ${teacherEmail} to:`, classIds);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating teacher classes:', error);
  }
}

// Example usage:
// Replace 'teacher1@gmail.com' with the teacher's email
// Replace ['class1ObjectIdHere'] with an array of class ObjectIds assigned to the teacher
updateTeacherClasses('teacher1@gmail.com', ['class1ObjectIdHere']);
