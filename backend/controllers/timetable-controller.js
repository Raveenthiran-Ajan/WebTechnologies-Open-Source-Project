const Timetable = require('../models/timetableSchema.js');
const Subject = require('../models/subjectSchema.js');

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIOD_KEYS = [
    "7_50_8_30",
    "8_30_9_10",
	"9_10_9_50",
	"9_50_10_30",
	"10_30_10_50", 
	"10_50_11_30",
	"11_30_12_10",
	"12_10_12_50",
	"12_50_1_30",
];

function ensureGridShape(grid) {
	const shaped = {};
	for (const d of DAYS) {
		shaped[d] = shaped[d] || {};
		for (const p of PERIOD_KEYS) {
			shaped[d][p] = (grid && grid[d] && grid[d][p]) ? grid[d][p] : {};
		}
	}
	return shaped;
}

async function hasConflicts(schoolId, sclassId, grid) {
	// Conflicts:
	// 1) Same teacher assigned to two subjects at the same day/period in different classes (school-wide)
	// 2) Same subject assigned in two classes at the same day/period (optional) – skipped here
	// 3) Teacher must match subject.teacher if set
	const teacherSlots = new Map(); // key: day|period|teacherId => classId

	for (const day of DAYS) {
		for (const pk of PERIOD_KEYS) {
			const cell = grid[day][pk];
			if (!cell || !cell.teacher || !cell.subject) continue;

			const subject = await Subject.findById(cell.subject);
			if (subject && subject.teacher && cell.teacher.toString() !== subject.teacher.toString()) {
				return { ok: false, message: `Teacher must be the one assigned to subject at ${day} ${pk}` };
			}

			const key = `${day}|${pk}|${cell.teacher.toString()}`;
			if (teacherSlots.has(key)) {
				return { ok: false, message: `Teacher has another class at ${day} ${pk}` };
			}
			teacherSlots.set(key, sclassId.toString());
		}
	}
	return { ok: true };
}

