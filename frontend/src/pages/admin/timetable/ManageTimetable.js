import React, { useEffect, useMemo, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { saveTimetable, fetchTimetable } from '../../../redux/timetableRelated/timetableHandle';
import { getAllSclasses, getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { useSelector as useReduxSelector } from 'react-redux';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [
	{ key: "7_50_8_30", label: "7:50 - 8:30" },
	{ key: "8_30_9_10", label: "8:30 - 9:10" },
	{ key: "9_10_9_50", label: "9:10 - 9:50" },
	{ key: "9_50_10_30", label: "9:50 - 10:30" },
	{ key: "10_30_10_50", label: "10:30 - 10:50" },
	{ key: "10_50_11_30", label: "10:50 - 11:30" },
	{ key: "11_30_12_10", label: "11:30 - 12:10" },
	{ key: "12_10_12_50", label: "12:10 - 12:50" },
	{ key: "12_50_1_30", label: "12:50 - 1:30" },
];

export default function ManageTimetable() {
	const dispatch = useDispatch();
	const { currentUser } = useSelector((s) => s.user);
    const { sclassesList, subjectsList } = useSelector((s) => s.sclass);
    const { teachersList } = useSelector((s) => s.teacher);
	const { timetable, loading, response } = useSelector((s) => s.timetable);

	const [selectedClassId, setSelectedClassId] = useState("");
	const [grid, setGrid] = useState({});
const [successOpen, setSuccessOpen] = useState(false);

	useEffect(() => {
		if (currentUser?._id) {
			dispatch(getAllSclasses(currentUser._id, 'Sclass'));
		}
	}, [currentUser, dispatch]);

	useEffect(() => {
		if (!selectedClassId) return;
		dispatch(fetchTimetable(selectedClassId));
		dispatch(getSubjectList(selectedClassId, 'ClassSubjects'));
		// load teachers for this school, then filter by selected class if needed
		dispatch(getAllTeachers(currentUser._id));
	}, [selectedClassId, dispatch]);

	useEffect(() => {
		if (timetable?.grid) setGrid(timetable.grid);
		else setGrid({});
	}, [timetable]);

	const subjectsById = useMemo(() => {
		const m = new Map();
		subjectsList.forEach(s => m.set(s._id, s));
		return m;
	}, [subjectsList]);

	const updateCell = (day, period, field, value) => {
		setGrid(prev => ({
			...prev,
			[day]: {
				...(prev?.[day] || {}),
				[period]: { ...(prev?.[day]?.[period] || {}), [field]: value || undefined }
			}
		}));
	};

	const save = async () => {
		if (!selectedClassId) return;
		await dispatch(saveTimetable({ sclassName: selectedClassId, school: currentUser._id, grid }));
		setSuccessOpen(true);
	};

	return (
		<div style={{ padding: 16 }}>
			<h2>Manage Timetable</h2>
			<div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
				<label>Class</label>
				<select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
					<option value="">Select class</option>
					{sclassesList.map(c => <option key={c._id} value={c._id}>{c.sclassName}</option>)}
				</select>
				<button onClick={save} disabled={!selectedClassId || loading}>Save</button>
				{response && <span style={{ color: 'red' }}>{response}</span>}
			</div>

			<table border="1" cellPadding="6" cellSpacing="0" width="100%">
				<thead>
					<tr>
						<th>Time</th>
						{DAYS.map(d => <th key={d}>{d}</th>)}
					</tr>
				</thead>
				<tbody>
					{PERIODS.map(p => {
						if (p.key === '10_30_10_50') {
							return (
								<tr key={p.key}>
									<td><b>{p.label}</b></td>
									<td colSpan={DAYS.length} style={{ textAlign: 'center' }}><b>Interval</b></td>
								</tr>
							);
						}
						return (
							<tr key={p.key}>
								<td><b>{p.label}</b></td>
								{DAYS.map(d => (
									<td key={`${d}-${p.key}`}>
										<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
											<select
												value={(grid?.[d]?.[p.key]?.subject?._id) || (grid?.[d]?.[p.key]?.subject) || ''}
												onChange={(e) => updateCell(d, p.key, 'subject', e.target.value)}
											>
												<option value="">Select subject</option>
												{subjectsList.map(s => <option key={s._id} value={s._id}>{s.subName}</option>)}
											</select>
											<select
												value={(grid?.[d]?.[p.key]?.teacher?._id) || (grid?.[d]?.[p.key]?.teacher) || ''}
												onChange={(e) => updateCell(d, p.key, 'teacher', e.target.value)}
											>
												<option value="">Select teacher</option>
												{teachersList
													.filter(t => !t.teachSclass || (typeof t.teachSclass === 'string' ? t.teachSclass === selectedClassId : t.teachSclass?._id === selectedClassId))
													.map(t => (
														<option key={t._id} value={t._id}>{t.name}</option>
													))}
											</select>
										</div>
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>

			<Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
				<Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
					Timetable updated successfully
				</Alert>
			</Snackbar>
		</div>
	);
}


