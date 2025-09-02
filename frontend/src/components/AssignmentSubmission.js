import React, { useState } from "react";
import axios from "axios";

function AssignmentSubmission() {
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !title || !file) {
      setMessage("Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("title", title);
    formData.append("file", file);

    try {
      const res = await axios.post("/assignments/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message || "Assignment submitted successfully!");
    } catch (err) {
      setMessage("Submission failed.");
    }
  };

  return (
    <div>
      <h2>Submit Assignment</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Student ID:</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Assignment Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>File:</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AssignmentSubmission;