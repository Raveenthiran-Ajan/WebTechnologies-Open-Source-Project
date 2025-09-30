import { useEffect } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography } from '@mui/material';
import { BlackButton, BlueButton, PurpleButton } from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";


const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { classId } = useParams();

    const { currentUser } = useSelector((state) => state.user);
    // Use classId from params if available, otherwise fallback to current user's class
    const classID = classId || currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id
    
    // Check if this class is the attendance-assigned class
    const attendanceClass = currentUser?.attendanceClass || currentUser?.teachSclass;
    const canTakeAttendance = attendanceClass && (attendanceClass._id === classID || attendanceClass._id === classId);

    useEffect(() => {
        dispatch(getClassStudents(classID));
    }, [dispatch, classID])

    if (error) {
        console.log(error)
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    const studentRows = sclassStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        return (
            <>
                <BlueButton
                    variant="contained"
                    onClick={() =>
                        navigate("/teacher/class/attendance/" + classID)
                    }
                >
                    View
                </BlueButton>
            </>
        );
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Typography variant="h4" align="center" gutterBottom>
                        Class Details
                    </Typography>
                    {getresponse ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                No Students Found
                            </Box>
                        </>
                    ) : (
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2 }}>
                                <Typography variant="h5">
                                    Students List:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    {canTakeAttendance ? (
                                        <PurpleButton
                                            variant="contained"
                                            onClick={() => navigate(`/teacher/class/${classID}/attendance`)}
                                        >
                                            Mark Class Attendance
                                        </PurpleButton>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            (Teaching Only - No Attendance Access)
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {Array.isArray(sclassStudents) && sclassStudents.length > 0 &&
                                <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                            }
                        </Paper>
                    )}
                </>
            )}
        </>
    );
};

export default TeacherClassDetails;