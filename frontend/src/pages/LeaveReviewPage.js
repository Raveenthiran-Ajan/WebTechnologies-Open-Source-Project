import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaveReviewPage = ({ reviewer, role }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

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

  const handleApprove = async (requestId) => {
    setLoading(true);
    setMessage('');
    try {
      await axios.patch(`/leave/${requestId}/review`, {
        status: 'Approved',
        reviewedBy: reviewer._id
      });
      setMessage('Leave request approved');
      fetchAllLeaveRequests();
    } catch (err) {
      setMessage('Failed to update leave request');
    }
    setLoading(false);
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      setMessage('Please enter a rejection reason');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await axios.patch(`/leave/${requestId}/review`, {
        status: 'Rejected',
        reviewedBy: reviewer._id,
        rejectionReason
      });
      setMessage('Leave request rejected');
      setRejectionReason('');
      setRejectingId(null);
      fetchAllLeaveRequests();
    } catch (err) {
      setMessage('Failed to update leave request');
    }
    setLoading(false);
  };

  const startReject = (id) => {
    setRejectingId(id);
    setRejectionReason('');
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectionReason('');
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
                      <button onClick={() => handleApprove(lr._id)}>Approve</button>
                      {rejectingId === lr._id ? (
                        <div>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason"
                            rows="2"
                            cols="20"
                          />
                          <br />
                          <button onClick={() => handleReject(lr._id)}>Confirm Reject</button>
                          <button onClick={cancelReject}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => startReject(lr._id)}>Reject</button>
                      )}
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
