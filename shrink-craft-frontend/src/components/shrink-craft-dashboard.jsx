import React, { useState, useRef } from "react";
import { Upload, FileImage, Trash2, Sliders, Download, CheckCircle, Loader2 } from "lucide-react";

export default function ShrinkCraftDashboard() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(75);
  const [isCompressing, setIsCompressing] = useState(false);
  const [zipUrl, setZipUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Correct binary system formatting
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KiB", "MiB", "GiB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleFileChange = (e) => {
    addFilesToQueue(Array.from(e.target.files));
  };

  const addFilesToQueue = (selectedFiles) => {
    const validExtensions = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    
    const mappedFiles = selectedFiles
      .filter((file) => validExtensions.includes(file.type))
      .map((file) => ({
        id: crypto.randomUUID(),
        file: file,
        name: file.name,
        originalSize: file.size,
        compressedSize: null,
        status: "pending", 
        previewUrl: URL.createObjectURL(file),
        downloadUrl: null, // Track individual download blob link
      }));

    setFiles((prev) => [...prev, ...mappedFiles]);
    setZipUrl(null); 
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.downloadUrl) URL.revokeObjectURL(target.downloadUrl);
      return prev.filter((f) => f.id !== id);
    });
    setZipUrl(null);
  };

  // NEW FEATURE: Reset back to "Compress" state if user slides quality scale after a run
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    if (zipUrl) {
      setZipUrl(null); // Remove global zip link to reveal "Compress Images" button again
      setFiles((prev) => 
        prev.map((f) => ({
          ...f,
          status: "pending", // Reset files back to ready state
          compressedSize: null,
          downloadUrl: null
        }))
      );
    }
  };

  const handleCompressAll = async () => {
    if (files.length === 0) return;
    setIsCompressing(true);
    setFiles((prev) => prev.map((f) => ({ ...f, status: "compressing" })));

    try {
      const formData = new FormData();
      formData.append("quality", quality);
      files.forEach((item) => {
        formData.append("images", item.file);
      });

      const response = await fetch("http://localhost:5000/api/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Compression failed");

      const result = await response.json();

      // Decode global ZIP binary
      const binaryZip = atob(result.zipData);
      const arrayBuffer = new ArrayBuffer(binaryZip.length);
      const uintArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryZip.length; i++) {
        uintArray[i] = binaryZip.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: "application/zip" });
      const downloadUrl = URL.createObjectURL(blob);
      setZipUrl(downloadUrl);

      // NEW FEATURE: Map separate downloadable image blobs directly from the server metrics list
      setFiles((prev) =>
        prev.map((f) => {
          const serverMetric = result.metrics.find((m) => m.name === f.name);
          if (!serverMetric) return f;

          // Convert this single image's Base64 back into its original image type blob
          const binaryImg = atob(serverMetric.base64Data);
          const imgBuffer = new ArrayBuffer(binaryImg.length);
          const imgUint = new Uint8Array(imgBuffer);
          for (let i = 0; i < binaryImg.length; i++) {
            imgUint[i] = binaryImg.charCodeAt(i);
          }
          const imgBlob = new Blob([imgBuffer], { type: f.file.type });
          const singleDownloadUrl = URL.createObjectURL(imgBlob);

          return {
            ...f,
            status: "success",
            compressedSize: serverMetric.realCompressedSize,
            downloadUrl: singleDownloadUrl, // Assigned to the individual file card trigger
          };
        })
      );

    } catch (error) {
      console.error("Transmission error:", error);
      setFiles((prev) => prev.map((f) => ({ ...f, status: "error" })));
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Shrink<span className="text-indigo-500">Craft</span>
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Batch image compression engine. Lossless visual quality, miniature footprint.
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden relative z-20">
          
          {/* Dropzone */}
          <div className="m-6 border-2 border-dashed border-slate-600 bg-slate-850 rounded-xl p-10 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            <div onClick={() => fileInputRef.current?.click()} className="group cursor-pointer max-w-sm mx-auto p-4">
              <Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-400 transition-colors mb-4" />
              <p className="text-base font-medium text-slate-200">
                Drag and drop your files here, or <span className="text-indigo-400 group-hover:underline">browse</span>
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500 pointer-events-none">Supports PNG, JPG, JPEG, and WEBP</p>
          </div>

          {/* Configuration Toolbar */}
          {files.length > 0 && (
            <div className="px-6 py-4 bg-slate-850 border-t border-b border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-30">
              <div className="flex items-center space-x-4 flex-1">
                <Sliders className="h-5 w-5 text-indigo-400 shrink-0" />
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Compression Quality</span>
                    <span className="text-indigo-400">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={quality}
                    // MODIFIED: Uses new slider selection logic handler
                    onChange={(e) => handleQualityChange(Number(e.target.value))}
                    disabled={isCompressing}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 justify-end">
                {!zipUrl ? (
                  <button
                    onClick={handleCompressAll}
                    disabled={isCompressing}
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
                  >
                    {isCompressing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Compress Images</span>
                    )}
                  </button>
                ) : (
                  <a
                    href={zipUrl}
                    download="shrinkcraft-bundle.zip"
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2 animate-fade-in"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download All (ZIP)</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Queue List */}
          {files.length > 0 && (
            <div className="p-6 divide-y divide-slate-700 max-h-96 overflow-y-auto relative z-20">
              {files.map((item) => {
                const saving = item.compressedSize 
                  ? Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100)
                  : null;

                return (
                  <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={item.previewUrl}
                        alt="preview"
                        className="w-10 h-10 object-cover rounded bg-slate-700 border border-slate-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          {formatBytes(item.originalSize)}
                          {item.compressedSize && ` → ${formatBytes(item.compressedSize)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0 justify-end">
                      {item.status === "compressing" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-300">
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Shrinking
                        </span>
                      )}
                      {item.status === "success" && saving && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          -{saving}% saved
                        </span>
                      )}
                      
                      {/* NEW FEATURE: Individual File Action Download Trigger Row */}
                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          download={`compressed-${item.name}`}
                          className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                          title="Download this image"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}

                      <button
                        onClick={() => removeFile(item.id)}
                        disabled={isCompressing}
                        className="text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}