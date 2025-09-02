import React, { useState, useEffect } from "react";
import axios from "axios";
import AssignmentSubmission from "../components/AssignmentSubmission";

function AssignmentsPage() {
  const [studentId, setStudentId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [fetchError, setFetchError] = useState("");

  const fetchAssignments = async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`/assignments/student/${studentId}`);
      setAssignments(res.data.assignments || []);
      setFetchError("");
    } catch (err) {
      setFetchError("Could not fetch assignments.");
      setAssignments([]);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchAssignments();
    }
    // eslint-disable-next-line
  }, [studentId]);

  return (
    <div>
      <h1>Assignments</h1>
      <div>
        <label>Enter Student ID to view assignments: </label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Student ID"
        />
        <button onClick={fetchAssignments}>Fetch Assignments</button>
      </div>
      {fetchError && <p style={{ color: "red" }}>{fetchError}</p>}
      <ul>
        {assignments.map((assignment) => (
          <li key={assignment._id}>
            <strong>{assignment.title}</strong>
            {assignment.fileUrl && (
              <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                &nbsp;[Download]
              </a>
            )}
          </li>
        ))}
      </ul>
      <hr />
      <AssignmentSubmission />
    </div>
  );
}

export default AssignmentsPage;