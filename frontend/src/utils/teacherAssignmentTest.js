// Utility function to test teacher multi-assignment
import { assignMultipleSubjects } from '../redux/teacherRelated/teacherHandle';

export const testTeacherAssignment = async (dispatch, teacherId, subjectIds) => {
    try {
        console.log('Testing teacher assignment...');
        console.log('Teacher ID:', teacherId);
        console.log('Subject IDs:', subjectIds);
        
        const result = await dispatch(assignMultipleSubjects(teacherId, subjectIds));
        console.log('Assignment result:', result);
        
        return {
            success: true,
            message: 'Teacher assigned successfully!',
            data: result
        };
    } catch (error) {
        console.error('Assignment error:', error);
        return {
            success: false,
            message: 'Failed to assign teacher',
            error: error
        };
    }
};

export const logTeacherData = (teacher) => {
    console.log('=== TEACHER DATA DEBUG ===');
    console.log('Teacher Name:', teacher.name);
    console.log('Teacher ID:', teacher._id || teacher.id);
    console.log('teachSubjects (new):', teacher.teachSubjects);
    console.log('teachSclasses (new):', teacher.teachSclasses);
    console.log('attendanceClass (new):', teacher.attendanceClass);
    console.log('teachSubject (old):', teacher.teachSubject);
    console.log('teachSclass (old):', teacher.teachSclass);
    console.log('Raw teacher object:', teacher);
    console.log('=========================');
};