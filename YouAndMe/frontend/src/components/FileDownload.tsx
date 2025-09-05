import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

interface FileDownloadProps {
  onDownload: (port: number) => void;
  isDownloading: boolean;
}

export default function FileDownload({ onDownload, isDownloading }: FileDownloadProps) {
  const [port, setPort] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const portNum = parseInt(port, 10);
    if (!isNaN(portNum)) {
      onDownload(portNum);
    } else {
      alert('Please enter a valid invite code');
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
