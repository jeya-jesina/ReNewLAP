import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import BulkVideoUpload from "../../components/BulkVideoUpload";

/* ─── Toast Hook ─────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (type, title, msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, title, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  };
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, show, remove };
}

/* ─── Toast UI ───────────────────────────────────────────── */
function ToastPortal({ toasts, remove }) {
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none"
    }}>
      {toasts.map(t => (
        <div key={t.id} className={`cf-toast cf-toast-${t.type}`}>
          <div className="cf-toast-icon">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "!"}
          </div>
          <div className="cf-toast-content">
            <p className="cf-toast-title">{t.title}</p>
            {t.msg && <p className="cf-toast-msg">{t.msg}</p>}
          </div>
          <button className="cf-toast-x" style={{ pointerEvents: "auto" }} onClick={() => remove(t.id)}>✕</button>
          <div className="cf-toast-progress" />
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function CategoryForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [visible, setVisible] = useState(false);
  const [bannerImage, setBannerImage] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [categoryVideo, setCategoryVideo] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const { toasts, show, remove } = useToast();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(
    localStorage.getItem("selected_company_id") || ""
  );
  const [createdCategoryId, setCreatedCategoryId] = useState(null);
  const [createdCategoryName, setCreatedCategoryName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user?.id) return;
    loadCompanies(user.id);
  }, []);

  const loadCompanies = async(admin_id) => {
    try {
      const res = await api.get(
        `/company/get_companies_by_admin.php?admin_id=${admin_id}`
      );
      if(res.data.status){
        setCompanies(res.data.data);
        if(!localStorage.getItem("selected_company_id") && res.data.data.length > 0){
          localStorage.setItem("selected_company_id", res.data.data[0].id);
          setSelectedCompany(res.data.data[0].id);
        }
      }
    } catch(err){
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setName(e.target.value);
    setCharCount(e.target.value.length);
  };

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(",")[1] || "";
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setBannerFile(file);
    if (!file) {
      setBannerPreview("");
      return;
    }
    setBannerPreview(URL.createObjectURL(file));
    setBannerImage("");
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    if (!file) {
      setVideoPreview("");
      return;
    }
    setVideoPreview(URL.createObjectURL(file));
    setCategoryVideo("");
  };

  const handleSubmit = async () => {
    const company_id = Number(selectedCompany);
    if (!name.trim()) {
      show("warn", "Missing field", "Category name is required.");
      return;
    }
    if (!company_id) {
      show("error", "Auth error", "Company info not found. Please re-login.");
      return;
    }

    setLoading(true);
    try {
      let banner_image_value = bannerImage;
      if (bannerFile) {
        try {
          banner_image_value = await readFileAsBase64(bannerFile);
        } catch (error) {
          console.error(error);
          show("error", "Upload failed", "Unable to read the selected image.");
          setLoading(false);
          return;
        }
      }

      let category_video_value = categoryVideo;
      if (videoFile) {
        try {
          category_video_value = await readFileAsBase64(videoFile);
        } catch (error) {
          console.error(error);
          show("error", "Upload failed", "Unable to read the selected video.");
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: name.trim(),
        company_id: company_id,
        banner_image: banner_image_value,
        category_video: category_video_value,
        status: status,
        visible: visible,
      };

      const res = await api.post("/category/create.php", payload);
      if (res.data.status) {
        // Store the created category ID for bulk upload
        if (res.data.data && res.data.data.id) {
          setCreatedCategoryId(res.data.data.id);
          setCreatedCategoryName(name.trim());
        }
        show("success", "Category added!", `"${name.trim()}" has been created.`);
        // Don't navigate away immediately - let user upload videos
        // setTimeout(() => navigate("/category"), 2000);
      } else {
        show("error", "Failed", res.data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      show("error", "Server error", "Unable to reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .cf-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef2ff;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .cf-bg-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .cf-bg-ring-1 {
          width: 500px; height: 500px;
          border: 60px solid rgba(37,99,235,0.07);
          top: -180px; right: -160px;
        }
        .cf-bg-ring-2 {
          width: 320px; height: 320px;
          border: 40px solid rgba(99,102,241,0.06);
          bottom: -100px; left: -80px;
        }
        .cf-bg-dot {
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(37,99,235,0.18);
          pointer-events: none;
        }

        .cf-card {
          position: relative;
          width: 100%;
          max-width: 520px;
          background: #ffffff;
          border-radius: 26px;
          border: 1px solid rgba(226,232,240,0.8);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.9) inset,
            0 20px 60px rgba(37,99,235,0.1),
            0 4px 16px rgba(0,0,0,0.04);
          overflow: hidden;
          animation: cfSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cfSlideUp {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        .cf-stripe {
          height: 5px;
          background: linear-gradient(90deg, #1d4ed8, #6366f1, #3b82f6, #1d4ed8);
          background-size: 200% 100%;
          animation: cfStripe 3s linear infinite;
        }
        @keyframes cfStripe {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .cf-header {
          padding: 2rem 2rem 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .cf-icon-box {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(37,99,235,0.35);
        }
        .cf-header-text h1 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
          letter-spacing: -0.4px;
        }
        .cf-header-text p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          font-weight: 400;
        }

        .cf-hr {
          height: 1px;
          background: #f1f5f9;
          margin: 0 2rem;
        }

        .cf-body {
          padding: 1.75rem 2rem 2rem;
        }

        .cf-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .cf-label {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
        }
        .cf-char {
          font-size: 11px;
          color: #cbd5e1;
          font-weight: 500;
          transition: color 0.2s;
        }
        .cf-char.active { color: #3b82f6; }

        .cf-input-group {
          position: relative;
          margin-bottom: 1.5rem;
        }
        .cf-input-prefix {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 48px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          color: #cbd5e1;
          border-right: 1.5px solid #e2e8f0;
          pointer-events: none;
          transition: all 0.25s;
          border-radius: 14px 0 0 14px;
        }
        .cf-input {
          width: 100%;
          padding: 14px 16px 14px 60px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: #f8faff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          color: #1e293b;
          outline: none;
          box-sizing: border-box;
          transition: all 0.25s;
        }
        .cf-input::placeholder { color: #c4cdd6; font-weight: 400; }
        .cf-input:hover {
          border-color: #bfdbfe;
          background: #f0f6ff;
        }
        .cf-input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
        }
        .cf-input:focus ~ .cf-input-prefix {
          color: #3b82f6;
          border-right-color: #bfdbfe;
        }
        .cf-input-group:focus-within .cf-input-prefix {
          color: #3b82f6;
          border-right-color: #bfdbfe;
        }

        .cf-status-group {
          display: flex;
          gap: 12px;
          margin-bottom: 1.75rem;
        }
        .cf-status-option {
          flex: 1;
          padding: 10px 16px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: #f8faff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .cf-status-option.active {
          border-color: #22c55e;
          background: #f0fdf4;
          color: #16a34a;
        }
        .cf-status-option.inactive {
          border-color: #ef4444;
          background: #fef2f2;
          color: #dc2626;
        }
        .cf-status-option:hover:not(.active):not(.inactive) {
          border-color: #94a3b8;
          background: #f1f5f9;
        }

        .cf-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 1.75rem;
        }
        .cf-chip-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          width: 100%;
          margin-bottom: 2px;
        }
        .cf-chip {
          padding: 5px 12px;
          border-radius: 100px;
          border: 1.5px solid #e2e8f0;
          background: #f8faff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.18s;
        }
        .cf-chip:hover {
          border-color: #3b82f6;
          color: #2563eb;
          background: #eff6ff;
        }

        .cf-btn {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.01em;
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
          color: #fff;
          box-shadow: 0 4px 18px rgba(37,99,235,0.38), 0 1px 3px rgba(37,99,235,0.15);
          position: relative;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.25s;
        }
        .cf-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .cf-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.45), 0 2px 6px rgba(37,99,235,0.2);
        }
        .cf-btn:active:not(:disabled) { transform: translateY(0); }
        .cf-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .cf-btn-cancel {
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: transparent;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cf-btn-cancel:hover { background: #f8fafc; color: #475569; border-color: #cbd5e1; }

        .cf-spinner {
          width: 17px; height: 17px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .video-preview {
          margin-bottom: 1.5rem;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
        }
        .video-preview video {
          width: 100%;
          display: block;
        }

        .cf-success-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cf-success-box .icon {
          font-size: 24px;
        }
        .cf-success-box .text {
          flex: 1;
        }
        .cf-success-box .text h4 {
          color: #15803d;
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 700;
        }
        .cf-success-box .text p {
          color: #16a34a;
          margin: 0;
          font-size: 13px;
        }
        .cf-success-box .btn-go {
          background: #22c55e;
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
        }
        .cf-success-box .btn-go:hover {
          background: #16a34a;
        }

        /* ── Toast ── */
        .cf-toast {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 290px;
          max-width: 370px;
          padding: 13px 16px;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.06);
          animation: cfToastIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @keyframes cfToastIn {
          from { opacity:0; transform:translateX(60px) scale(0.9); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
        .cf-toast-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }
        .cf-toast-error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
        }
        .cf-toast-warn {
          background: #fffbeb;
          border: 1px solid #fde68a;
        }
        .cf-toast-icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .cf-toast-success .cf-toast-icon { background: #dcfce7; color: #16a34a; }
        .cf-toast-error   .cf-toast-icon { background: #ffe4e6; color: #e11d48; }
        .cf-toast-warn    .cf-toast-icon { background: #fef9c3; color: #b45309; }
        .cf-toast-content { flex: 1; }
        .cf-toast-title {
          font-size: 13px; font-weight: 700; margin: 0 0 2px;
        }
        .cf-toast-success .cf-toast-title { color: #15803d; }
        .cf-toast-error   .cf-toast-title { color: #be123c; }
        .cf-toast-warn    .cf-toast-title { color: #92400e; }
        .cf-toast-msg {
          font-size: 12px; margin: 0; font-weight: 400;
        }
        .cf-toast-success .cf-toast-msg { color: #16a34a; }
        .cf-toast-error   .cf-toast-msg { color: #e11d48; }
        .cf-toast-warn    .cf-toast-msg { color: #b45309; }
        .cf-toast-x {
          background: none; border: none; cursor: pointer;
          font-size: 13px; opacity: 0.4; transition: opacity 0.2s;
          flex-shrink: 0; padding: 2px;
        }
        .cf-toast-x:hover { opacity: 0.9; }
        .cf-toast-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 3px;
          border-radius: 0 0 16px 16px;
          animation: cfShrink 3.8s linear forwards;
        }
        .cf-toast-success .cf-toast-progress { background: #4ade80; }
        .cf-toast-error   .cf-toast-progress { background: #fb7185; }
        .cf-toast-warn    .cf-toast-progress { background: #fbbf24; }
        @keyframes cfShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }

        .cf-bulk-upload-section {
          margin-top: 20px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
      `}</style>

      <ToastPortal toasts={toasts} remove={remove} />

      <div className="cf-page">
        <div className="cf-bg-ring cf-bg-ring-1" />
        <div className="cf-bg-ring cf-bg-ring-2" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="cf-bg-dot" style={{
            top: `${[15,25,70,80,40,60,10,90][i]}%`,
            left: `${[10,85,5,90,50,20,70,45][i]}%`,
            opacity: 0.4 + i * 0.05
          }} />
        ))}

        <div className="cf-card">
          <div className="cf-stripe" />

          <div className="cf-header">
            <div className="cf-icon-box">🏷️</div>
            <div className="cf-header-text">
              <h1>Add Category</h1>
              <p>Organise your products under a new category</p>
            </div>
          </div>

          <div className="cf-hr" />

          <div className="cf-body">
            {/* Select Company */}
            <div style={{marginBottom:"20px"}}>
              <label className="cf-label">Select Company</label>
              <select
                className="cf-input"
                value={selectedCompany}
                onChange={(e)=>{
                  setSelectedCompany(e.target.value);
                  localStorage.setItem("selected_company_id", e.target.value);
                }}
              >
                <option value="">Select Company</option>
                {companies.map((company)=>(
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Name */}
            <div className="cf-label-row">
              <span className="cf-label">Category Name</span>
              <span className={`cf-char ${charCount > 0 ? "active" : ""}`}>{charCount}/50</span>
            </div>
            <div className="cf-input-group">
              <input
                type="text"
                className="cf-input"
                placeholder="e.g. Electronics, Beverages…"
                value={name}
                maxLength={50}
                onChange={handleChange}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <div className="cf-input-prefix">#</div>
            </div>

            {/* Status Toggle */}
            <div className="cf-label-row">
              <span className="cf-label">Category Status</span>
            </div>
            <div className="cf-status-group">
              <button
                className={`cf-status-option ${status === 'active' ? 'active' : ''}`}
                onClick={() => setStatus('active')}
              >
                ✅ Active
              </button>
              <button
                className={`cf-status-option ${status === 'inactive' ? 'inactive' : ''}`}
                onClick={() => setStatus('inactive')}
              >
                ❌ Inactive
              </button>
            </div>

            {/* Visibility */}
            <div style={{ marginBottom: "20px" }}>
              <label className="cf-label">Category Visibility</label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#334155",
                }}
              >
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
                Visible Category
              </label>
              <p
                style={{
                  marginTop: "6px",
                  marginLeft: "28px",
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                Checked = <b>true</b> &nbsp;&nbsp; Unchecked = <b>false</b>
              </p>
            </div>

            {/* Banner Image */}
            <div className="cf-label-row">
              <span className="cf-label">Category Banner Image</span>
              <span className="cf-char">Optional</span>
            </div>
            <div className="cf-input-group">
              <input
                type="file"
                accept="image/*"
                className="cf-input"
                onChange={handleBannerFileChange}
              />
            </div>
            <div className="cf-input-group">
              <input
                type="text"
                className="cf-input"
                placeholder="Or paste image URL"
                value={bannerImage}
                onChange={(e) => {
                  setBannerImage(e.target.value);
                  setBannerFile(null);
                  setBannerPreview(e.target.value);
                }}
              />
            </div>
            {(bannerPreview || bannerImage) && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-[#e2e8f0]">
                <img
                  src={bannerPreview || bannerImage}
                  alt="Banner preview"
                  className="w-full object-cover"
                />
              </div>
            )}

            {/* Category Video */}
            <div className="cf-label-row">
              <span className="cf-label">Category Video</span>
              <span className="cf-char">Optional</span>
            </div>
            <div className="cf-input-group">
              <input
                type="file"
                accept="video/*"
                className="cf-input"
                onChange={handleVideoFileChange}
              />
            </div>
            <div className="cf-input-group">
              <input
                type="text"
                className="cf-input"
                placeholder="Or paste video URL"
                value={categoryVideo}
                onChange={(e) => {
                  setCategoryVideo(e.target.value);
                  setVideoFile(null);
                  setVideoPreview(e.target.value);
                }}
              />
            </div>
            {(videoPreview || categoryVideo) && (
              <div className="video-preview">
                <video controls>
                  <source src={videoPreview || categoryVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Quick-fill suggestion chips */}
            <div className="cf-chips">
              <span className="cf-chip-label">Quick suggestions</span>
              {["Electronics", "Beverages", "Snacks", "Dairy", "Bakery", "Stationery"].map(s => (
                <button key={s} className="cf-chip" onClick={() => { setName(s); setCharCount(s.length); }}>
                  {s}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <button className="cf-btn" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><div className="cf-spinner" /> Saving…</>
                : <>💾 Save Category</>
              }
            </button>
            <button className="cf-btn-cancel" onClick={() => navigate("/category")}>
              Cancel
            </button>

            {/* ─── Success Message & Bulk Upload ─── */}
            {createdCategoryId && (
              <div className="cf-bulk-upload-section">
                <div className="cf-success-box">
                  <div className="icon">✅</div>
                  <div className="text">
                    <h4>Category Created!</h4>
                    <p>"{createdCategoryName}" has been created. Now upload videos.</p>
                  </div>
                  <button 
                    className="btn-go" 
                    onClick={() => navigate("/category")}
                  >
                    Go to List
                  </button>
                </div>

                <BulkVideoUpload 
                  categoryId={createdCategoryId}
                  categoryName={createdCategoryName}
                  onUploadComplete={() => {
                    show("success", "Upload Complete!", "Videos have been uploaded successfully.");
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}