import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface FileDownloadProps {
  onDownload: (port: number) => void; // keep type for compatibility
  isDownloading: boolean;
}

export default function FileDownload({ isDownloading }: FileDownloadProps) {
  const [port, setPort] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const portNum = parseInt(port, 10);
    if (isNaN(portNum)) {
      alert('Please enter a valid invite code');
      return;
    }

    try {
      // Get the zip file as blob
      const response = await axios.get(`${backendUrl}/api/download/${portNum}`, {
        responseType: 'blob',
      });

      // Load into JSZip
      const zip = await JSZip.loadAsync(response.data);

      // Extract all files and trigger download
      zip.forEach(async (relativePath, file) => {
        const content = await file.async('blob');
        saveAs(content, relativePath); // downloads with original filename
      });
    } catch (error) {
      console.error('Error unzipping files:', error);
      alert('Failed to download files. Please check the invite code and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Enter invite code to download files
      </label>
      <input
        type="text"
        value={port}
        onChange={(e) => setPort(e.target.value)}
        placeholder="Invite code"
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        disabled={isDownloading}
      />
      <button
        type="submit"
        disabled={isDownloading}
        className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
      >
        <FiDownload className="mr-2" />
        {isDownloading ? 'Downloading...' : 'Download Files'}
      </button>
    </form>
  );
}
