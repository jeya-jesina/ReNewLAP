// import React, { useState } from "react";
// import api from "../services/api";

// function BulkVideoUpload({ categoryId, categoryName, onUploadComplete }) {
//   const [videos, setVideos] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [errors, setErrors] = useState([]);
//   const [isOpen, setIsOpen] = useState(true);

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     const videoFiles = files.map(file => ({
//       file,
//       title: file.name.replace(/\.[^/.]+$/, ""),
//       preview: URL.createObjectURL(file)
//     }));
//     setVideos(prev => [...prev, ...videoFiles]);
//   };

//   const removeVideo = (index) => {
//     setVideos(prev => prev.filter((_, i) => i !== index));
//   };

//   const updateTitle = (index, newTitle) => {
//     setVideos(prev => prev.map((item, i) => 
//       i === index ? { ...item, title: newTitle } : item
//     ));
//   };

//   const handleUpload = async () => {
//     if (videos.length === 0) {
//       alert("Please select videos to upload");
//       return;
//     }

//     if (!categoryId) {
//       alert("Category ID is required");
//       return;
//     }

//     setLoading(true);
//     setProgress(0);
//     setErrors([]);

//     const formData = new FormData();
//     formData.append('category_id', categoryId);
    
//     videos.forEach((item, index) => {
//       formData.append('videos[]', item.file);
//       formData.append('video_titles[]', item.title);
//     });

//     try {
//       const res = await api.post("/category/bulk_upload_videos.php", formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         onUploadProgress: (progressEvent) => {
//           if (progressEvent.total) {
//             const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             setProgress(percentCompleted);
//           }
//         }
//       });

//       if (res.data.status) {
//         setUploadedFiles(res.data.data.uploaded || []);
//         setErrors(res.data.data.errors || []);
//         alert(`${res.data.data.total} videos uploaded successfully!`);
//         setVideos([]);
//         if (onUploadComplete) {
//           onUploadComplete();
//         }
//       } else {
//         alert(res.data.message || "Upload failed");
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       alert("Failed to upload videos. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="border border-gray-200 rounded-lg overflow-hidden">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left font-semibold text-gray-700"
//       >
//         <span className="flex items-center gap-2">
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//           </svg>
//           Bulk Video Upload {categoryName && `for "${categoryName}"`}
//         </span>
//         <span>{isOpen ? '▲' : '▼'}</span>
//       </button>

//       {isOpen && (
//         <div className="p-4 bg-white">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select Videos (MP4, WEBM, OGG - Max 100MB each)
//             </label>
//             <input
//               type="file"
//               accept="video/*"
//               multiple
//               onChange={handleFileChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               disabled={loading}
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               You can select multiple videos at once
//             </p>
//           </div>

//           {videos.length > 0 && (
//             <div className="mb-4">
//               <h4 className="font-semibold mb-2">{videos.length} videos selected</h4>
//               <div className="max-h-60 overflow-y-auto space-y-2">
//                 {videos.map((item, index) => (
//                   <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
//                     <video className="w-20 h-14 object-cover rounded" src={item.preview} />
//                     <input
//                       type="text"
//                       value={item.title}
//                       onChange={(e) => updateTitle(index, e.target.value)}
//                       className="flex-1 p-1 border rounded text-sm"
//                       placeholder="Video title"
//                     />
//                     <button
//                       onClick={() => removeVideo(index)}
//                       className="text-red-500 hover:text-red-700"
//                       disabled={loading}
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {loading && (
//             <div className="mb-4">
//               <div className="w-full bg-gray-200 rounded-full h-2.5">
//                 <div
//                   className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//                   style={{ width: `${progress}%` }}
//                 ></div>
//               </div>
//               <p className="text-sm text-gray-600 mt-1">Uploading... {progress}%</p>
//             </div>
//           )}

//           {errors.length > 0 && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-red-600 font-semibold">Errors:</p>
//               <ul className="list-disc list-inside text-sm text-red-500">
//                 {errors.map((error, index) => (
//                   <li key={index}>{error}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           <button
//             onClick={handleUpload}
//             disabled={loading || videos.length === 0}
//             className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${
//               loading || videos.length === 0
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-blue-600 hover:bg-blue-700'
//             }`}
//           >
//             {loading ? 'Uploading...' : `Upload ${videos.length} Videos`}
//           </button>

//           {uploadedFiles.length > 0 && (
//             <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
//               <p className="text-green-600 font-semibold">✅ Uploaded Successfully:</p>
//               <ul className="list-disc list-inside text-sm text-green-600">
//                 {uploadedFiles.map((file, index) => (
//                   <li key={index}>{file.original_name} → {file.filename}</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default BulkVideoUpload;

import React, { useState } from "react";
import api from "../services/api";

function BulkVideoUpload({ categoryId, categoryName, onUploadComplete }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const videoFiles = files.map((file, index) => ({
      file,
      title: "", // Empty by default - user must enter
      preview: URL.createObjectURL(file),
      originalName: file.name
    }));
    setVideos(prev => [...prev, ...videoFiles]);
  };

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const updateTitle = (index, newTitle) => {
    setVideos(prev => prev.map((item, i) => 
      i === index ? { ...item, title: newTitle } : item
    ));
  };

  const handleUpload = async () => {
    if (videos.length === 0) {
      alert("Please select videos to upload");
      return;
    }

    // Check if any video has empty title
    const emptyTitle = videos.some(item => !item.title || item.title.trim() === "");
    if (emptyTitle) {
      alert("Please enter titles for all videos before uploading");
      return;
    }

    if (!categoryId) {
      alert("Category ID is required");
      return;
    }

    setLoading(true);
    setProgress(0);
    setErrors([]);

    const formData = new FormData();
    formData.append('category_id', categoryId);
    
    videos.forEach((item, index) => {
      formData.append('videos[]', item.file);
      formData.append('video_titles[]', item.title.trim());
    });

    try {
      console.log("Uploading videos with titles...");
      
      const res = await api.post("/category/bulk_upload_videos.php", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        }
      });

      console.log("Upload response:", res.data);

      if (res.data.status) {
        setUploadedFiles(res.data.data.uploaded || []);
        setErrors(res.data.data.errors || []);
        alert(`${res.data.data.total} videos uploaded successfully!`);
        setVideos([]);
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        alert(res.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left font-semibold text-gray-700"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Bulk Video Upload {categoryName && `for "${categoryName}"`}
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="p-4 bg-white">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Videos (MP4, WEBM, OGG - Max 100MB each)
            </label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              You can select multiple videos at once. Enter a title for each video below.
            </p>
          </div>

          {videos.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">{videos.length} videos selected</h4>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {videos.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <video className="w-24 h-16 object-cover rounded" src={item.preview} />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateTitle(index, e.target.value)}
                        className={`w-full p-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 ${
                          item.title.trim() === '' 
                            ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                        }`}
                        placeholder={`Enter title for video ${index + 1}...`}
                        disabled={loading}
                      />
                      {item.title.trim() === '' && (
                        <p className="text-xs text-red-500 mt-1">⚠️ Please enter a title</p>
                      )}
                      <p className="text-xs text-gray-400 truncate mt-1">
                        File: {item.originalName}
                      </p>
                    </div>
                    <button
                      onClick={() => removeVideo(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Uploading... {progress}%</p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-semibold">Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-500">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || videos.length === 0}
            className={`w-full py-2.5 px-4 rounded-lg text-white font-semibold ${
              loading || videos.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Uploading...' : `Upload ${videos.length} Videos`}
          </button>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 font-semibold">✅ Uploaded Successfully:</p>
              <ul className="list-disc list-inside text-sm text-green-600">
                {uploadedFiles.map((file, index) => (
                  <li key={index}>{file.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BulkVideoUpload;