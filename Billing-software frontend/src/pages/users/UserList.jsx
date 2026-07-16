import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Users as UsersIcon,
  Calendar,
  ShoppingBag,
  IndianRupee,
  Truck,
  Send,
  Copy,
  Check,
  X,
  Package
} from "lucide-react";
import { API_BASE_URL } from "../../services/api"; // ✅ Import API_BASE_URL

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [courierUser, setCourierUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [generatedCourierId, setGeneratedCourierId] = useState(null);
  const [courierSentUsers, setCourierSentUsers] = useState({});

  useEffect(() => {
    fetchUsers();
    // Load courier sent status from localStorage
    const saved = localStorage.getItem('courier_sent_users');
    if (saved) {
      setCourierSentUsers(JSON.parse(saved));
    }
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get_users.php`); // ✅ Updated
      console.log("Users with orders response:", response.data);
      
      if (response.data?.status) {
        setUsers(response.data.data);
        if (response.data.data.length === 0) {
          showToast("No users with orders found", "info");
        }
      } else {
        showToast(response.data?.message || "Failed to fetch users", "error");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCourier = async () => {
    if (!courierUser) return;
    
    setActionLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/send_courier.php`, { // ✅ Updated
        user_id: courierUser.id
      });
      
      if (response.data?.status) {
        setGeneratedCourierId(response.data.data.courier_id);
        
        // Mark this user as courier sent
        const updatedSent = { 
          ...courierSentUsers, 
          [courierUser.id]: {
            sent: true,
            courier_id: response.data.data.courier_id,
            sent_at: new Date().toISOString()
          }
        };
        setCourierSentUsers(updatedSent);
        localStorage.setItem('courier_sent_users', JSON.stringify(updatedSent));
        
        showToast(`Courier ID sent to ${courierUser.email}!`, "success");
        fetchUsers();
      } else {
        showToast(response.data?.message || "Failed to send courier ID", "error");
      }
    } catch (error) {
      console.error("Error sending courier:", error);
      showToast("Failed to send courier ID", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/delete_user.php?id=${selectedUser.id}`); // ✅ Updated
      if (response.data?.status) {
        showToast("User deleted successfully", "success");
        fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        showToast(response.data?.message || "Failed to delete user", "error");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Failed to delete user", "error");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Copied to clipboard!", "success");
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle size={12} />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle size={12} />
          Inactive
        </span>
      );
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search) ||
      user.id?.toString().includes(search)
    );
  });

  const closeCourierModal = () => {
    setShowCourierModal(false);
    setCourierUser(null);
    setGeneratedCourierId(null);
    setActionLoading(false);
  };

  const isCourierSent = (userId) => {
    return courierSentUsers[userId]?.sent || false;
  };

  const getCourierId = (userId) => {
    return courierSentUsers[userId]?.courier_id || null;
  };

  return (
    <div className="p-6">
      {/* Toast Message */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
          message.type === 'success' ? 'bg-green-600' : 
          message.type === 'error' ? 'bg-red-600' : 
          message.type === 'info' ? 'bg-blue-600' :
          'bg-yellow-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#181818]">Customers with Orders</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total: {users.length} customers who have placed orders
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#a97c50] focus:border-transparent w-48 md:w-64"
            />
          </div>

          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a97c50]"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? "No customers found matching your search" : "No customers with orders yet"}
            </p>
            {!searchTerm && (
              <p className="text-gray-400 text-sm mt-1">
                Customers who have placed orders will appear here
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8f7f2]">
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Spent</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Courier</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const courierSent = isCourierSent(user.id);
                  const courierId = getCourierId(user.id);
                  
                  return (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-[#f8f7f2] transition">
                      <td className="p-3 text-sm text-gray-600 font-mono">#{user.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a97c50] to-[#8a6540] flex items-center justify-center text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="font-medium text-[#181818]">{user.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{user.email}</td>
                      <td className="p-3 text-sm text-gray-600">{user.phone || '-'}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <ShoppingBag size={12} />
                          {user.total_orders || 0}
                        </span>
                      </td>
                      <td className="p-3 text-sm font-medium text-[#a97c50]">
                        <span className="flex items-center gap-1">
                          <IndianRupee size={12} />
                          {parseFloat(user.total_spent || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3">
                        {courierSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle size={12} />
                            {courierId}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Not Sent</span>
                        )}
                      </td>
                      <td className="p-3">{getStatusBadge(user.status)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {courierSent ? (
                            <button
                              onClick={() => {
                                setCourierUser(user);
                                setGeneratedCourierId(courierId);
                                setShowCourierModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="View Courier ID"
                            >
                              <Package size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setCourierUser(user);
                                setGeneratedCourierId(null);
                                setShowCourierModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Send Courier ID"
                            >
                              <Truck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/users/edit/${user.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send/View Courier Modal */}
      {showCourierModal && courierUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#181818]">
                {generatedCourierId ? "📦 Courier Details" : "Send Courier ID"}
              </h3>
              <button
                onClick={closeCourierModal}
                className="text-gray-500 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-[#f8f7f2] rounded-lg">
              <p><strong>Customer:</strong> {courierUser.name}</p>
              <p><strong>Email:</strong> {courierUser.email}</p>
              <p><strong>Total Orders:</strong> {courierUser.total_orders || 0}</p>
            </div>

            {generatedCourierId ? (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600">✅ Courier ID</p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-2xl font-bold text-[#a97c50] font-mono">{generatedCourierId}</code>
                  <button
                    onClick={() => copyToClipboard(generatedCourierId)}
                    className="p-1.5 text-gray-400 hover:text-[#a97c50] transition rounded-lg hover:bg-gray-100"
                  >
                    {copiedId === generatedCourierId ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-green-600 mt-2">📧 Email sent to customer</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                This will generate a courier ID and send it to the customer's email address.
              </p>
            )}

            <div className="flex gap-3">
              {!generatedCourierId ? (
                <>
                  <button
                    onClick={handleSendCourier}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-[#a97c50] text-white rounded-lg hover:bg-[#8a6540] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    {actionLoading ? "Sending..." : "Generate & Send"}
                  </button>
                  <button
                    onClick={closeCourierModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={closeCourierModal}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-[#181818] mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete customer <strong>{selectedUser.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}