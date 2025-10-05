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

    // Group attendance by unique dates
    const attendanceByDate = {};

    subjectAttendance.forEach((attendance) => {
        const dateKey = new Date(attendance.date).toDateString();

        if (!attendanceByDate[dateKey]) {
            attendanceByDate[dateKey] = {
                statuses: [],
                hasPresent: false,
                hasAbsent: false
            };
        }

        attendanceByDate[dateKey].statuses.push(attendance.status);

        if (attendance.status === "Present") {
            attendanceByDate[dateKey].hasPresent = true;
        } else if (attendance.status === "Absent") {
            attendanceByDate[dateKey].hasAbsent = true;
        }
    });

    // Count days where student was present (at least one present record for that day)
    let presentDays = 0;
    const totalDays = Object.keys(attendanceByDate).length;

    Object.values(attendanceByDate).forEach((dayData) => {
        if (dayData.hasPresent) {
            presentDays++;
        }
    });

    if (totalDays === 0) {
        return 0;
    }

    return (presentDays / totalDays) * 100;
};