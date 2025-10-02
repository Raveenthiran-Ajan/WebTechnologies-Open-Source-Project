import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveRequestPage = ({ user, role }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [form, setForm] = useState({ reason: '', fromDate: '', toDate: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user && role) fetchLeaveRequests();
    // eslint-disable-next-line
  }, [user, role]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/leave/user?userId=${user._id}&role=${role}`);
      setLeaveRequests(res.data);
    } catch (err) {
      setMessage('Failed to fetch leave requests');
    }
    setLoading(false);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post('/leave', {
        studentId: role === 'student' ? user._id : undefined,
        parentId: role === 'parent' ? user._id : undefined,
        ...form
      });
      setMessage('Leave request submitted');
      setForm({ reason: '', fromDate: '', toDate: '' });
      fetchLeaveRequests();
    } catch (err) {
      setMessage('Failed to submit leave request');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Leave/Absence Requests</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div>
          <label>Reason:</label>
          <input name="reason" value={form.reason} onChange={handleChange} required style={{ width: '100%' }} />
        </div>
        <div>
          <label>From Date:</label>
          <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} required />
        </div>
        <div>
          <label>To Date:</label>
          <input type="date" name="toDate" value={form.toDate} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading}>Submit</button>
      </form>
      {message && <div>{message}</div>}
      <h3>Your Leave Requests</h3>
      {loading ? <div>Loading...</div> : (
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Reason</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Reviewed By</th>
              <th>Rejection Reason</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map(lr => (
              <tr key={lr._id}>
                <td>{lr.reason}</td>
                <td>{new Date(lr.fromDate).toLocaleDateString()}</td>
                <td>{new Date(lr.toDate).toLocaleDateString()}</td>
                <td>{lr.status}</td>
                <td>{lr.reviewedBy ? lr.reviewedBy.name || lr.reviewedBy : '-'}</td>
                <td>{lr.rejectionReason || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveRequestPage;
