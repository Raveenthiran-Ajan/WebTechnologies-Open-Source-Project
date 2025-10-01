export const calculateSubjectAttendancePercentage = (presentCount, totalSessions) => {
    if (totalSessions === 0 || presentCount === 0) {
        return 0;
    }
    const percentage = (presentCount / totalSessions) * 100;
    return percentage.toFixed(2); // Limit to two decimal places
};


export const groupAttendanceBySubject = (subjectAttendance) => {
    if (!subjectAttendance || subjectAttendance.length === 0) {
        return {};
    }

    const attendanceBySubject = {};

    subjectAttendance.forEach((attendance) => {
        // Handle null or undefined subName (for simple daily attendance)
        let subName, sessions, subId;
        
        if (!attendance.subName || !attendance.subName._id) {
            // For simple daily attendance without subject info
            subName = "Daily Attendance";
            sessions = 1;
            subId = "daily_attendance";
        } else {
            subName = attendance.subName.subName || "Unknown Subject";
            sessions = attendance.subName.sessions || 1;
            subId = attendance.subName._id;
        }

        if (!attendanceBySubject[subName]) {
            attendanceBySubject[subName] = {
                present: 0,
                absent: 0,
                sessions: sessions,
                allData: [],
                subId: subId
            };
        }
        
        if (attendance.status === "Present") {
            attendanceBySubject[subName].present++;
        } else if (attendance.status === "Absent") {
            attendanceBySubject[subName].absent++;
        }
        
        attendanceBySubject[subName].allData.push({
            date: attendance.date,
            status: attendance.status,
        });
    });
    return attendanceBySubject;
}

export const calculateOverallAttendancePercentage = (subjectAttendance) => {
    if (!subjectAttendance || subjectAttendance.length === 0) {
        return 0;
    }

    let totalSessionsSum = 0;
    let presentCountSum = 0;
    const uniqueSubIds = [];

    subjectAttendance.forEach((attendance) => {
        // Handle null or undefined subName (for simple daily attendance)
        if (!attendance.subName || !attendance.subName._id) {
            // For simple daily attendance without subject info, count as 1 session per day
            presentCountSum += attendance.status === "Present" ? 1 : 0;
            totalSessionsSum += 1; // Each attendance record counts as 1 session
            return;
        }

        const subId = attendance.subName._id;
        if (!uniqueSubIds.includes(subId)) {
            const sessions = parseInt(attendance.subName.sessions) || 1;
            totalSessionsSum += sessions;
            uniqueSubIds.push(subId);
        }
        presentCountSum += attendance.status === "Present" ? 1 : 0;
    });

    if (totalSessionsSum === 0) {
        return 0;
    }

    return (presentCountSum / totalSessionsSum) * 100;
};