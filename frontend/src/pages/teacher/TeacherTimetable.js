import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimetable } from '../../redux/timetableRelated/timetableHandle';

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

export default function TeacherTimetable() {
	const dispatch = useDispatch();
	const { currentUser } = useSelector((s) => s.user);
	const { timetable, loading } = useSelector((s) => s.timetable);
    const className = typeof currentUser?.teachSclass === 'object' ? currentUser?.teachSclass?.sclassName : '';

	useEffect(() => {
		if (currentUser?.teachSclass) {
			const classId = typeof currentUser.teachSclass === 'string' ? currentUser.teachSclass : currentUser.teachSclass._id;
			if (classId) dispatch(fetchTimetable(classId));
		}
	}, [currentUser, dispatch]);

	return (
		<div style={{ padding: 16 }}>
			<h2>My Timetable</h2>
			{loading && <div>Loading...</div>}
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
										{(() => {
											const cell = timetable?.grid?.[d]?.[p.key];
											const teacherId = typeof cell?.teacher === 'object' ? cell?.teacher?._id : cell?.teacher;
											const myId = currentUser?._id;
											if (cell && teacherId && myId && teacherId === myId && cell.subject?.subName) {
												return `${cell.subject.subName} - ${className || ''}`;
											}
											return '';
										})()}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}