const upsertTimetable = async (req, res) => {
	try {
		const { sclassName, school, year, grid } = req.body;
		if (!sclassName || !school) return res.status(400).json({ message: 'sclassName and school are required' });
		const shaped = ensureGridShape(grid || {});
		const conflict = await hasConflicts(school, sclassName, shaped);
		if (!conflict.ok) return res.send({ message: conflict.message });
		const filter = { sclassName, school, year: year || new Date().getFullYear() };
		const update = { $set: { grid: shaped } };
		const options = { new: true, upsert: true };
		const doc = await Timetable.findOneAndUpdate(filter, update, options)
			.populate({ path: 'grid.Monday.7_50_8_30.subject grid.Monday.8_30_9_10.subject grid.Monday.9_10_9_50.subject grid.Monday.9_50_10_30.subject grid.Monday.10_30_10_50.subject grid.Monday.10_50_11_30.subject grid.Monday.11_30_12_10.subject grid.Monday.12_10_12_50.subject grid.Monday.12_50_1_30.subject' })
			.populate({ path: 'grid.Tuesday.7_50_8_30.subject grid.Tuesday.8_30_9_10.subject grid.Tuesday.9_10_9_50.subject grid.Tuesday.9_50_10_30.subject grid.Tuesday.10_30_10_50.subject grid.Tuesday.10_50_11_30.subject grid.Tuesday.11_30_12_10.subject grid.Tuesday.12_10_12_50.subject grid.Tuesday.12_50_1_30.subject' })
			.populate({ path: 'grid.Wednesday.7_50_8_30.subject grid.Wednesday.8_30_9_10.subject grid.Wednesday.9_10_9_50.subject grid.Wednesday.9_50_10_30.subject grid.Wednesday.10_30_10_50.subject grid.Wednesday.10_50_11_30.subject grid.Wednesday.11_30_12_10.subject grid.Wednesday.12_10_12_50.subject grid.Wednesday.12_50_1_30.subject' })
			.populate({ path: 'grid.Thursday.7_50_8_30.subject grid.Thursday.8_30_9_10.subject grid.Thursday.9_10_9_50.subject grid.Thursday.9_50_10_30.subject grid.Thursday.10_30_10_50.subject grid.Thursday.10_50_11_30.subject grid.Thursday.11_30_12_10.subject grid.Thursday.12_10_12_50.subject grid.Thursday.12_50_1_30.subject' })
			.populate({ path: 'grid.Friday.7_50_8_30.subject grid.Friday.8_30_9_10.subject grid.Friday.9_10_9_50.subject grid.Friday.9_50_10_30.subject grid.Friday.10_30_10_50.subject grid.Friday.10_50_11_30.subject grid.Friday.11_30_12_10.subject grid.Friday.12_10_12_50.subject grid.Friday.12_50_1_30.subject' })
			.populate({ path: 'grid.Monday.7_50_8_30.teacher grid.Monday.8_30_9_10.teacher grid.Monday.9_10_9_50.teacher grid.Monday.9_50_10_30.teacher grid.Monday.10_30_10_50.teacher grid.Monday.10_50_11_30.teacher grid.Monday.11_30_12_10.teacher grid.Monday.12_10_12_50.teacher grid.Monday.12_50_1_30.teacher', select: 'name email' })
			.populate({ path: 'grid.Tuesday.7_50_8_30.teacher grid.Tuesday.8_30_9_10.teacher grid.Tuesday.9_10_9_50.teacher grid.Tuesday.9_50_10_30.teacher grid.Tuesday.10_30_10_50.teacher grid.Tuesday.10_50_11_30.teacher grid.Tuesday.11_30_12_10.teacher grid.Tuesday.12_10_12_50.teacher grid.Tuesday.12_50_1_30.teacher', select: 'name email' })
			.populate({ path: 'grid.Wednesday.7_50_8_30.teacher grid.Wednesday.8_30_9_10.teacher grid.Wednesday.9_10_9_50.teacher grid.Wednesday.9_50_10_30.teacher grid.Wednesday.10_30_10_50.teacher grid.Wednesday.10_50_11_30.teacher grid.Wednesday.11_30_12_10.teacher grid.Wednesday.12_10_12_50.teacher grid.Wednesday.12_50_1_30.teacher', select: 'name email' })
			.populate({ path: 'grid.Thursday.7_50_8_30.teacher grid.Thursday.8_30_9_10.teacher grid.Thursday.9_10_9_50.teacher grid.Thursday.9_50_10_30.teacher grid.Thursday.10_30_10_50.teacher grid.Thursday.10_50_11_30.teacher grid.Thursday.11_30_12_10.teacher grid.Thursday.12_10_12_50.teacher grid.Thursday.12_50_1_30.teacher', select: 'name email' })
			.populate({ path: 'grid.Friday.7_50_8_30.teacher grid.Friday.8_30_9_10.teacher grid.Friday.9_10_9_50.teacher grid.Friday.9_50_10_30.teacher grid.Friday.10_30_10_50.teacher grid.Friday.10_50_11_30.teacher grid.Friday.11_30_12_10.teacher grid.Friday.12_10_12_50.teacher grid.Friday.12_50_1_30.teacher', select: 'name email' });
		res.send(doc);
	} catch (err) {
		res.status(500).json(err);
	}
};

