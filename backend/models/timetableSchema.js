const mongoose = require("mongoose");

const PERIODS = [
	{ key: "7_50_8_30", start: "07:50", end: "08:30" },
	{ key: "8_30_9_10", start: "08:30", end: "09:10" },
	{ key: "9_10_9_50", start: "09:10", end: "09:50" },
	{ key: "9_50_10_30", start: "09:50", end: "10:30" },
	{ key: "10_30_10_50", start: "10:30", end: "10:50" },
	{ key: "10_50_11_30", start: "10:50", end: "11:30" },
	{ key: "11_30_12_10", start: "11:30", end: "12:10" },
	{ key: "12_10_12_50", start: "12:10", end: "12:50" },
	{ key: "12_50_1_30", start: "12:50", end: "13:30" },
];

const cellSchema = new mongoose.Schema({
	subject: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
	teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher' },
}, { _id: false });

const timetableSchema = new mongoose.Schema({
	sclassName: { type: mongoose.Schema.Types.ObjectId, ref: 'sclass', required: true },
	school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
	year: { type: Number, default: new Date().getFullYear() },
	grid: {
		Monday: {
			'7_50_8_30': cellSchema, '8_30_9_10': cellSchema, '9_10_9_50': cellSchema, '9_50_10_30': cellSchema, '10_30_10_50': cellSchema, '10_50_11_30': cellSchema, '11_30_12_10': cellSchema, '12_10_12_50': cellSchema, '12_50_1_30': cellSchema
		},
		Tuesday: {
			'7_50_8_30': cellSchema, '8_30_9_10': cellSchema, '9_10_9_50': cellSchema, '9_50_10_30': cellSchema, '10_30_10_50': cellSchema, '10_50_11_30': cellSchema, '11_30_12_10': cellSchema, '12_10_12_50': cellSchema, '12_50_1_30': cellSchema
		},
		Wednesday: {
			'7_50_8_30': cellSchema, '8_30_9_10': cellSchema, '9_10_9_50': cellSchema, '9_50_10_30': cellSchema, '10_30_10_50': cellSchema, '10_50_11_30': cellSchema, '11_30_12_10': cellSchema, '12_10_12_50': cellSchema, '12_50_1_30': cellSchema
		},
		Thursday: {
			'7_50_8_30': cellSchema, '8_30_9_10': cellSchema, '9_10_9_50': cellSchema, '9_50_10_30': cellSchema, '10_30_10_50': cellSchema, '10_50_11_30': cellSchema, '11_30_12_10': cellSchema, '12_10_12_50': cellSchema, '12_50_1_30': cellSchema
		},
		Friday: {
			'7_50_8_30': cellSchema, '8_30_9_10': cellSchema, '9_10_9_50': cellSchema, '9_50_10_30': cellSchema, '10_30_10_50': cellSchema, '10_50_11_30': cellSchema, '11_30_12_10': cellSchema, '12_10_12_50': cellSchema, '12_50_1_30': cellSchema
		},
	},
}, { timestamps: true });

timetableSchema.statics.PERIODS = PERIODS;

module.exports = mongoose.model("timetable", timetableSchema);





