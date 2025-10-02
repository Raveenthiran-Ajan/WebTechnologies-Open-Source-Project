const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass, attendanceClass } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Only check for existing attendance teacher if attendance class is explicitly set
        if (attendanceClass) {
            const existingAttendanceTeacher = await Teacher.findOne({ attendanceClass });
            if (existingAttendanceTeacher) {
                return res.send({ message: 'Another teacher is already assigned for attendance in this class' });
            }
        }

        const teacherData = { 
            name, 
            email, 
            password: hashedPass, 
            role, 
            school, 
            teachSubject, 
            teachSclass
        };

        // Only add attendanceClass if it's explicitly provided
        if (attendanceClass) {
            teacherData.attendanceClass = attendanceClass;
        }

        const teacher = new Teacher(teacherData);

        const existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else {
            let result = await teacher.save();
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName")
            .populate("teachSubjects", "subName")
            .populate("teachSclasses", "sclassName")
            .populate("attendanceClass", "sclassName");
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                const teacherDoc = { ...teacher._doc, password: undefined };
                // Only include attendanceClass if it's explicitly set
                if (!teacherDoc.attendanceClass) {
                    delete teacherDoc.attendanceClass;
                }
                return teacherDoc;
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions sclassName")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName")
            .populate({
                path: "teachSubjects",
                select: "subName sessions sclassName",
                populate: {
                    path: "sclassName",
                    select: "sclassName"
                }
            })
            .populate("teachSclasses", "sclassName")
            .populate("attendanceClass", "sclassName")

        if (teacher) {
            const teacherDoc = teacher.toObject();
            teacherDoc.password = undefined;

            // Clean up the data
            if (!teacherDoc.teachSubjects?.length) delete teacherDoc.teachSubjects;
            if (!teacherDoc.teachSclasses?.length) delete teacherDoc.teachSclasses;
            if (!teacherDoc.attendanceClass) delete teacherDoc.attendanceClass;

            // Ensure legacy fields are properly populated if arrays are empty
            if (!teacherDoc.teachSubjects && teacherDoc.teachSubject) {
                teacherDoc.teachSubjects = [teacherDoc.teachSubject];
            }
            if (!teacherDoc.teachSclasses && teacherDoc.teachSclass) {
                teacherDoc.teachSclasses = [teacherDoc.teachSclass];
            }

            res.send(teacherDoc);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        // Get the teacher first
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Get the subject to determine its class
        const subject = await Subject.findById(teachSubject).populate('sclassName');
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // Initialize arrays if they don't exist (migrate old teachers)
        const updateFields = {};
        
        // Handle subjects
        if (!teacher.teachSubjects || !Array.isArray(teacher.teachSubjects)) {
            // Migrate from old structure
            updateFields.teachSubjects = teacher.teachSubject ? [teacher.teachSubject, teachSubject] : [teachSubject];
        } else {
            // Add to existing array if not already present
            if (!teacher.teachSubjects.includes(teachSubject)) {
                updateFields.$addToSet = { teachSubjects: teachSubject };
            }
        }

        // Handle classes
        const subjectClassId = subject.sclassName._id;
        if (!teacher.teachSclasses || !Array.isArray(teacher.teachSclasses)) {
            // Migrate from old structure
            const existingClasses = teacher.teachSclass ? [teacher.teachSclass] : [];
            if (!existingClasses.includes(subjectClassId)) {
                existingClasses.push(subjectClassId);
            }
            updateFields.teachSclasses = existingClasses;
        } else {
            // Add class to array if not already present
            if (!teacher.teachSclasses.includes(subjectClassId)) {
                if (!updateFields.$addToSet) updateFields.$addToSet = {};
                updateFields.$addToSet.teachSclasses = subjectClassId;
            }
        }

        // Set attendance class if not set
        if (!teacher.attendanceClass) {
            updateFields.attendanceClass = teacher.teachSclass || subjectClassId;
        }

        // Update teacher with new assignments
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            updateFields,
            { new: true }
        ).populate("teachSubjects", "subName")
         .populate("teachSclasses", "sclassName")
         .populate("attendanceClass", "sclassName")
         .populate("teachSubject", "subName")
         .populate("teachSclass", "sclassName");

        // Update the subject to reference this teacher
        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        console.log('Updated teacher:', updatedTeacher);
        res.send(updatedTeacher);
    } catch (error) {
        console.error('Error updating teacher subject:', error);
        res.status(500).json(error);
    }
};

