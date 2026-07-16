import { useRef, useState, useEffect } from "react";
import api from "../../services/api";
import { ImagePlus, UploadCloud, Sparkles } from "lucide-react";

export default function BannerPage() {
  const [bannerTitle, setBannerTitle] = useState("");
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const handleImageChange = (e) => {
    console.log("Banner image change event:", e.target.files);
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (!file) {
      setPreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      console.log("Banner pr eview loaded");
    };
    reader.onerror = (error) => {
      console.error("Banner preview error:", error);
      setPreview("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // bannerTitle (group) is required. subtitle/title is optional. Image required for create; optional for edit.
    if (!bannerTitle.trim()) {
      setMessage({ type: "error", text: "Please provide a Banner Title (group)." });
      return;
    }
    if (!editingId && !imageFile) {
      setMessage({ type: "error", text: "Please choose an image for the banner." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("banner_title", bannerTitle.trim());
    formData.append("title", title.trim());
    if (imageFile instanceof File) formData.append("image", imageFile);
    if (editingId) formData.append("id", editingId);

    for (const [key, value] of formData.entries()) {
      console.log("FormData entry:", key, value);
    }

    try {
      const res = await api.post(editingId ? "banner/update_banner.php" : "banner/add_banner.php", formData);
      console.log("Banner upload response:", res);

      if (res.data?.success) {
        setMessage({ type: "success", text: res.data.message || "Banner saved successfully." });
        setBannerTitle("");
        setTitle("");
        setImageFile(null);
        setPreview("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setEditingId(null);
        // refresh list
        fetchBanners();
      } else {
        setMessage({ type: "error", text: res.data?.message || "Unable to save banner." });
        console.error("Banner upload failed response:", res.data);
      }
    } catch (err) {
      console.error("Banner upload exception:", err);
      setMessage({ type: "error", text: "Server error while saving banner." });
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    setBannersLoading(true);
    try {
      const res = await api.get("banner/get_banners.php");
      setBanners(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch banners", err);
    } finally {
      setBannersLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleEdit = (b) => {
    setEditingId(b.id);
    setBannerTitle(b.banner_title || "");
    setTitle(b.title || "");
    setPreview(b.image || "");
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this banner?")) return;
//     try {
//       const res = await api.post("banner/delete_banner.php", { id });
//       if (res.data?.success) {
//         setMessage({ type: "success", text: res.data.message || "Banner deleted." });
//         setBanners((prev) => prev.filter((x) => String(x.id) !== String(id)));
//       } else {
//         setMessage({ type: "error", text: res.data?.message || "Unable to delete banner." });
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage({ type: "error", text: "Network error while deleting." });
//     }
//   };

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-6">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(37,99,235,0.12)] md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              <Sparkles size={16} />
              Banner Management
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Add a new banner for your store</h1>
            <p className="mt-1 text-sm text-slate-500">
              Upload a banner image and publish it through the existing backend API with the same blue-purple dashboard style.
            </p>
          </div>
        </div>

        {message.text ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Banner Title</label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="e.g. Home Banner"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-blue-500"
                        disabled={!!editingId}
                      />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Banner Subtitle / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Collection"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-blue-500"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Banner Image</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8 text-center transition hover:border-blue-500">
                <UploadCloud size={24} className="mb-2 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Click to upload image</span>
                <span className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-[#1f8cff] to-[#4338ca] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Banner"}
            </button>
          </form>

          <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-[#1f8cff] to-[#4338ca] p-5 text-white">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <ImagePlus size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Preview</h2>
                <p className="text-sm text-white/80">Your selected banner will appear here.</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[20px] border border-white/20 bg-white/10 backdrop-blur-sm">
              {preview ? (
                <img src={preview} alt="Banner preview" className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-white/10 text-center text-sm text-white/80">
                  Upload an image to preview it here.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Existing Banners</h2>
          {bannersLoading ? (
            <div>Loading banners...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full table-auto text-left">
                <thead className="bg-gray-50 text-sm">
                  <tr>
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Banner Title</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {banners.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center">No banners found</td></tr>
                  ) : (
                    banners.map((b) => (
                      <tr key={b.id} className="border-t">
                        <td className="px-4 py-3 align-top w-36">
                          {b.image ? <img src={b.image} alt={b.title} className="h-20 w-full object-cover rounded" /> : <div className="h-20 w-full rounded bg-gray-100"></div>}
                        </td>
                        <td className="px-4 py-3 align-top">{b.banner_title}</td>
                        <td className="px-4 py-3 align-top">{b.title}</td>
                        <td className="px-4 py-3 align-top">{b.category_name}</td>
                        <td className="px-4 py-3 align-top">{b.status}</td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(b)} className="rounded-md bg-blue-600 px-3 py-1 text-white">Edit</button>
                            {/* <button onClick={() => handleDelete(b.id)} className="rounded-md bg-red-600 px-3 py-1 text-white">Delete</button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
