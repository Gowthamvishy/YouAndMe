import { useState } from "react";
import { FiDownload } from "react-icons/fi";

interface FileDownloadProps {
  onDownload: (port: number) => Promise<void>;
  isDownloading: boolean;
}

export default function FileDownload({
  onDownload,
  isDownloading,
}: FileDownloadProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const port = parseInt(inviteCode.trim(), 10);

    if (isNaN(port) || port <= 0 || port > 65535) {
      setError("Please enter a valid invite code (1–65535)");
      return;
    }

    // Call parent download handler
    await onDownload(port);
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">
          Receive a File
        </h3>
        <p className="text-sm text-blue-600">
          Enter the invite code shared with you to download the file.
        </p>
      </div>

      {/* Invite Code Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input */}
        <div>
          <label
            htmlFor="inviteCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Invite Code
          </label>
          <input
            type="text"
            id="inviteCode"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter the invite code (port number)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isDownloading}
            required
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        {/* Download Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent 
                     rounded-md shadow-sm text-base font-medium text-white 
                     bg-blue-600 hover:bg-blue-700 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                     disabled:opacity-50"
          disabled={isDownloading || !inviteCode}
        >
          {isDownloading ? (
            <span>Downloading...</span>
          ) : (
            <>
              <FiDownload className="mr-2" />
              <span>Download File</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