const assignMultipleSubjects = async (req, res) => {
    const { teacherId, subjectIds, attendanceClassId } = req.body;
    try {
        console.log('=== ASSIGN MULTIPLE SUBJECTS ===');
        console.log('Teacher ID:', teacherId);
        console.log('Subject IDs:', subjectIds);
        console.log('Attendance Class ID:', attendanceClassId);

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Get all subjects to determine their classes
        const subjects = await Subject.find({ _id: { $in: subjectIds } }).populate('sclassName');
        if (subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found" });
        }

        console.log('Found subjects:', subjects.map(s => ({ name: s.subName, class: s.sclassName.sclassName })));

        // Get unique class IDs from subjects
        const classIds = [...new Set(subjects.map(subject => subject.sclassName._id.toString()))];
        console.log('Class IDs:', classIds);

        // Check if another teacher is already assigned for attendance in the selected class
        if (attendanceClassId) {
            const existingAttendanceTeacher = await Teacher.findOne({
                attendanceClass: attendanceClassId,
                _id: { $ne: teacherId } // Exclude current teacher
            });
            
            if (existingAttendanceTeacher) {
                return res.status(400).json({
                    message: `Teacher ${existingAttendanceTeacher.name} is already assigned for attendance in this class`
                });
            }
        }

        // Only set attendance class if explicitly provided
        const finalAttendanceClass = attendanceClassId || null;
        console.log('Final attendance class:', finalAttendanceClass);

        // Direct update - replace all arrays
        const updateFields = {
            teachSubjects: subjectIds,
            teachSclasses: classIds,
            attendanceClass: finalAttendanceClass
        };

        console.log('Update fields:', updateFields);

        // Update teacher with explicit field replacement
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            updateFields,
            { new: true, runValidators: true }
        ).populate("teachSubjects", "subName")
         .populate("teachSclasses", "sclassName")
         .populate("attendanceClass", "sclassName");

        // Update all subjects to reference this teacher
        await Subject.updateMany(
            { _id: { $in: subjectIds } },
            { teacher: updatedTeacher._id }
        );

        console.log('Updated teacher result:', {
            name: updatedTeacher.name,
            teachSubjects: updatedTeacher.teachSubjects,
            teachSclasses: updatedTeacher.teachSclasses,
            attendanceClass: updatedTeacher.attendanceClass
        });

        res.send(updatedTeacher);
    } catch (error) {
        console.error('Error assigning multiple subjects:', error);
        res.status(500).json(error);
    }
};

const testTeacherAssignment = async (req, res) => {
    try {
        console.log('=== CREATING REAL MULTI-CLASS ASSIGNMENT ===');
        
        // Import the required models
        const Sclass = require('../models/sclassSchema');
        
        // Find teacher1
        const teacher = await Teacher.findOne({ name: 'teacher1' });
        if (!teacher) {
            return res.status(404).json({ message: "teacher1 not found" });
        }
        
        // Find admin to use as school reference
        const admin = await require('../models/adminSchema').findOne({});
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        // Find or create class 6
        let class6 = await Sclass.findOne({ sclassName: '6', school: admin._id });
        if (!class6) {
            class6 = new Sclass({
                sclassName: '6',
                school: admin._id
            });
            await class6.save();
            console.log('Created class 6');
        }
        
        // Find or create class 7
        let class7 = await Sclass.findOne({ sclassName: '7', school: admin._id });
        if (!class7) {
            class7 = new Sclass({
                sclassName: '7',
                school: admin._id
            });
            await class7.save();
            console.log('Created class 7');
        }
        
        // Create a subject for class 7 if it doesn't exist
        let subjectForClass7 = await Subject.findOne({ sclassName: class7._id });
        if (!subjectForClass7) {
            subjectForClass7 = new Subject({
                subName: 'Math',
                subCode: 'MTH7',
                sessions: 40,
                sclassName: class7._id,
                school: admin._id
            });
            await subjectForClass7.save();
            console.log('Created Math subject for class 7');
        }
        
        // Find all subjects
        const subjects = await Subject.find({ school: admin._id }).populate('sclassName');
        const subjectIds = subjects.map(s => s._id);
        
        console.log('Available classes:', [class6, class7].map(c => ({ id: c._id, name: c.sclassName })));
        console.log('Available subjects:', subjects.map(s => ({ 
            name: s.subName, 
            class: s.sclassName.sclassName 
        })));
        
        // Assign teacher to both classes and all subjects
        const classIds = [class6._id, class7._id];
        
        const updateFields = {
            teachSubjects: subjectIds,
            teachSclasses: classIds,
            attendanceClass: class6._id // Class 6 for attendance
        };
        
        console.log('Assigning teacher to:', {
            classes: ['6', '7'],
            attendanceClass: '6',
            subjectCount: subjectIds.length
        });
        
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacher._id,
            updateFields,
            { new: true, runValidators: true }
        ).populate("teachSubjects", "subName")
         .populate("teachSclasses", "sclassName")
         .populate("attendanceClass", "sclassName");

        // Update all subjects to reference this teacher
        await Subject.updateMany(
            { _id: { $in: subjectIds } },
            { teacher: updatedTeacher._id }
        );
        
        console.log('SUCCESS! Teacher assigned to:');
        console.log('- Classes:', updatedTeacher.teachSclasses.map(c => c.sclassName));
        console.log('- Subjects:', updatedTeacher.teachSubjects.map(s => s.subName));
        console.log('- Attendance Class:', updatedTeacher.attendanceClass.sclassName);
        
        res.json({
            success: true,
            message: 'teacher1 successfully assigned to classes 6 and 7 with multiple subjects!',
            teacher: {
                name: updatedTeacher.name,
                teachSubjects: updatedTeacher.teachSubjects,
                teachSclasses: updatedTeacher.teachSclasses,
                attendanceClass: updatedTeacher.attendanceClass
            }
        });
        
    } catch (error) {
        console.error('Assignment error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        await Subject.updateOne(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ school: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, teacher.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid old password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        teacher.password = hashedPassword;
        await teacher.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    assignMultipleSubjects,
    testTeacherAssignment,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance,
    changePassword
};