const getTimetableByClass = async (req, res) => {
	try {
		const { classId } = req.params;
		const tt = await Timetable.findOne({ sclassName: classId })
			.populate('grid.Monday.7_50_8_30.subject grid.Monday.8_30_9_10.subject grid.Monday.9_10_9_50.subject grid.Monday.9_50_10_30.subject grid.Monday.10_30_10_50.subject grid.Monday.10_50_11_30.subject grid.Monday.11_30_12_10.subject grid.Monday.12_10_12_50.subject grid.Monday.12_50_1_30.subject')
			.populate('grid.Tuesday.7_50_8_30.subject grid.Tuesday.8_30_9_10.subject grid.Tuesday.9_10_9_50.subject grid.Tuesday.9_50_10_30.subject grid.Tuesday.10_30_10_50.subject grid.Tuesday.10_50_11_30.subject grid.Tuesday.11_30_12_10.subject grid.Tuesday.12_10_12_50.subject grid.Tuesday.12_50_1_30.subject')
			.populate('grid.Wednesday.7_50_8_30.subject grid.Wednesday.8_30_9_10.subject grid.Wednesday.9_10_9_50.subject grid.Wednesday.9_50_10_30.subject grid.Wednesday.10_30_10_50.subject grid.Wednesday.10_50_11_30.subject grid.Wednesday.11_30_12_10.subject grid.Wednesday.12_10_12_50.subject grid.Wednesday.12_50_1_30.subject')
			.populate('grid.Thursday.7_50_8_30.subject grid.Thursday.8_30_9_10.subject grid.Thursday.9_10_9_50.subject grid.Thursday.9_50_10_30.subject grid.Thursday.10_30_10_50.subject grid.Thursday.10_50_11_30.subject grid.Thursday.11_30_12_10.subject grid.Thursday.12_10_12_50.subject grid.Thursday.12_50_1_30.subject')
			.populate('grid.Friday.7_50_8_30.subject grid.Friday.8_30_9_10.subject grid.Friday.9_10_9_50.subject grid.Friday.9_50_10_30.subject grid.Friday.10_30_10_50.subject grid.Friday.10_50_11_30.subject grid.Friday.11_30_12_10.subject grid.Friday.12_10_12_50.subject grid.Friday.12_50_1_30.subject')
			.populate({ path: 'grid.Monday.7_50_8_30.teacher grid.Monday.8_30_9_10.teacher grid.Monday.9_10_9_50.teacher grid.Monday.9_50_10_30.teacher grid.Monday.10_30_10_50.teacher grid.Monday.10_50_11_30.teacher grid.Monday.11_30_12_10.teacher grid.Monday.12_10_12_50.teacher grid.Monday.12_50_1_30.teacher', select: 'name email' })
			.populate({ path: 'grid.Tuesday.7_50_8_30.teacher grid.Tuesday.8_30_9_10.teacher grid.Tuesday.9_10_9_50.teacher grid.Tuesday.9_50_10_30.teacher grid.Tuesday.10_30_10_50.teacher grid.Tuesday.10_50_11_30.teacher grid.Tuesday.11_30_12_10.teacher grid.Tuesday.12_10_12_50.teacher grid.Tuesday.12_50_1_30.teacher', select: 'name email' })
			.populate({ path: 'grid.Wednesday.7_50_8_30.teacher grid.Wednesday.8_30_9_10.teacher grid.Wednesday.9_10_9_50.teacher grid.Wednesday.9_50_10_30.teacher grid.Wednesday.10_30_10_50.teacher grid.Wednesday.10_50_11_30.teacher grid.Wednesday.11_30_12_10.teacher grid.Wednesday.12_10_12_50.teacher grid.Wednesday.12_50_1_30.teacher', select: 'name email' })
			.populate({ path: 'grid.Thursday.7_50_8_30.teacher grid.Thursday.8_30_9_10.teacher grid.Thursday.9_10_9_50.teacher grid.Thursday.9_50_10_30.teacher grid.Thursday.10_30_10_50.teacher grid.Thursday.10_50_11_30.teacher grid.Thursday.11_30_12_10.teacher grid.Thursday.12_10_12_50.teacher grid.Thursday.12_50_1_30.teacher', select: 'name email' })
			.populate({ path: 'grid.Friday.7_50_8_30.teacher grid.Friday.8_30_9_10.teacher grid.Friday.9_10_9_50.teacher grid.Friday.9_50_10_30.teacher grid.Friday.10_30_10_50.teacher grid.Friday.10_50_11_30.teacher grid.Friday.11_30_12_10.teacher grid.Friday.12_10_12_50.teacher grid.Friday.12_50_1_30.teacher', select: 'name email' });
		if (!tt) return res.send({ message: 'No timetable found' });
		res.send(tt);
	} catch (err) {
		res.status(500).json(err);
	}
};

const deleteTimetableByClass = async (req, res) => {
	try {
		const { classId } = req.params;
		const del = await Timetable.findOneAndDelete({ sclassName: classId });
		if (!del) return res.send({ message: 'No timetable found to delete' });
		res.send(del);
	} catch (err) {
		res.status(500).json(err);
	}
};

module.exports = { upsertTimetable, getTimetableByClass, deleteTimetableByClass, DAYS, PERIOD_KEYS };





