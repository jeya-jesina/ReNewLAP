import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { User, Mail, Phone, MapPin, ArrowLeft, Save } from "lucide-react";
import { showToast } from "../../utils/toast";
import { API_BASE_URL } from "../../services/api"; // ✅ Import API_BASE_URL

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get_user.php?id=${id}`); // ✅ Updated
      if (response.data?.status) {
        setFormData({
          name: response.data.data.name || "",
          email: response.data.data.email || "",
          phone: response.data.data.phone || "",
          address: response.data.data.address || "",
          status: response.data.data.status || "active",
        });
      } else {
        showToast(response.data?.message || "User not found", "error");
        navigate("/users");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      showToast("Failed to fetch user", "error");
      navigate("/users");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate phone
    const phoneClean = formData.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length > 0 && phoneClean.length !== 10) {
      showToast("Please enter a valid 10-digit phone number", "error");
      setLoading(false);
      return;
    }

    const payload = {
      id: id,
      name: formData.name,
      email: formData.email,
      phone: phoneClean,
      address: formData.address,
      status: formData.status,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/update_user.php`, payload); // ✅ Updated
      if (response.data?.status) {
        showToast("User updated successfully!", "success");
        navigate("/users");
      } else {
        showToast(response.data?.message || "Failed to update user", "error");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showToast("Failed to update user", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a97c50]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/users")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#181818]">Edit User</h2>
          <p className="text-sm text-gray-500">Update user information</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="inline mr-1" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#a97c50] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail size={16} className="inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#a97c50] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone size={16} className="inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#a97c50] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} className="inline mr-1" />
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#a97c50] focus:border-transparent transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#a97c50] focus:border-transparent transition"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a97c50] text-white py-3 rounded-lg hover:bg-[#8a6540] transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {loading ? "Updating..." : "Update User"}
          </button>
        </form>
      </div>
    </div>
  );
}