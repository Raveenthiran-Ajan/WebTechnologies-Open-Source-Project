const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

const sclassCreate = async (req, res) => {
    try {
        const sclass = new Sclass({
            sclassName: req.body.sclassName,
            school: req.body.adminID,
            subjects: req.body.subjects || [],
            timetable: []
        });

        const existingSclassByName = await Sclass.findOne({
            sclassName: req.body.sclassName,
            school: req.body.adminID
        });

        if (existingSclassByName) {
            res.send({ message: 'Sorry this class name already exists' });
        }
        else {
            const result = await sclass.save();
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const sclassUpdate = async (req, res) => {
    try {
        const { id, sclassName, subjects, adminID } = req.body;

        // Check if another class with the same name exists (excluding current class)
        const existingSclassByName = await Sclass.findOne({
            sclassName: sclassName,
            school: adminID,
            _id: { $ne: id }
        });

        if (existingSclassByName) {
            res.send({ message: 'Sorry this class name already exists' });
        } else {
            const updatedSclass = await Sclass.findByIdAndUpdate(
                id,
                {
                    sclassName: sclassName,
                    subjects: subjects || []
                },
                { new: true }
            ).populate('subjects.subject', 'subName subCode periodsPerWeek');

            if (!updatedSclass) {
                res.send({ message: 'Class not found' });
            } else {
                res.send(updatedSclass);
            }
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const sclassList = async (req, res) => {
    try {
        let sclasses = await Sclass.find({ school: req.params.id }).lean();
        if (sclasses.length > 0) {
            const sclassesWithCounts = await Promise.all(sclasses.map(async (sclass) => {
                const studentCount = await Student.countDocuments({ sclassName: sclass._id });
                // Find teachers directly assigned to the class
                const teacherObjs = await Teacher.find({
                    $or: [
                        { teachSclasses: sclass._id },
                        { teachSclass: sclass._id }
                    ]
                }).select('_id name email');
                const teacherCount = teacherObjs.length;
                return {
                    ...sclass,
                    students: studentCount,
                    teachers: teacherCount,
                    teacherList: teacherObjs,
                };
            }));
            res.send(sclassesWithCounts);
        } else {
            res.send({ message: "No sclasses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSclassDetail = async (req, res) => {
    try {
        let sclass = await Sclass.findById(req.params.id)
            .populate('subjects.subject', 'subName subCode periodsPerWeek')
            .populate("school", "schoolName");
        if (sclass) {
            // Filter out subjects with null references
            sclass.subjects = sclass.subjects.filter(subject => subject.subject !== null);
            res.send(sclass);
        }
        else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getSclassStudents = async (req, res) => {
    try {
        const query = { sclassName: req.params.id };

        let students = await Student.find(query).populate("examResult.subName", "subName");
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
}

const deleteSclass = async (req, res) => {
    try {
        const deletedClass = await Sclass.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.send({ message: "Class not found" });
        }
        const deletedStudents = await Student.deleteMany({ sclassName: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ teachSclass: req.params.id });
        res.send(deletedClass);
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteSclasses = async (req, res) => {
    try {
        const deletedClasses = await Sclass.deleteMany({ school: req.params.id });
        if (deletedClasses.deletedCount === 0) {
            return res.send({ message: "No classes found to delete" });
        }
        const deletedStudents = await Student.deleteMany({ school: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ school: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ school: req.params.id });
        res.send(deletedClasses);
    } catch (error) {
        res.status(500).json(error);
    }
}

const getTimetable = async (req, res) => {
    try {
        const sclass = await Sclass.findById(req.params.id).populate('timetable.teacher', 'name');
        if (sclass) {
            res.send(sclass.timetable);
        } else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const mongoose = require('mongoose');

const updateTimetable = async (req, res) => {
    try {
        const { timetable } = req.body;
        const classId = req.params.id;

        // Filter out slots where subject is selected but no teacher assigned
        const filteredTimetable = timetable.filter(slot => {
            if (slot.subjectId && !slot.teacher) {
                // Discard this slot
                return false;
            }
            return true;
        });

        // Check for overlapping slots in the same class
        const slotSet = new Set();
        for (const slot of filteredTimetable) {
            const { day, period } = slot;
            const slotKey = `${day}-${period}`;
            if (slotSet.has(slotKey)) {
                return res.status(400).json({
                    message: "Multiple subjects cannot be assigned to the same day and period slot."
                });
            }
            slotSet.add(slotKey);
        }

        // Validate subject weekly period limits
        const subjectCount = {};
        for (const slot of filteredTimetable) {
            if (slot.subjectId) {
                subjectCount[slot.subjectId] = (subjectCount[slot.subjectId] || 0) + 1;
            }
        }

        for (const subjectId in subjectCount) {
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                return res.status(400).json({
                    message: `Subject with ID ${subjectId} not found.`
                });
            }
            if (subject.periodsPerWeek && subjectCount[subjectId] > subject.periodsPerWeek) {
                return res.status(400).json({
                    message: `You have assigned more than the allowed number of periods for ${subject.subName} this week. Please adjust the timetable before saving.`
                });
            }
        }

        // Validate teacher IDs are valid ObjectIds
        for (const slot of filteredTimetable) {
            const { teacher } = slot;
            if (!teacher) continue;

            if (!mongoose.Types.ObjectId.isValid(teacher)) {
                return res.status(400).json({
                    message: "The selected teacher is not valid. Please check and select a valid teacher from the list."
                });
            }
        }

        // Validate clashes before saving
        for (const slot of filteredTimetable) {
            const { day, period, teacher } = slot;
            if (!teacher) continue;

            // Convert teacher to string for comparison
            const teacherIdStr = teacher.toString();

            // Find clashes excluding current class
            const clashes = await Sclass.find({
                _id: { $ne: classId },
                'timetable.day': day,
                'timetable.period': period,
                'timetable.teacher': { $exists: true }
            });

            // Check if any clash has the same teacher assigned
            const hasClash = clashes.some(sclass =>
                sclass.timetable.some(slot =>
                    slot.day === day &&
                    slot.period === period &&
                    slot.teacher.toString() === teacherIdStr
                )
            );

            if (hasClash) {
                return res.status(400).json({
                    message: "Teacher is already assigned to another class during this time slot."
                });
            }
        }

        const sclass = await Sclass.findByIdAndUpdate(
            classId,
            { timetable: filteredTimetable },
            { new: true }
        ).populate('timetable.teacher', 'name');
        if (sclass) {
            res.send({ timetable: sclass.timetable });
        } else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Failed to update timetable", error: err.message });
    }
}

const getClassTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({
            $or: [
                { teachSclasses: req.params.id },
                { teachSclass: req.params.id },
                { 'teachAssignments.sclass': req.params.id }
            ]
        }).populate('teachSubject', 'subName').populate('teachAssignments.subject', 'subName');
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                const { password, ...teacherWithoutPassword } = teacher._doc;
                // Find subjects assigned to this class
                let assignedSubjects = [];
                if (teacher.teachAssignments && teacher.teachAssignments.length > 0) {
                    assignedSubjects = teacher.teachAssignments
                        .filter(assignment => assignment.sclass.toString() === req.params.id)
                        .map(assignment => assignment.subject?.subName)
                        .filter(sub => sub);
                }
                if (assignedSubjects.length === 0 && teacher.teachSubject) {
                    assignedSubjects = [teacher.teachSubject.subName];
                }
                teacherWithoutPassword.assignedSubjects = assignedSubjects;
                return teacherWithoutPassword;
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getAvailableSubjects = async (req, res) => {
    try {
        const classId = req.params.id;
        const sclass = await Sclass.findById(classId);
        if (!sclass) {
            return res.status(404).json({ message: "Class not found" });
        }
        const assignedSubjectIds = sclass.subjects.map(sub => sub.subject.toString());
        const availableSubjects = await Subject.find({
            school: sclass.school,
            _id: { $nin: assignedSubjectIds }
        }).populate('teacher', 'name');
        res.send(availableSubjects);
    } catch (err) {
        res.status(500).json(err);
    }
}

const getAvailableTeachers = async (req, res) => {
    try {
        const { classId, subjectId, day, period } = req.params;
        // Get teachers assigned to this subject in this class
        const teachers = await Teacher.find({
            'teachAssignments.subject': subjectId,
            'teachAssignments.sclass': classId
        }).populate('teachAssignments.subject').populate('teachAssignments.sclass');

        // Filter to only those assigned to this specific subject-class
        const subjectTeachers = teachers.filter(teacher =>
            teacher.teachAssignments.some(assignment =>
                assignment.subject._id.toString() === subjectId &&
                assignment.sclass._id.toString() === classId
            )
        );

        if (subjectTeachers.length === 0) {
            return res.send([]);
        }

        // Check for clashes: Find if any teacher is already scheduled at this day/period in other classes
        const clashes = await Sclass.find({
            _id: { $ne: classId },
            'timetable.day': day,
            'timetable.period': parseInt(period),
            'timetable.teacher': { $exists: true }
        }).populate('timetable.teacher', 'name');

        // Create a map of clashing teacher IDs to their conflicting class names
        const clashMap = {};
        clashes.forEach(sclass => {
            sclass.timetable
                .filter(slot => slot.day === day && slot.period === parseInt(period))
                .forEach(slot => {
                    if (slot.teacher) {
                        clashMap[slot.teacher._id.toString()] = sclass.sclassName;
                    }
                });
        });

        // Build response with availability status
        const teacherList = subjectTeachers.map(teacher => {
            const teacherId = teacher._id.toString();
            const isAvailable = !clashMap[teacherId];
            return {
                _id: teacher._id,
                name: teacher.name,
                available: isAvailable,
                conflictingClass: isAvailable ? null : clashMap[teacherId]
            };
        });

        res.send(teacherList);
    } catch (err) {
        res.status(500).json(err);
    }
}

const getTeacherClasses = async (req, res) => {
    try {
        console.log("getTeacherClasses called with teacherId:", req.params.id);
        const teacher = await Teacher.findById(req.params.id).populate('teachSclasses').populate('teachSclass');
        if (!teacher) {
            console.log("Teacher not found for id:", req.params.id);
            return res.status(404).json({ message: "Teacher not found" });
        }
        // Collect union of classes from teachSclasses and teachSclass
        const classIdSet = new Set();
        if (Array.isArray(teacher.teachSclasses)) {
            teacher.teachSclasses.forEach(c => c && c._id && classIdSet.add(c._id.toString()));
        }
        if (teacher.teachSclass && teacher.teachSclass._id) {
            classIdSet.add(teacher.teachSclass._id.toString());
        }
        let classes = [];
        if (classIdSet.size > 0) {
            classes = await Sclass.find({ _id: { $in: Array.from(classIdSet) } }).select('sclassName');
        }

        const response = classes.map(cls => {
            return {
                _id: cls._id,
                sclassName: cls.sclassName,
            };
        });

        console.log("Teacher found, classes:", response);
        res.json(response);
    } catch (err) {
        console.error("Error in getTeacherClasses:", err);
        res.status(500).json(err);
    }
};


const updateTeacherClasses = async (req, res) => {
    try {
        const { teacherId, classIds } = req.body;
        if (!teacherId || !Array.isArray(classIds)) {
            return res.status(400).json({ message: "Invalid input" });
        }
        const teacher = await require('../models/teacherSchema.js').findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        teacher.teachSclasses = classIds;
        await teacher.save();
        res.json({ message: "Teacher classes updated successfully", teachSclasses: teacher.teachSclasses });
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateSubjectSessions = async (req, res) => {
    try {
        const { subjectId, sessions } = req.body;
        const classId = req.params.id;

        const sclass = await Sclass.findById(classId);
        if (!sclass) {
            return res.status(404).json({ message: "Class not found" });
        }

        const subjectIndex = sclass.subjects.findIndex(sub => sub.subject.toString() === subjectId);
        if (subjectIndex === -1) {
            return res.status(404).json({ message: "Subject not found in class" });
        }

        sclass.subjects[subjectIndex].sessions = sessions;
        await sclass.save();

        res.json({ message: "Subject sessions updated successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { sclassCreate, sclassUpdate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, getTimetable, updateTimetable, getClassTeachers, getAvailableSubjects, getAvailableTeachers, getTeacherClasses, updateTeacherClasses, updateSubjectSessions };
