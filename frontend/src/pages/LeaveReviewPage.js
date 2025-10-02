import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaveReviewPage = ({ reviewer, role }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAllLeaveRequests();
    // eslint-disable-next-line
  }, []);

  const fetchAllLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/leave');
      setLeaveRequests(res.data);
    } catch (err) {
      setMessage('Failed to fetch leave requests');
    }
    setLoading(false);
  };

  const handleReview = async (requestId, status) => {
    const rejectionReason = status === 'Rejected' ? prompt('Enter rejection reason:') : undefined;
    setLoading(true);
    setMessage('');
    try {
      await axios.patch(`/leave/${requestId}/review`, {
        status,
        reviewedBy: reviewer._id,
        rejectionReason
      });
      setMessage(`Leave request ${status.toLowerCase()}`);
      fetchAllLeaveRequests();
    } catch (err) {
      setMessage('Failed to update leave request');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <h2>Review Leave/Absence Requests</h2>
      {message && <div>{message}</div>}
      {loading ? <div>Loading...</div> : (
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Student</th>
              <th>Parent</th>
              <th>Reason</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Rejection Reason</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map(lr => (
              <tr key={lr._id}>
                <td>{lr.student?.name || lr.student}</td>
                <td>{lr.parent?.name || lr.parent || '-'}</td>
                <td>{lr.reason}</td>
                <td>{new Date(lr.fromDate).toLocaleDateString()}</td>
                <td>{new Date(lr.toDate).toLocaleDateString()}</td>
                <td>{lr.status}</td>
                <td>
                  {lr.status === 'Pending' && (
                    <>
                      <button onClick={() => handleReview(lr._id, 'Approved')}>Approve</button>
                      <button onClick={() => handleReview(lr._id, 'Rejected')}>Reject</button>
                    </>
                  )}
                </td>
                <td>{lr.rejectionReason || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveReviewPage;
