import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Barcode from "react-barcode";

/* ─── Toast Hook ─────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (type, title, msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, title, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3600);
  };
  const remove = id => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, show, remove };
}

function ToastPortal({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", top:22, right:22, zIndex:9999, display:"flex", flexDirection:"column", gap:9, pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} className={`ep-toast ep-toast-${t.type}`}>
          <div className="ep-toast-icon">{t.type==="success"?"✓":t.type==="error"?"✕":"!"}</div>
          <div className="ep-toast-body">
            <p className="ep-toast-title">{t.title}</p>
            {t.msg && <p className="ep-toast-msg">{t.msg}</p>}
          </div>
          <button className="ep-toast-x" style={{pointerEvents:"auto"}} onClick={()=>remove(t.id)}>✕</button>
          <div className="ep-toast-bar" />
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstLoading, setGstLoading] = useState(true);
  const [barcodeKey, setBarcodeKey] = useState(0);
  const { toasts, show, remove } = useToast();
  const [productCompanyId, setProductCompanyId] = useState("");
  
  // Media states
  const [existingImages, setExistingImages] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingVideo, setExistingVideo] = useState("");
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [hasVideo, setHasVideo] = useState(false);

  const [form, setForm] = useState({
    name: "",
    product_code: "",
    price: "",
    stock: "",
    gst: "",
    barcode: "",
    category_id: "",
    unit: "",
    description: "",
    fabric: "",
    embroidery: "",
    color: "",
    available_sizes: "",
    occasion: "",
    keywords: "",
  });
  const [keywordsLoading, setKeywordsLoading] = useState(false);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const BACKEND_BASE = "http://localhost/bridal-boutique/Bridal-Boutique-backend";

  const resolveImageUrl = (src) => {
    if (!src) return "";
    if (src.startsWith("http")) return src;
    if (src.startsWith("uploads/")) {
      return `${BACKEND_BASE}/${src}`;
    }
    return `${BACKEND_BASE}/uploads/${src}`;
  };

  const resolveVideoUrl = (src) => {
    if (!src) return "";
    if (src.startsWith("http")) return src;
    if (src.startsWith("uploads/")) {
      return `${BACKEND_BASE}/${src}`;
    }
    return `${BACKEND_BASE}/uploads/${src}`;
  };

  const getCompanyId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return Number(user?.company_id);
  };

  const fetchCompanyGSTByCompanyId = async(company_id) => {
    try {
      const res = await api.post("/company/get_company_by_id.php", { id: company_id });
      if(res.data.status){
        const company = res.data.data;
        setGstEnabled(company.gst_type === "with_gst");
      }
    } catch(err){
      console.log(err);
    } finally {
      setGstLoading(false);
    }
  };

  const fetchCategoriesByCompany = async(company_id) => {
    try {
      const res = await api.get(`/category/get_all.php?company_id=${company_id}`);
      if(res.data.status){
        setCategories(res.data.data);
      }
    } catch(err){
      console.log(err);
    }
  };

  const fetchProduct = async () => {
    setFetching(true);
    try {
      const res = await api.get(`/product/get_by_id.php?id=${id}`);
      if(res.data.status){
        const p = res.data.data;
        setProductCompanyId(p.company_id);
        await fetchCategoriesByCompany(p.company_id);
        await fetchCompanyGSTByCompanyId(p.company_id);

        setForm({
          name: p.product_name || "",
          product_code: p.product_code || "",
          price: p.price || "",
          stock: p.stock || "",
          gst: p.gst_percentage || "",
          barcode: p.barcode || "",
          category_id: String(p.category_id || ""),
          unit: p.unit || "",
          description: p.short_description || "",
          fabric: p.fabric || "",
          embroidery: p.embroidery || "",
          color: p.color || "",
          available_sizes: p.available_sizes || "",
          occasion: p.occasion || "",
          keywords: p.keywords || "",
        });

        // Set existing images
        let galleryImages = [];
        if (p.image_gallery_json) {
          try {
            const cleanJson = p.image_gallery_json.replace(/\\\\/g, "").replace(/\\\"/g, '"').replace(/\\\//g, "/");
            galleryImages = JSON.parse(cleanJson);
          } catch (e) {
            console.warn("Failed to parse image gallery JSON:", e);
          }
        }
        if (p.image) {
          setExistingImages([p.image, ...galleryImages]);
        } else {
          setExistingImages(galleryImages);
        }

        // Set existing video
        if (p.video_url) {
          setExistingVideo(p.video_url);
          setVideoURL(p.video_url);
          setHasVideo(true);
        } else {
          setHasVideo(false);
        }
      }
    } catch(err){
      console.log(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const generateBarcode = () => {
    const code = "PRD" + Math.floor(100000 + Math.random() * 900000);
    setForm(p => ({ ...p, barcode: code }));
    setBarcodeKey(k => k + 1);
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Updated handler for gallery files - limits to 5 images total (existing + new)
  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Calculate total images (existing + new)
    const totalImages = existingImages.length + newGalleryFiles.length + files.length;
    
    // Check if adding these files would exceed 5
    if (totalImages > 5) {
      show("warn", "Limit Exceeded", `You can upload maximum 5 images total. Currently have ${existingImages.length + newGalleryFiles.length} images.`);
      return;
    }
    
    setNewGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file))
    ]);
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setNewVideoFile(file);
    setVideoPreview(file ? URL.createObjectURL(file) : "");
    if (file) {
      setExistingVideo("");
      setHasVideo(false);
    }
  };

  const handleClearVideo = () => {
    setNewVideoFile(null);
    setVideoPreview("");
    setExistingVideo("");
    setVideoURL("");
    setHasVideo(false);
  };

  const handleVideoURLChange = (e) => {
    const url = e.target.value;
    setVideoURL(url);
    if (url) {
      setNewVideoFile(null);
      setVideoPreview("");
      setExistingVideo("");
      setHasVideo(true);
    } else {
      setHasVideo(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.name.trim())    { show("warn", "Missing Field", "Product name is required."); return; }
    if (!form.category_id)    { show("warn", "Missing Field", "Please select a category."); return; }
    if (!form.price)          { show("warn", "Missing Field", "Price is required."); return; }
    if (isNaN(Number(form.price)) || Number(form.price) < 0) { show("warn", "Invalid Price", "Please enter a valid price."); return; }
    if (!form.stock)          { show("warn", "Missing Field", "Stock quantity is required."); return; }
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) { show("warn", "Invalid Stock", "Please enter a valid stock quantity."); return; }
    if (!form.unit.trim())    { show("warn", "Missing Field", "Unit is required (e.g. kg, litre, piece)."); return; }
    if (gstEnabled && !form.gst) { show("warn", "Missing Field", "GST percentage is required."); return; }
    if (gstEnabled && (isNaN(Number(form.gst)) || Number(form.gst) < 0 || Number(form.gst) > 100)) {
      show("warn", "Invalid GST", "Please enter a valid GST percentage (0–100).");
      return;
    }

    setLoading(true);
    try {
      let galleryData = [];
      let firstImageData = "";
      let videoData = "";

      // Handle new gallery images
      if (newGalleryFiles.length > 0) {
        try {
          galleryData = await Promise.all(
            newGalleryFiles.map((file) => readFileAsDataUrl(file))
          );
        } catch (err) {
          console.error(err);
          show("error", "Upload failed", "Unable to read selected images.");
          setLoading(false);
          return;
        }
        firstImageData = galleryData[0] || "";
      }

      // Handle new video
      if (newVideoFile) {
        try {
          videoData = await readFileAsDataUrl(newVideoFile);
        } catch (err) {
          console.error(err);
          show("error", "Upload failed", "Unable to read selected video.");
          setLoading(false);
          return;
        }
      }

      const res = await api.post("/product/update.php", {
        id,
        product_name: form.name,
        product_code: form.product_code,
        category_id: form.category_id,
        company_id: productCompanyId,
        price: form.price,
        stock: form.stock,
        gst_percentage: gstEnabled ? form.gst : "",
        barcode: form.barcode,
        unit: form.unit,
        short_description: form.description,
        full_description: form.description,
        fabric: form.fabric,
        embroidery: form.embroidery,
        color: form.color,
        available_sizes: form.available_sizes,
        occasion: form.occasion,
        keywords: form.keywords,
        image: firstImageData,
        gallery_images: galleryData,
        existing_images: existingImages,
        video_file: videoData,
        video_url: videoURL,
        existing_video: existingVideo,
        remove_video: videoURL === "" && !newVideoFile && !existingVideo ? true : false,
      });

      if (res.data.status) {
        show("success", "Product Updated!", `"${form.name}" updated successfully.`);
        setTimeout(() => navigate("/products"), 1800);
      } else {
        show("error", "Update Failed", res.data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      show("error", "Server Error", "Unable to reach server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total images count
  const totalImages = existingImages.length + newGalleryFiles.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .ep-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh; background: #eef2ff;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 2.5rem 1.5rem; position: relative; overflow-x: hidden;
        }
        .ep-card {
          max-height: none;
        }
        .ep-page {
          overflow-y: auto;
        }
        .ep-deco { position:fixed; pointer-events:none; border-radius:50%; filter:blur(70px); opacity:0.25; }
        .ep-deco-1 { width:380px;height:380px;background:#3b82f6;top:-120px;right:-100px; }
        .ep-deco-2 { width:260px;height:260px;background:#6366f1;bottom:-60px;left:-60px; }

        .ep-card {
          position:relative; width:100%; max-width:560px;
          background:#fff; border-radius:26px; border:1px solid #e2e8f0;
          box-shadow:0 8px 40px rgba(37,99,235,0.1), 0 2px 8px rgba(0,0,0,0.04);
          overflow:hidden; animation:epUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes epUp{from{opacity:0;transform:translateY(28px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}

        .ep-stripe {
          height:4px;
          background:linear-gradient(90deg,#1d4ed8,#6366f1,#3b82f6,#1d4ed8);
          background-size:200%; animation:epStripe 3s linear infinite;
        }
        @keyframes epStripe{0%{background-position:0%}100%{background-position:200%}}

        .ep-header {
          background:linear-gradient(135deg,#1e40af 0%,#2563eb 55%,#3b82f6 100%);
          padding:1.75rem 2rem; display:flex; align-items:center; gap:1rem;
          position:relative; overflow:hidden;
        }
        .ep-header::before {
          content:''; position:absolute; top:-50px; right:-50px;
          width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.07);
        }
        .ep-header::after {
          content:''; position:absolute; bottom:-30px; left:25%;
          width:220px; height:80px; border-radius:50%; background:rgba(255,255,255,0.05);
        }
        .ep-header-icon {
          width:52px; height:52px; border-radius:16px;
          background:rgba(255,255,255,0.18); border:1.5px solid rgba(255,255,255,0.3);
          display:flex; align-items:center; justify-content:center;
          font-size:22px; flex-shrink:0; position:relative; z-index:1;
        }
        .ep-header-text { position:relative; z-index:1; }
        .ep-header-text h1 { font-size:20px; font-weight:800; color:#fff; margin:0 0 3px; letter-spacing:-0.3px; }
        .ep-header-text p  { font-size:12.5px; color:rgba(255,255,255,0.7); margin:0; }

        .ep-id-chip {
          position:relative; z-index:1; margin-top:1rem;
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25);
          border-radius:100px; padding:4px 12px 4px 8px;
          font-size:11.5px; font-weight:600; color:rgba(255,255,255,0.9);
        }
        .ep-id-dot { width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px #4ade80; }

        .ep-body { padding:2rem; }

        .ep-section {
          font-size:10.5px; font-weight:800;
          text-transform:uppercase; letter-spacing:0.1em;
          color:#3b82f6; margin:0 0 12px;
          display:flex; align-items:center; gap:8px;
        }
        .ep-section::after { content:''; flex:1; height:1px; background:#e8f0fe; }

        .ep-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .ep-field  { margin-bottom:12px; }

        .ep-label {
          display:block; font-size:11px; font-weight:700;
          text-transform:uppercase; letter-spacing:0.07em;
          color:#94a3b8; margin-bottom:6px;
        }

        .ep-skel {
          height:46px; border-radius:12px;
          background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
          background-size:200% 100%; animation:epSkel 1.4s ease infinite;
        }
        @keyframes epSkel{0%{background-position:200%}100%{background-position:-200%}}

        .ep-input, .ep-select {
          width:100%; padding:12px 14px 12px 42px;
          border-radius:12px; border:1.5px solid #e2e8f0;
          background:#f8faff; font-family:'Plus Jakarta Sans',sans-serif;
          font-size:14px; font-weight:500; color:#1e293b;
          outline:none; box-sizing:border-box; transition:all 0.22s; appearance:none;
        }
        .ep-input::placeholder { color:#c4cdd6; font-weight:400; }
        .ep-input:hover,.ep-select:hover { border-color:#bfdbfe; background:#f0f6ff; }
        .ep-input:focus,.ep-select:focus {
          border-color:#3b82f6; background:#fff;
          box-shadow:0 0 0 4px rgba(59,130,246,0.1);
        }
        .ep-input-wrap  { position:relative; }
        .ep-input-icon  {
          position:absolute; left:13px; top:50%;
          transform:translateY(-50%); font-size:15px;
          pointer-events:none; transition:transform 0.2s;
        }
        .ep-input-wrap:focus-within .ep-input-icon { transform:translateY(-50%) scale(1.15); }

        .ep-select-wrap { position:relative; }
        .ep-select-arrow {
          position:absolute; right:14px; top:50%;
          transform:translateY(-50%); pointer-events:none; font-size:11px; color:#94a3b8;
        }
        .ep-select { padding-right:36px; }

        .ep-prefix {
          position:absolute; left:0; top:0; bottom:0;
          width:42px; display:flex; align-items:center; justify-content:center;
          border-right:1.5px solid #e2e8f0; border-radius:12px 0 0 12px;
          background:#f1f5f9; font-size:13px; font-weight:700;
          color:#64748b; pointer-events:none; transition:all 0.22s;
        }
        .ep-input-wrap:focus-within .ep-prefix { border-right-color:#bfdbfe; background:#eff6ff; color:#3b82f6; }

        .ep-gst-disabled {
          display:flex; align-items:center; gap:8px;
          padding:10px 14px; border-radius:12px;
          background:#f8faff; border:1.5px dashed #e2e8f0;
          font-size:12.5px; color:#94a3b8; font-weight:500;
        }

        .ep-gst-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:3px 10px; border-radius:100px;
          font-size:10.5px; font-weight:700; margin-left:8px;
        }
        .ep-gst-badge.on  { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
        .ep-gst-badge.off { background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; }

        .ep-divider { height:1px; background:#f1f5f9; margin:1.5rem 0; }

        .ep-barcode-row { display:flex; gap:10px; margin-bottom:14px; align-items:flex-end; }
        .ep-barcode-iw  { flex:1; }
        .ep-gen-btn {
          padding:12px 18px; border-radius:12px; border:none;
          cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
          font-size:12.5px; font-weight:700; white-space:nowrap;
          background:linear-gradient(135deg,#6366f1,#818cf8);
          color:#fff; box-shadow:0 4px 14px rgba(99,102,241,0.35);
          transition:all 0.2s;
        }
        .ep-gen-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(99,102,241,0.45); }

        .ep-barcode-preview {
          background:#f8faff; border-radius:14px; border:1.5px solid #e2e8f0;
          padding:16px; text-align:center; animation:epBarIn 0.3s ease both;
        }
        @keyframes epBarIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        .ep-barcode-label {
          font-size:10.5px; font-weight:700;
          text-transform:uppercase; letter-spacing:0.08em;
          color:#94a3b8; margin-bottom:8px;
        }

        .ep-submit {
          width:100%; padding:15px; border-radius:14px; border:none; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:800;
          background:linear-gradient(135deg,#1e40af 0%,#2563eb 55%,#3b82f6 100%);
          color:#fff; box-shadow:0 4px 18px rgba(37,99,235,0.38);
          position:relative; overflow:hidden;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all 0.25s;
        }
        .ep-submit::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 60%);
          pointer-events:none;
        }
        .ep-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(37,99,235,0.45); }
        .ep-submit:active:not(:disabled){ transform:translateY(0); }
        .ep-submit:disabled { opacity:0.6; cursor:not-allowed; }

        .ep-cancel {
          width:100%; margin-top:10px; padding:12px;
          border-radius:12px; border:1.5px solid #e2e8f0;
          background:transparent; font-family:'Plus Jakarta Sans',sans-serif;
          font-size:13.5px; font-weight:600; color:#94a3b8;
          cursor:pointer; transition:all 0.2s;
        }
        .ep-cancel:hover { background:#f8fafc; color:#475569; border-color:#cbd5e1; }

        .ep-spinner {
          width:17px;height:17px;
          border:2.5px solid rgba(255,255,255,0.3);
          border-top-color:#fff; border-radius:50%;
          animation:spin 0.7s linear infinite; flex-shrink:0;
        }
        @keyframes spin{to{transform:rotate(360deg)}}

        .ep-gst-field { animation:epFadeIn 0.3s ease both; }
        @keyframes epFadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}

        .ep-toast {
          pointer-events:auto; display:flex; align-items:center; gap:11px;
          min-width:280px; max-width:360px; padding:12px 15px; border-radius:15px;
          position:relative; overflow:hidden; box-shadow:0 8px 28px rgba(0,0,0,0.12);
          animation:epToastIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        @keyframes epToastIn{from{opacity:0;transform:translateX(60px) scale(0.9)}to{opacity:1;transform:translateX(0) scale(1)}}
        .ep-toast-success{background:#f0fdf4;border:1px solid #bbf7d0;}
        .ep-toast-error  {background:#fff1f2;border:1px solid #fecdd3;}
        .ep-toast-warn   {background:#fffbeb;border:1px solid #fde68a;}
        .ep-toast-icon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0;}
        .ep-toast-success .ep-toast-icon{background:#dcfce7;color:#16a34a;}
        .ep-toast-error   .ep-toast-icon{background:#ffe4e6;color:#e11d48;}
        .ep-toast-warn    .ep-toast-icon{background:#fef9c3;color:#b45309;}
        .ep-toast-body{flex:1;}
        .ep-toast-title{font-size:13px;font-weight:700;margin:0 0 2px;}
        .ep-toast-success .ep-toast-title{color:#15803d;}
        .ep-toast-error   .ep-toast-title{color:#be123c;}
        .ep-toast-warn    .ep-toast-title{color:#92400e;}
        .ep-toast-msg{font-size:12px;margin:0;}
        .ep-toast-success .ep-toast-msg{color:#16a34a;}
        .ep-toast-error   .ep-toast-msg{color:#e11d48;}
        .ep-toast-warn    .ep-toast-msg{color:#b45309;}
        .ep-toast-x{background:none;border:none;cursor:pointer;font-size:12px;opacity:0.4;transition:opacity 0.2s;flex-shrink:0;padding:2px;}
        .ep-toast-x:hover{opacity:0.9;}
        .ep-toast-bar{position:absolute;bottom:0;left:0;height:3px;animation:epShrink 3.6s linear forwards;}
        .ep-toast-success .ep-toast-bar{background:#4ade80;}
        .ep-toast-error   .ep-toast-bar{background:#fb7185;}
        .ep-toast-warn    .ep-toast-bar{background:#fbbf24;}
        @keyframes epShrink{from{width:100%}to{width:0%}}

        /* Updated Media Gallery Styles */
        .ep-media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .ep-media-thumb {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e2e8f0;
          aspect-ratio: 1;
          background: #f1f5f9;
          transition: all 0.2s;
        }
        .ep-media-thumb:hover {
          border-color: #3b82f6;
          transform: scale(1.02);
        }
        .ep-media-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ep-media-remove {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .ep-media-remove:hover {
          background: #dc2626;
          transform: scale(1.1);
        }
        .ep-video-preview {
          margin-top: 10px;
          position: relative;
        }
        .ep-video-preview video {
          width: 100%;
          border-radius: 8px;
          max-height: 200px;
        }
        .ep-existing-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 6px;
          display: block;
        }
        .ep-video-thumbnail {
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          color: white;
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .ep-video-thumbnail .play-icon {
          width: 60px;
          height: 60px;
          background: rgba(169, 124, 80, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          border: 2px solid #a97c50;
        }
        .ep-video-thumbnail .play-icon svg {
          width: 28px;
          height: 28px;
          color: #a97c50;
          margin-left: 4px;
        }
        .ep-video-thumbnail p {
          color: rgba(255,255,255,0.7);
          font-size: 13px;
        }

        /* Upload area styling */
        .ep-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
        }
        .ep-upload-area:hover {
          border-color: #3b82f6;
          background: #f0f6ff;
        }
        .ep-upload-area.dragover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .ep-upload-counter {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        .ep-file-input-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .ep-file-input-wrapper input[type="file"] {
          flex: 1;
          padding: 10px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          background: #f8faff;
          font-size: 13px;
          min-width: 150px;
        }
        .ep-file-input-wrapper input[type="file"]:hover {
          border-color: #bfdbfe;
          background: #f0f6ff;
        }
        .ep-file-input-wrapper input[type="file"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ep-image-counter {
          font-size: 11px;
          color: #6b7280;
          margin-left: 8px;
          font-weight: 400;
        }
        .ep-image-warning {
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
          margin-left: 8px;
        }
        .ep-image-index {
          position: absolute;
          bottom: 4px;
          left: 4px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
      `}</style>

      <ToastPortal toasts={toasts} remove={remove} />

      <div className="ep-page">
        <div className="ep-deco ep-deco-1" />
        <div className="ep-deco ep-deco-2" />

        <div className="ep-card">
          <div className="ep-stripe" />

          <div className="ep-header">
            <div className="ep-header-icon">✏️</div>
            <div className="ep-header-text">
              <h1>Edit Product</h1>
              <p>Update product details below</p>
              <div className="ep-id-chip">
                <span className="ep-id-dot" />
                Product ID: #{id}
              </div>
            </div>
          </div>

          <div className="ep-body">
            <p className="ep-section">Basic Info</p>

            <div className="ep-field">
              <label className="ep-label">Product Name <span style={{color:"#ef4444"}}>*</span></label>
              {fetching
                ? <div className="ep-skel" />
                : <div className="ep-input-wrap">
                    <span className="ep-input-icon">🏷️</span>
                    <input className="ep-input" placeholder="Product name"
                      value={form.name}
                      onChange={e => set("name", e.target.value)} />
                  </div>
              }
            </div>

            <div className="ep-field">
              <label className="ep-label">Product Code</label>
              <div className="ep-input-wrap">
                <span className="ep-input-icon">🔢</span>
                <input
                  className="ep-input"
                  placeholder="e.g. PRD001"
                  value={form.product_code}
                  onChange={e => set("product_code", e.target.value)}
                />
              </div>
            </div>

            <div className="ep-field">
              <label className="ep-label">Category <span style={{color:"#ef4444"}}>*</span></label>
              {fetching
                ? <div className="ep-skel" />
                : <div className="ep-select-wrap ep-input-wrap">
                    <span className="ep-input-icon">🗂️</span>
                    <select className="ep-select"
                      value={form.category_id}
                      onChange={e => set("category_id", e.target.value)}>
                      <option value="">Select a category…</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <span className="ep-select-arrow">▾</span>
                  </div>
              }
            </div>

            <div className="ep-field">
              <label className="ep-label">Product Description</label>
              {fetching
                ? <div className="ep-skel" />
                : <textarea
                    className="ep-input"
                    style={{ minHeight: "110px", paddingTop: "14px", resize: "vertical" }}
                    placeholder="Describe the bridal product, fabric, and design"
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                  />
              }
            </div>

            <div className="ep-field">
              <label className="ep-label">AI Search Keywords</label>
              {fetching
                ? <div className="ep-skel" />
                : <>
                    <textarea
                      className="ep-input"
                      style={{ minHeight: "110px", paddingTop: "14px", resize: "vertical" }}
                      placeholder="Comma-separated keywords for search relevance"
                      value={form.keywords}
                      onChange={e => set("keywords", e.target.value)}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ color: "#64748b", fontSize: 12 }}>
                        Generate keywords automatically from product details.
                      </span>
                      <button
                        type="button"
                        className="ep-gen-btn"
                        onClick={async () => {
                          if (!form.name.trim() && !form.description.trim()) {
                            show("warn", "Missing Product Data", "Provide a product name or description first.");
                            return;
                          }
                          setKeywordsLoading(true);
                          try {
                            const categoryName = categories.find(c => String(c.id) === String(form.category_id))?.name || "";
                            const res = await api.post("/product/generate_keywords.php", {
                              product_name: form.name,
                              category_name: categoryName,
                              description: form.description,
                              price: form.price,
                              color: form.color,
                              fabric: form.fabric,
                              work_type: form.embroidery,
                              occasion: form.occasion,
                              additional: [form.available_sizes, form.unit, form.barcode].filter(Boolean).join(", "),
                            });
                            if (res.data.status) {
                              set("keywords", res.data.data);
                              show("success", "Keywords Generated", "AI keywords have been populated. Review and save.");
                            } else {
                              show("error", "AI Generation Failed", res.data.message || "Unable to generate keywords.");
                            }
                          } catch (err) {
                            console.error(err);
                            show("error", "AI Error", "Unable to reach the keyword generator.");
                          } finally {
                            setKeywordsLoading(false);
                          }
                        }}
                        disabled={keywordsLoading}
                      >
                        {keywordsLoading ? "Generating..." : "Generate Keywords"}
                      </button>
                    </div>
                  </>
              }
            </div>

            <div className="ep-grid-2">
              <div className="ep-field">
                <label className="ep-label">Occasion</label>
                {fetching
                  ? <div className="ep-skel" />
                  : <div className="ep-input-wrap">
                      <input
                        className="ep-input"
                        placeholder="e.g. Bridal, Wedding, Reception"
                        value={form.occasion}
                        onChange={e => set("occasion", e.target.value)}
                      />
                    </div>
                }
              </div>
              <div className="ep-field">
                <label className="ep-label">Fabric</label>
                {fetching
                  ? <div className="ep-skel" />
                  : <div className="ep-input-wrap">
                      <input
                        className="ep-input"
                        placeholder="e.g. Silk, Velvet, Net"
                        value={form.fabric}
                        onChange={e => set("fabric", e.target.value)}
                      />
                    </div>
                }
              </div>
            </div>

            <div className="ep-grid-2">
              <div className="ep-field">
                <label className="ep-label">Embroidery / Work</label>
                {fetching
                  ? <div className="ep-skel" />
                  : <div className="ep-input-wrap">
                      <input
                        className="ep-input"
                        placeholder="e.g. Zari, Sequins, Thread"
                        value={form.embroidery}
                        onChange={e => set("embroidery", e.target.value)}
                      />
                    </div>
                }
              </div>
              <div className="ep-field">
                <label className="ep-label">Color</label>
                {fetching
                  ? <div className="ep-skel" />
                  : <div className="ep-input-wrap">
                      <input
                        className="ep-input"
                        placeholder="e.g. Ivory, Champagne, Red"
                        value={form.color}
                        onChange={e => set("color", e.target.value)}
                      />
                    </div>
                }
              </div>
            </div>

            <div className="ep-field">
              <label className="ep-label">Available Sizes</label>
              {fetching
                ? <div className="ep-skel" />
                : <div className="ep-input-wrap">
                    <input
                      className="ep-input"
                      placeholder="e.g. S, M, L, XL"
                      value={form.available_sizes}
                      onChange={e => set("available_sizes", e.target.value)}
                    />
                  </div>
              }
            </div>

            {/* ── Media ── */}
            <p className="ep-section" style={{marginTop:"1.25rem"}}>📷 Media</p>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="ep-field">
                <label className="ep-label">
                  Existing Images ({existingImages.length})
                  <span className="ep-image-counter">(Total: {totalImages}/5)</span>
                </label>
                <div className="ep-media-grid">
                  {existingImages.map((img, index) => (
                    <div key={index} className="ep-media-thumb">
                      <img src={resolveImageUrl(img)} alt={`existing-${index}`} />
                      <button
                        type="button"
                        className="ep-media-remove"
                        onClick={() => handleRemoveExistingImage(index)}
                      >
                        ✕
                      </button>
                      <span className="ep-image-index">{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div className="ep-field">
              <label className="ep-label">
                Add New Images (Max 5 total)
                <span className="ep-image-counter">({totalImages}/5 uploaded)</span>
                {totalImages >= 5 && (
                  <span className="ep-image-warning">⚠️ Maximum 5 images reached</span>
                )}
              </label>
              <div className="ep-file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFilesChange}
                  disabled={totalImages >= 5}
                />
                {totalImages >= 5 && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "500" }}>
                    ⚠️ Maximum 5 images reached
                  </span>
                )}
              </div>
              {galleryPreviews.length > 0 && (
                <div className="ep-media-grid">
                  {galleryPreviews.map((src, index) => (
                    <div key={index} className="ep-media-thumb">
                      <img src={src} alt={`preview-${index}`} />
                      <button
                        type="button"
                        className="ep-media-remove"
                        onClick={() => handleRemoveNewImage(index)}
                      >
                        ✕
                      </button>
                      <span className="ep-image-index">{existingImages.length + index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Video Section ── */}
            <div className="ep-field">
              <label className="ep-label">🎬 Product Video</label>
              
              {/* Show current video if exists */}
              {hasVideo && !newVideoFile && !videoPreview && existingVideo && (
                <div className="ep-video-preview" style={{ marginBottom: "12px" }}>
                  <span className="ep-existing-label">Current Video</span>
                  <div style={{ position: "relative", background: "#000", borderRadius: "8px", overflow: "hidden" }}>
                    <video
                      src={resolveVideoUrl(existingVideo)}
                      controls
                      style={{ width: "100%", maxHeight: "300px" }}
                    />
                    <button
                      type="button"
                      className="ep-media-remove"
                      style={{ top: "8px", right: "8px", background: "rgba(255,0,0,0.9)" }}
                      onClick={() => {
                        setExistingVideo("");
                        setVideoURL("");
                        setHasVideo(false);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Show new video preview */}
              {videoPreview && (
                <div className="ep-video-preview" style={{ marginBottom: "12px" }}>
                  <span className="ep-existing-label">New Video</span>
                  <div style={{ position: "relative", background: "#000", borderRadius: "8px", overflow: "hidden" }}>
                    <video
                      src={videoPreview}
                      controls
                      style={{ width: "100%", maxHeight: "300px" }}
                    />
                    <button
                      type="button"
                      className="ep-media-remove"
                      style={{ top: "8px", right: "8px", background: "rgba(255,0,0,0.9)" }}
                      onClick={handleClearVideo}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* No video message */}
              {!hasVideo && !videoPreview && !newVideoFile && (
                <div className="ep-gst-disabled" style={{ padding: "20px", textAlign: "center", marginBottom: "12px" }}>
                  <span>🎬</span>
                  <span>No video uploaded for this product</span>
                </div>
              )}

              {/* Upload new video */}
              <div style={{ marginTop: "8px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                  Upload New Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  style={{ width: "100%", padding: "8px 0" }}
                />
              </div>
            </div>

            {/* Video URL */}
            <div className="ep-field">
              <label className="ep-label">Video URL (Remote)</label>
              <div className="ep-input-wrap">
                <input
                  className="ep-input"
                  placeholder="Paste remote video URL (e.g., https://example.com/video.mp4)"
                  value={videoURL}
                  onChange={handleVideoURLChange}
                />
              </div>
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                💡 Paste a direct video URL from YouTube, Vimeo, or other hosting service
              </p>
            </div>

            {/* ── Pricing & Stock ── */}
            <p className="ep-section" style={{marginTop:"1.25rem"}}>Pricing & Stock</p>

            <div className="ep-grid-2">
              <div>
                <label className="ep-label">Price (₹) <span style={{color:"#ef4444"}}>*</span></label>
                {fetching
                  ? <div className="ep-skel" />
                  : <div className="ep-input-wrap">
                      <span className="ep-prefix">₹</span>
                      <input type="number" className="ep-input" placeholder="0.00"
                        value={form.price}
                        onChange={e => set("price", e.target.value)} />
                    </div>
                }
              </div>
              <div>
                <label className="ep-label">Stock Qty <span style={{color:"#ef4444"}}>*</span></label>
                {fetching
                  ? <div className="ep-skel" />
                  : <div className="ep-input-wrap">
                      <span className="ep-input-icon">📦</span>
                      <input type="number" className="ep-input" placeholder="0"
                        value={form.stock}
                        onChange={e => set("stock", e.target.value)} />
                    </div>
                }
              </div>
            </div>

            <div className="ep-field">
              <label className="ep-label">Unit <span style={{color:"#ef4444"}}>*</span></label>
              {fetching
                ? <div className="ep-skel" />
                : <div className="ep-input-wrap">
                    <span className="ep-input-icon">📏</span>
                    <input
                      className="ep-input"
                      placeholder="e.g. kg / litre / piece"
                      value={form.unit}
                      onChange={e => set("unit", e.target.value)}
                    />
                  </div>
              }
            </div>

            {/* ── GST ── */}
            <div className="ep-field">
              <label className="ep-label">
                GST
                {!gstLoading && (
                  <span className={`ep-gst-badge ${gstEnabled ? "on" : "off"}`}>
                    {gstEnabled ? "✓ Enabled" : "✕ Disabled"}
                  </span>
                )}
              </label>

              {(gstLoading || fetching) ? (
                <div className="ep-skel" />
              ) : gstEnabled ? (
                <div className="ep-input-wrap ep-gst-field">
                  <span className="ep-input-icon" style={{fontWeight:700, fontSize:13, color:"#64748b"}}>%</span>
                  <input
                    type="number"
                    className="ep-input"
                    placeholder="Enter GST % (e.g. 18)"
                    value={form.gst}
                    min="0"
                    max="100"
                    onChange={e => set("gst", e.target.value)}
                  />
                </div>
              ) : (
                <div className="ep-gst-disabled">
                  <span>🚫</span>
                  <span>GST not applicable for this company (without GST plan)</span>
                </div>
              )}
            </div>

            {/* ── Barcode ── */}
            <div className="ep-divider" />
            <p className="ep-section">Barcode</p>

            <div className="ep-barcode-row">
              <div className="ep-barcode-iw">
                <label className="ep-label">Barcode Number</label>
                <div className="ep-input-wrap">
                  <span className="ep-input-icon">｜｜</span>
                  <input className="ep-input" placeholder="Enter or auto-generate"
                    value={form.barcode}
                    onChange={e => { set("barcode", e.target.value); setBarcodeKey(k=>k+1); }} />
                </div>
              </div>
              <button className="ep-gen-btn" onClick={generateBarcode}>⚡ Auto</button>
            </div>

            {form.barcode && (
              <div className="ep-barcode-preview" key={barcodeKey}>
                <p className="ep-barcode-label">Barcode Preview</p>
                <Barcode value={form.barcode} height={55} fontSize={13} margin={0} />
              </div>
            )}

            <div className="ep-divider" />

            <button className="ep-submit" onClick={handleUpdate} disabled={loading || fetching || gstLoading}>
              {loading
                ? <><div className="ep-spinner" /> Updating…</>
                : <>💾 Update Product</>
              }
            </button>
            <button className="ep-cancel" onClick={() => navigate("/products")}>
              Cancel
            </button>

          </div>
        </div>
      </div>
    </>
  );
}