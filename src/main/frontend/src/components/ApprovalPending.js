import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApprovalPending = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingInventoryRequests, setPendingInventoryRequests] = useState([]);
  const [pendingPORequests, setPendingPORequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('employee');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const [employeeResponse, inventoryResponse, poResponse] = await Promise.all([
        axios.get('/api/employee-requests/pending', { withCredentials: true }),
        axios.get('/api/employee-requests/inventory/pending', { withCredentials: true }),
        axios.get('/api/purchase-orders/requests/pending', { withCredentials: true })
      ]);
      setPendingRequests(employeeResponse.data);
      setPendingInventoryRequests(inventoryResponse.data);
      setPendingPORequests(poResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch pending requests');
      console.error('Error fetching pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, requestType = 'employee') => {
    if (window.confirm(`Are you sure you want to approve this ${requestType} request?`)) {
      try {
        let endpoint;
        if (requestType === 'purchaseOrder') {
          endpoint = `/api/purchase-orders/requests/${requestId}/approve`;
        } else if (requestType === 'inventory') {
          endpoint = `/api/employee-requests/inventory/approve/${requestId}`;
        } else {
          endpoint = `/api/employee-requests/approve/${requestId}`;
        }
        
        await axios.post(endpoint, {}, {
          withCredentials: true
        });
        alert(`${requestType === 'purchaseOrder' ? 'Purchase Order' : requestType.charAt(0).toUpperCase() + requestType.slice(1)} request approved successfully`);
        fetchPendingRequests();
      } catch (err) {
        alert('Failed to approve request: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleRejectClick = (request, requestType = 'employee') => {
    setSelectedRequest({...request, requestType});
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      let endpoint;
      let requestBody;
      
      if (selectedRequest.requestType === 'purchaseOrder') {
        endpoint = `/api/purchase-orders/requests/${selectedRequest.id}/reject`;
        requestBody = { rejectionReason: rejectionReason };
      } else if (selectedRequest.requestType === 'inventory') {
        endpoint = `/api/employee-requests/inventory/reject/${selectedRequest.id}`;
        requestBody = { reason: rejectionReason };
      } else {
        endpoint = `/api/employee-requests/reject/${selectedRequest.id}`;
        requestBody = { reason: rejectionReason };
      }
      
      await axios.post(endpoint, requestBody, {
        withCredentials: true
      });
      
      const requestTypeDisplay = selectedRequest.requestType === 'purchaseOrder' ? 'Purchase Order' : 
                                selectedRequest.requestType === 'inventory' ? 'Inventory' : 'Employee';
      alert(`${requestTypeDisplay} request rejected`);
      setShowRejectModal(false);
      fetchPendingRequests();
    } catch (err) {
      alert('Failed to reject request: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="approval-pending">
      <h2>Pending Requests</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('employee')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'employee' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'employee' ? 'white' : '#333',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Employee Requests ({pendingRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'inventory' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'inventory' ? 'white' : '#333',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Inventory Requests ({pendingInventoryRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab('purchaseOrder')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'purchaseOrder' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'purchaseOrder' ? 'white' : '#333',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Purchase Orders ({pendingPORequests.length})
        </button>
      </div>

      {activeTab === 'employee' && (
        <>
          {pendingRequests.length === 0 ? (
            <p>No pending employee requests</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Employee ID</th>
                    <th>Passport ID</th>
                    <th>Emirates ID</th>
                    <th>Phone</th>
                    <th>Joining Date</th>
                    <th>Salary</th>
                    <th>Requested By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.name}</td>
                      <td>{request.empId}</td>
                      <td>{request.passportId}</td>
                      <td>{request.emiratesId}</td>
                      <td>{request.phoneNumber}</td>
                      <td>{new Date(request.joiningDate).toLocaleDateString()}</td>
                      <td>${request.salary}</td>
                      <td>{request.requestedBy?.username}</td>
                      <td>
                        <button 
                          className="btn btn-approve"
                          onClick={() => handleApprove(request.id, 'employee')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-reject"
                          onClick={() => handleRejectClick(request, 'employee')}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'inventory' && (
        <>
          {pendingInventoryRequests.length === 0 ? (
            <p>No pending inventory requests</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Inventory ID</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price/Unit</th>
                    <th>Total Price</th>
                    <th>Supplier</th>
                    <th>Requested By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInventoryRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.requestType}</td>
                      <td>{request.inventoryId}</td>
                      <td>{request.name}</td>
                      <td>{request.quantity}</td>
                      <td>${request.perQuantityPrice}</td>
                      <td>${request.totalPrice}</td>
                      <td>{request.supplierName}</td>
                      <td>{request.requestedBy}</td>
                      <td>
                        <button 
                          className="btn btn-approve"
                          onClick={() => handleApprove(request.id, 'inventory')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-reject"
                          onClick={() => handleRejectClick(request, 'inventory')}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'purchaseOrder' && (
        <>
          {pendingPORequests.length === 0 ? (
            <p>No pending purchase order requests</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Project</th>
                    <th>Supplier</th>
                    <th>Total Amount</th>
                    <th>Expected Delivery</th>
                    <th>Payment Terms</th>
                    <th>Items</th>
                    <th>Requested By</th>
                    <th>Request Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPORequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.purchaseOrder?.poNumber}</td>
                      <td>{request.purchaseOrder?.project?.name || 'N/A'}</td>
                      <td>{request.purchaseOrder?.supplierName}</td>
                      <td>${request.purchaseOrder?.totalAmount || '0.00'}</td>
                      <td>{request.purchaseOrder?.expectedDeliveryDate ? 
                        new Date(request.purchaseOrder.expectedDeliveryDate).toLocaleDateString() : 
                        'N/A'}</td>
                      <td>{request.purchaseOrder?.paymentTerms || 'N/A'}</td>
                      <td>{request.purchaseOrder?.purchaseOrderItems?.length || 0} items</td>
                      <td>{request.requestedBy}</td>
                      <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-approve"
                          onClick={() => handleApprove(request.id, 'purchaseOrder')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-reject"
                          onClick={() => handleRejectClick(request, 'purchaseOrder')}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showRejectModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Reject {selectedRequest?.requestType === 'purchaseOrder' ? 'Purchase Order' : 
                      selectedRequest?.requestType === 'inventory' ? 'Inventory' : 'Employee'} Request</h3>
            <p>{selectedRequest?.requestType === 'purchaseOrder' ? 'PO Number' : 
               selectedRequest?.requestType === 'inventory' ? 'Inventory' : 'Employee'}: {
               selectedRequest?.requestType === 'purchaseOrder' ? 
                 selectedRequest?.purchaseOrder?.poNumber : 
                 selectedRequest?.name
               }</p>
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4"
              style={{ width: '100%' }}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReject}>
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalPending;