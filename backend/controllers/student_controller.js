const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');

const studentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
            sectionName: req.body.sectionName || null,
        });

        if (existingStudent) {
            res.send({ message: 'Roll Number already exists' });
        }
        else {
            const student = new Student({
                ...req.body,
                school: req.body.adminID,
                password: hashedPass
            });

            let result = await student.save();

            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(200).json({ message: 'Student deleted successfully', deletedStudent: result });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
        }
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const addTermMarks = async (req, res) => {
    const { subName, marks } = req.body; // Expecting marks as an array of {term, marksObtained}
    const studentId = req.params.id;

    try {
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        if (!Array.isArray(marks)) {
            return res.status(400).send({ message: 'Marks should be an array.' });
        }

        marks.forEach(mark => {
            const { term, marksObtained, grade } = mark;
            const existingResultIndex = student.examResult.findIndex(
                (result) => result.subName.toString() === subName && result.term === term
            );

            if (existingResultIndex !== -1) {
                student.examResult[existingResultIndex].marksObtained = marksObtained ?? 0;
                student.examResult[existingResultIndex].grade = grade;
            } else {
                // Add new entry only if there's a mark or grade
                if (marksObtained || grade) {
                    student.examResult.push({ subName, marksObtained: marksObtained ?? 0, term, grade });
                }
            }
        });

        const result = await student.save();

        // After saving, populate the subName field before sending the response
        // The result from save() is a Mongoose document, so we can call populate on it.
        await result.populate("examResult.subName", "subName");
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date, isDailyAttendance } = req.body;

    console.log(`\n=== ATTENDANCE DEBUG ===`);
    console.log(`Student ID: ${req.params.id}`);
    console.log(`Subject ID: ${subName}`);
    console.log(`Status: ${status}`);
    console.log(`Date: ${date}`);
    console.log(`Is Daily Attendance: ${isDailyAttendance}`);

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            console.log('Student not found');
            return res.send({ message: 'Student not found' });
        }

        let subject = null;
        if (subName) {
            subject = await Subject.findById(subName);
            console.log('Subject found:', subject ? subject.subName : 'Not found');
        } else {
            console.log('Daily attendance - no subject required');
        }

        // For daily attendance, check by date only. For subject attendance, check by date and subject
        const existingAttendance = student.attendance.find((a) => {
            const sameDate = a.date.toDateString() === new Date(date).toDateString();
            if (isDailyAttendance || !subName) {
                // For daily attendance, only check date (one attendance per day)
                return sameDate && (!a.subName || a.subName === null);
            } else {
                // For subject-specific attendance, check both date and subject
                return sameDate && a.subName && a.subName.toString() === subName;
            }
        });

        console.log('Existing attendance for this date/subject:', existingAttendance ? 'Found' : 'Not found');

        if (existingAttendance) {
            console.log('Updating existing attendance status from', existingAttendance.status, 'to', status);
            existingAttendance.status = status;
        } else {
            if (isDailyAttendance || !subName) {
                // For daily attendance, no session limit checking needed
                console.log('Adding new daily attendance record');
                student.attendance.push({ 
                    date, 
                    status, 
                    subName: null, // Explicitly set to null for daily attendance
                    isDailyAttendance: true 
                });
            } else {
                // For subject-specific attendance, check session limits
                const attendedSessions = student.attendance.filter(
                    (a) => a.subName && a.subName.toString() === subName
                ).length;

                console.log('Current attended sessions for this subject:', attendedSessions);
                console.log('Subject total sessions:', subject ? subject.sessions : 'Unknown');

                if (subject && attendedSessions >= subject.sessions) {
                    console.log('Maximum attendance limit reached');
                    return res.send({ message: 'Maximum attendance limit reached' });
                }

                console.log('Adding new subject attendance record');
                student.attendance.push({ date, status, subName });
            }
        }

        const result = await student.save();
        console.log(`Attendance saved successfully for student ${student.name}`);
        console.log('=== END ATTENDANCE DEBUG ===\n');
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const termAttendance = async (req, res) => {
    const { status, date, term, isTermAttendance } = req.body;

    console.log(`\n=== TERM ATTENDANCE DEBUG ===`);
    console.log(`Student ID: ${req.params.id}`);
    console.log(`Status: ${status}`);
    console.log(`Date: ${date}`);
    console.log(`Term: ${term}`);

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            console.log('Student not found');
            return res.send({ message: 'Student not found' });
        }

        // Check for existing term attendance on this date
        const existingAttendance = student.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString() &&
                a.term === term &&
                a.isTermAttendance === true
        );

        console.log('Existing term attendance for this date:', existingAttendance ? 'Found' : 'Not found');

        if (existingAttendance) {
            console.log('Updating existing term attendance status from', existingAttendance.status, 'to', status);
            existingAttendance.status = status;
        } else {
            console.log('Adding new term attendance record');
            student.attendance.push({ 
                date, 
                status, 
                term,
                isTermAttendance: true,
                // No subName for term attendance - it's class-wide, not subject-specific
            });
        }

        const result = await student.save();
        console.log(`Term attendance saved successfully for student ${student.name}`);
        console.log('=== END TERM ATTENDANCE DEBUG ===\n');
        return res.send(result);
    } catch (error) {
        console.error('Error in term attendance:', error);
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id

    try {
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, student.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid old password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        student.password = hashedPassword;
        await student.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
};

const getStudentTermReport = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('sclassName', 'sclassName')
            .populate('examResult.subName', 'subName');

        if (!student) {
            return res.status(404).send({ message: "Student not found" });
        }

        const classId = student.sclassName._id;
        const classmates = await Student.find({ sclassName: classId }).populate('examResult.subName', 'subName');

        const report = {};
        const terms = ['TERM_1', 'TERM_2', 'TERM_3'];

        terms.forEach(term => {
            // Calculate total marks for all students in the class for the current term
            const termScores = classmates.map(s => {
                const totalMarks = s.examResult
                    .filter(result => result.term === term)
                    .reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
                return { studentId: s._id.toString(), totalMarks };
            });

            // Sort by total marks to determine rank
            termScores.sort((a, b) => b.totalMarks - a.totalMarks);

            // Find the rank of the current student
            const studentRank = termScores.findIndex(s => s.studentId === student._id.toString()) + 1;

            // Filter results for the current student and term
            const studentTermResults = student.examResult.filter(result => result.term === term);

            if (studentTermResults.length > 0) {
                const totalMarks = studentTermResults.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
                const average = totalMarks / studentTermResults.length;

                report[term] = {
                    subjects: studentTermResults.map(r => ({
                        subName: r.subName.subName,
                        marksObtained: r.marksObtained,
                        grade: r.grade,
                    })),
                    totalMarks,
                    average,
                    rank: studentRank > 0 ? studentRank : 'N/A',
                };
            } else {
                report[term] = {
                    subjects: [],
                    totalMarks: 0,
                    average: 0,
                    rank: 'N/A',
                };
            }
        });

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    termAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    addTermMarks,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    changePassword,
    getStudentTermReport,
};
