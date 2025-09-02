import { useState } from "react";
import FileUpload from "./components/FileUpload";
import FileDownload from "./components/FileDownload";
import axios from "axios";

interface UploadedFile {
  name: string;
  port: number;
}

function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "download">("upload");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Handle multiple file uploads
  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);

    try {
      const uploaded: UploadedFile[] = []; // ✅ explicitly typed

      for (const file of files) {
    const formData = new FormData();
-   formData.append("file", file);
+   formData.append("files", file); // must match backend param name

    const response = await axios.post(`${backendUrl}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    uploaded.push({ name: file.name, port: response.data.port });
}


      setUploadedFiles((prev) => [...prev, ...uploaded]);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please ensure the backend is running and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Stop sharing a specific file
  const handleStopSharing = async (port: number) => {
    try {
      await axios.delete(`${backendUrl}/api/cleanup/${port}`);
      setUploadedFiles((prev) => prev.filter((f) => f.port !== port));
    } catch (error) {
      console.error("Error stopping sharing:", error);
      alert("Failed to stop sharing. Try again.");
    }
  };

  // ✅ Download with original filename
  const handleDownload = async (portToDownload: number) => {
    setIsDownloading(true);

    try {
      const response = await axios.get(`${backendUrl}/api/download/${portToDownload}`, {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      const mimeType = response.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      let filename = "downloaded-file";
      const filenameRegex = /filename[^;=\n]*=(['"]?)([^;\n]*)\1/;
      const matches = filenameRegex.exec(contentDisposition || "");

      if (matches?.[2]) {
        filename = decodeURIComponent(matches[2]);
      }

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please check the invite code and try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  document.body.style.fontFamily = "'Inter', sans-serif";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-600 mb-2">YouShare</h1>
          <p className="text-xl text-red-800">Secure Our Share</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "upload"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-red-600"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              Share your file
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "download"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-red-600"
              }`}
              onClick={() => setActiveTab("download")}
            >
              Receive your file
            </button>
          </div>

          {activeTab === "upload" ? (
            <div>
              <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />

              {uploadedFiles.length > 0 && !isUploading && (
                <div className="mt-4 space-y-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.port}
                      className="p-3 bg-red-100 rounded-md flex justify-between items-center"
                    >
                      <p className="text-sm text-red-700">
                        {file.name} —{" "}
                        <span className="font-medium">Invite Code: {file.port}</span>
                      </p>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleStopSharing(file.port)}
                      >
                        Stop Sharing
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isUploading && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
                  <p className="mt-2 text-red-600">Uploading</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <FileDownload onDownload={handleDownload} isDownloading={isDownloading} />

              {isDownloading && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
                  <p className="mt-2 text-red-600">Downloading</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
