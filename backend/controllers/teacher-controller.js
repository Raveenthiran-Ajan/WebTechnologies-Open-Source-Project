const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Teacher = require('../models/teacherSchema.js');
const Admin = require('../models/adminSchema.js');
const Subject = require('../models/subjectSchema.js');
const sendEmail = require('../utils/sendEmail.js');

const teacherRegister = async (req, res) => {
    const { name, email, role, school, teachSubjects, teachSclass, teachSections, attendanceSections, attendanceClass, autoGeneratePassword, password } = req.body;
    try {
        let finalPassword;
        
        if (autoGeneratePassword) {
            // Generate random password
            finalPassword = crypto.randomBytes(8).toString('hex');
        } else {
            // Use provided password
            finalPassword = password;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(finalPassword, salt);

        // Check for existing attendance responsibility in the same sections
        if (attendanceSections && attendanceSections.length > 0) {
            const existingAttendanceTeacher = await Teacher.findOne({
                "attendanceSections.sectionName": { $in: attendanceSections }
            });
            if (existingAttendanceTeacher) {
                return res.send({ message: 'Another teacher is already assigned for attendance in one or more of these sections' });
            }
        }

        // Check for existing attendance responsibility for the class
        if (attendanceClass) {
            const existingClassAttendanceTeacher = await Teacher.findOne({
                attendanceClass: attendanceClass
            });
            if (existingClassAttendanceTeacher) {
                return res.send({ message: 'Another teacher is already assigned for attendance in this class' });
            }
        }

        // Convert section names to proper objects
        const Sclass = require('../models/sclassSchema.js');
        const teachingSectionDetails = [];
        const attendanceSectionDetails = [];
        
        const classObj = await Sclass.findById(teachSclass);
        if (!classObj) {
            return res.send({ message: 'Class not found' });
        }

        if (teachSections && teachSections.length > 0) {
            for (const sectionName of teachSections) {
                const section = classObj.sections.find(s => s.sectionName === sectionName);
                if (section) {
                    teachingSectionDetails.push({
                        sectionId: section._id,
                        sectionName: sectionName,
                        sclassName: teachSclass
                    });
                }
            }
        }

        if (attendanceSections && attendanceSections.length > 0) {
            for (const sectionName of attendanceSections) {
                const section = classObj.sections.find(s => s.sectionName === sectionName);
                if (section) {
                    attendanceSectionDetails.push({
                        sectionId: section._id,
                        sectionName: sectionName,
                        sclassName: teachSclass
                    });
                }
            }
        }

        // Support for multiple subjects and backward compatibility
        const teachSubject = teachSubjects && teachSubjects.length > 0 ? teachSubjects[0] : null;

        const teacherData = { 
            name, 
            email, 
            password: hashedPass, 
            role, 
            school, 
            teachSubjects: teachSubjects || [], 
            teachSubject, 
            teachSclass,
            teachSclasses: teachSclass ? [teachSclass] : [],
            teachSections: teachingSectionDetails,
            attendanceSections: attendanceSectionDetails,
            attendanceClass: attendanceClass || null
        };
        console.log('Saving teacher with data:', teacherData);

        const teacher = new Teacher(teacherData);

        const existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else {
            let result = await teacher.save();
            
            // Update all subjects with this teacher
            if (teachSubjects && teachSubjects.length > 0) {
                await Promise.all(teachSubjects.map(async (subjectId) => {
                    await Subject.findByIdAndUpdate(subjectId, { teacher: teacher._id });
                }));
            } 
            // Backward compatibility for single subject
            else if (teachSubject) {
                await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
            }
            
            // Send welcome email
            const adminDoc = await Admin.findById(school).select('schoolName');
            const schoolName = (adminDoc && adminDoc.schoolName) ? adminDoc.schoolName : 'Our';
            const loginUrl = 'http://localhost:3000/Teacherlogin'; // Role-based login URL for teachers
            const emailHtml = `
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 24px;">
                    <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 24px;">
                        <h2 style="text-align: center; color: #333333; margin: 0 0 16px;">Welcome to ${schoolName} School Management System!</h2>
                        <p style="margin: 0 0 12px;">Dear ${name},</p>
                        <p style="margin: 0 0 16px;">Your teacher account has been successfully created. Here are your login credentials:</p>

                        <div style="background-color: #f5f7fa; padding: 16px; border-radius: 8px; margin: 0 0 16px;">
                            <p style="margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #1976d2; text-decoration: underline;">${email}</a></p>
                            <p style="margin: 0 0 8px;"><strong>Password:</strong> ${finalPassword}</p>
                            <p style="margin: 0;"><strong>Role:</strong> Teacher</p>
                        </div>

                        <p style="margin: 0 0 12px;">Please use the following link to login:</p>
                        <div style="text-align: center; margin: 12px 0 20px;">
                            <a href="${loginUrl}" style="background-color: #1976d2; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Login as Teacher</a>
                        </div>

                        <p style="margin: 0 0 12px;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                        <p style="margin: 0 0 16px;">If you have any questions, please contact the system administrator.</p>

                        <p style="margin: 0;">Best regards,<br>School Management System Team</p>
                    </div>
                </body>
                </html>
            `;
            
            try {
                await sendEmail({
                    to: email,
                    subject: 'Welcome to School Management System - Your Account Details',
                    text: emailHtml
                });
            } catch (emailErr) {
                console.error('Error sending email:', emailErr);
                // Don't fail the registration if email fails
            }
            
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
            .populate("teachSections.sclassName", "sclassName")
            .populate("attendanceSections.sclassName", "sclassName")
            .populate("attendanceClass", "sclassName");
        console.log('Teachers found:', teachers.length);
        teachers.forEach((teacher, index) => {
            console.log(`Teacher ${index}: ${teacher.name}, teachSections:`, teacher.teachSections, 'attendanceSections:', teacher.attendanceSections);
        });
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                const teacherDoc = { ...teacher._doc, password: undefined };
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
            .populate("teachSections.sclassName", "sclassName")
            .populate("attendanceSections.sclassName", "sclassName")

        if (teacher) {
            const teacherDoc = teacher.toObject();
            teacherDoc.password = undefined;

            // Add student counts for each section
            const Student = require('../models/studentSchema.js');
            
            if (teacherDoc.teachSections && teacherDoc.teachSections.length > 0) {
                for (let section of teacherDoc.teachSections) {
                    const studentCount = await Student.countDocuments({
                        sclassName: section.sclassName._id,
                        sectionName: section.sectionName
                    });
                    section.studentCount = studentCount;
                }
            }

            if (teacherDoc.attendanceSections && teacherDoc.attendanceSections.length > 0) {
                for (let section of teacherDoc.attendanceSections) {
                    const studentCount = await Student.countDocuments({
                        sclassName: section.sclassName._id,
                        sectionName: section.sectionName
                    });
                    section.studentCount = studentCount;
                }
            }

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

const updateTeacherAssignments = async (req, res) => {
    const { teacherId, subjectIds, teachSections, attendanceSections, selectedClass, attendanceClassId } = req.body;
    try {
        console.log('=== UPDATE TEACHER ASSIGNMENTS ===');
        console.log('Teacher ID:', teacherId);
        console.log('Subject IDs:', subjectIds);
        console.log('Teaching Sections:', teachSections);
        console.log('Attendance Sections:', attendanceSections);
        console.log('Selected Class:', selectedClass);

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Get all subjects to validate they belong to the selected class
        const subjects = await Subject.find({ _id: { $in: subjectIds } }).populate('sclassName');
        if (subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found" });
        }

        // Validate that all subjects belong to the selected class
        const invalidSubjects = subjects.filter(subject => subject.sclassName._id.toString() !== selectedClass);
        if (invalidSubjects.length > 0) {
            return res.status(400).json({
                message: "All subjects must belong to the selected class"
            });
        }

        console.log('Found subjects:', subjects.map(s => ({ name: s.subName, class: s.sclassName.sclassName })));

        // Validate that attendance sections are subset of teaching sections (only if attendance sections are provided)
        if (attendanceSections && attendanceSections.length > 0) {
            const invalidSections = attendanceSections.filter(sectionId => 
                !teachSections.includes(sectionId)
            );
            if (invalidSections.length > 0) {
                return res.status(400).json({
                    message: "Attendance sections must be a subset of teaching sections"
                });
            }

            // Check if another teacher is already assigned for attendance in the selected sections
            const existingAttendanceTeacher = await Teacher.findOne({
                "attendanceSections.sectionId": { $in: attendanceSections },
                _id: { $ne: teacherId } // Exclude current teacher
            });
            
            if (existingAttendanceTeacher) {
                return res.status(400).json({
                    message: `Another teacher is already assigned for attendance in one or more of these sections`
                });
            }
        }

        // Get section details for population
        const Sclass = require('../models/sclassSchema.js');
        const teachingSectionDetails = [];
        const attendanceSectionDetails = [];

        for (const sectionId of teachSections) {
            const section = await Sclass.findOne(
                { "sections._id": sectionId },
                { "sections.$": 1, sclassName: 1 }
            );
            if (section && section.sections && section.sections.length > 0) {
                teachingSectionDetails.push({
                    sectionId: sectionId,
                    sectionName: section.sections[0].sectionName,
                    sclassName: section._id
                });
            }
        }

        for (const sectionId of (attendanceSections || [])) {
            const section = await Sclass.findOne(
                { "sections._id": sectionId },
                { "sections.$": 1, sclassName: 1 }
            );
            if (section && section.sections && section.sections.length > 0) {
                attendanceSectionDetails.push({
                    sectionId: sectionId,
                    sectionName: section.sections[0].sectionName,
                    sclassName: section._id
                });
            }
        }

        // Direct update - replace all arrays
        const updateFields = {
            teachSubjects: subjectIds,
            teachSclasses: [selectedClass], // Single class
            teachSections: teachingSectionDetails,
            attendanceSections: attendanceSectionDetails
        };

        // Handle class-wide vs section attendance precedence
        if (attendanceClassId !== undefined) {
            // If explicitly set (including null), apply it
            updateFields.attendanceClass = attendanceClassId;
            // When class-wide attendance is set, clear section-based attendance
            if (attendanceClassId) {
                updateFields.attendanceSections = [];
            }
        } else if ((attendanceSections || []).length > 0) {
            // If section attendance provided, clear class-wide attendance
            updateFields.attendanceClass = null;
        }

        console.log('Update fields:', updateFields);

        // Update teacher with explicit field replacement
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            updateFields,
            { new: true, runValidators: true }
        ).populate("teachSubjects", "subName")
         .populate("teachSclasses", "sclassName")
         .populate("attendanceClass", "sclassName")
         .populate("teachSections.sclassName", "sclassName")
         .populate("attendanceSections.sclassName", "sclassName");

        // Update all subjects to reference this teacher
        await Subject.updateMany(
            { _id: { $in: subjectIds } },
            { teacher: updatedTeacher._id }
        );

        console.log('Updated teacher result:', {
            name: updatedTeacher.name,
            teachSubjects: updatedTeacher.teachSubjects,
            teachSclasses: updatedTeacher.teachSclasses,
            teachSections: updatedTeacher.teachSections,
            attendanceSections: updatedTeacher.attendanceSections
        });

        res.send(updatedTeacher);
    } catch (error) {
        console.error('Error updating teacher assignments:', error);
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
    updateTeacherAssignments,
    testTeacherAssignment,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance,
    changePassword
};