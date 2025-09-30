import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import {
    Paper, Table, TableBody, TableContainer,
    TableHead, TablePagination, Button, Box, IconButton, Chip, Typography,
} from '@mui/material';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowTeachers = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (loading) {
        return <div>Loading...</div>;
    } else if (response) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <GreenButton variant="contained" onClick={() => navigate("/Admin/teachers/chooseclass")}>
                    Add Teacher
                </GreenButton>
            </Box>
        );
    } else if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID, address) => {
        // console.log(deleteID);
        // console.log(address);
        setMessage("Successfully deleted.");
        // setShowPopup(true)

        dispatch(deleteUser(deleteID, address)).then(() => {
            dispatch(getAllTeachers(currentUser._id));
        });
    };



    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'teachSubjects', label: 'Teaching Subjects', minWidth: 200 },
        { id: 'teachSclasses', label: 'Teaching Classes', minWidth: 200 },
        { id: 'attendanceClass', label: 'Attendance Class', minWidth: 150 },
    ];

    const rows = teachersList.map((teacher) => {
        // Simple direct approach - show all assignments
        let teachingSubjects = [];
        let teachingClasses = [];
        
        // Collect subjects from both old and new structure
        if (teacher.teachSubjects && teacher.teachSubjects.length > 0) {
            teachingSubjects = teacher.teachSubjects;
        } else if (teacher.teachSubject) {
            teachingSubjects = [teacher.teachSubject];
        }
        
        // Collect classes from both old and new structure  
        if (teacher.teachSclasses && teacher.teachSclasses.length > 0) {
            teachingClasses = teacher.teachSclasses;
        } else if (teacher.teachSclass) {
            teachingClasses = [teacher.teachSclass];
        }
        
        // Fix attendance class assignment
        let attendanceClass = teacher.attendanceClass || teacher.teachSclass;
        
        // If no attendance class but has teaching classes, use first teaching class
        if (!attendanceClass && teachingClasses.length > 0) {
            attendanceClass = teachingClasses[0];
        }
        
        console.log(`Teacher ${teacher.name} attendance class:`, attendanceClass);
        
        return {
            name: teacher.name,
            teachSubjects: teachingSubjects,
            teachSclasses: teachingClasses,
            attendanceClass: attendanceClass,
            // Backward compatibility
            teachSubject: teacher.teachSubject?.subName || null,
            teachSclass: teacher.teachSclass ? teacher.teachSclass.sclassName : 'No Class',
            teachSclassID: teacher.teachSclass ? teacher.teachSclass._id : null,
            id: teacher._id,
        };
    });

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Teacher (Multiple)',
            action: () => navigate("/Admin/teachers/add-multiple")
        },
        {
            icon: <PersonAddAlt1Icon color="secondary" />, name: 'Add New Teacher (Single)',
            action: () => navigate("/Admin/teachers/chooseclass")
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Teachers',
            action: () => deleteHandler(currentUser._id, "Teachers")
        },
    ];

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <StyledTableRow>
                            {columns.map((column) => (
                                <StyledTableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                            <StyledTableCell align="center">
                                Actions
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            
                                            if (column.id === 'teachSubjects') {
                                                return (
                                                    <StyledTableCell key={column.id} align={column.align}>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                                                            {value && value.length > 0 ? (
                                                                value.map((subject, index) => (
                                                                    <Chip 
                                                                        key={subject._id || index} 
                                                                        label={subject.subName} 
                                                                        size="small" 
                                                                        color="secondary" 
                                                                        variant="outlined" 
                                                                    />
                                                                ))
                                                            ) : row.teachSubject ? (
                                                                <Chip 
                                                                    label={row.teachSubject} 
                                                                    size="small" 
                                                                    color="secondary" 
                                                                    variant="outlined" 
                                                                />
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    No subjects
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </StyledTableCell>
                                                );
                                            } else if (column.id === 'teachSclasses') {
                                                return (
                                                    <StyledTableCell key={column.id} align={column.align}>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                                                            {value && value.length > 0 ? (
                                                                value.map((sclass, index) => (
                                                                    <Chip 
                                                                        key={sclass._id || index} 
                                                                        label={sclass.sclassName} 
                                                                        size="small" 
                                                                        color="primary" 
                                                                        variant="outlined" 
                                                                    />
                                                                ))
                                                            ) : row.teachSclass !== 'No Class' ? (
                                                                <Chip 
                                                                    label={row.teachSclass} 
                                                                    size="small" 
                                                                    color="primary" 
                                                                    variant="outlined" 
                                                                />
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    No classes
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </StyledTableCell>
                                                );
                                            } else if (column.id === 'attendanceClass') {
                                                return (
                                                    <StyledTableCell key={column.id} align={column.align}>
                                                        {value ? (
                                                            <Chip 
                                                                label={value.sclassName} 
                                                                size="small" 
                                                                color="success" 
                                                                variant="filled" 
                                                            />
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Not assigned
                                                            </Typography>
                                                        )}
                                                    </StyledTableCell>
                                                );
                                            } else {
                                                return (
                                                    <StyledTableCell key={column.id} align={column.align}>
                                                        {column.format && typeof value === 'number' ? column.format(value) : value}
                                                    </StyledTableCell>
                                                );
                                            }
                                        })}
                                        <StyledTableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <BlueButton variant="contained"
                                                    onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}>
                                                    View
                                                </BlueButton>
                                                <IconButton onClick={() => deleteHandler(row.id, "Teacher")}>
                                                    <PersonRemoveIcon color="error" />
                                                </IconButton>
                                            </Box>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 5));
                    setPage(0);
                }}
            />

            <SpeedDialTemplate actions={actions} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper >
    );
};

export default ShowTeachers