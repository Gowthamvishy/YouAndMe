import { useState } from 'react';
import FileUpload from './components/FileUpload';
import FileDownload from './components/FileDownload';
import InviteCode from './components/InviteCode';
import axios from 'axios';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [port, setPort] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles(files);
    setIsUploading(true);
    setPort(null);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await axios.post(`${backendUrl}/api/upload-multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPort(response.data.port);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please ensure the backend is running and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStopSharing = async () => {
    if (!port) return;
    try {
      await axios.delete(`${backendUrl}/api/cleanup/${port}`);
      setUploadedFiles([]);
      setPort(null);
      alert('Sharing stopped and files deleted.');
    } catch (error) {
      console.error('Error stopping sharing:', error);
      alert('Failed to stop sharing. Try again.');
    }
  };

  const handleDownload = async (portToDownload: number) => {
    setIsDownloading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/download/${portToDownload}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shared-files.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading files:', error);
      alert('Failed to download files. Please check the invite code and try again.');
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
                activeTab === 'upload'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-red-600'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              Share your files
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'download'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-red-600'
              }`}
              onClick={() => setActiveTab('download')}
            >
              Receive your files
            </button>
          </div>
          {activeTab === 'upload' ? (
            <div>
              <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />
              {uploadedFiles.length > 0 && !isUploading && (
                <div className="mt-4 p-3 bg-red-100 rounded-md">
                  <p className="text-sm text-red-700 font-medium">Selected files:</p>
                  <ul className="list-disc ml-5 text-sm text-red-700">
                    {uploadedFiles.map((file, idx) => (
                      <li key={idx}>
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {isUploading && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
                  <p className="mt-2 text-red-600">Uploading...</p>
                </div>
              )}
              <InviteCode port={port} />
              {port && (
                <div className="mt-4 text-center">
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    onClick={handleStopSharing}
                  >
                    Stop Sharing
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <FileDownload onDownload={handleDownload} isDownloading={isDownloading} />
              {isDownloading && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
                  <p className="mt-2 text-red-600">Downloading...</p>
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
