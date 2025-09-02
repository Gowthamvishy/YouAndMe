import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

interface FileDownloadProps {
    onDownload: (port: number) => Promise<void>;
    isDownloading: boolean;
}

export default function FileDownload({ onDownload, isDownloading }: FileDownloadProps) {
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const port = parseInt(inviteCode.trim(), 10);
        if (isNaN(port) || port <= 0 || port > 65535) {
            setError('Please enter a valid invite code (1–65535)');
            return;
        }

        try {
            await onDownload(port);
            setInviteCode(''); // ✅ Clear field after successful download
        } catch {
            setError('Download failed. Please check the invite code and try again.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="text-lg font-medium text-red-800 mb-2">Receive a File</h3>
                <p className="text-sm text-red-600 mb-0">
                    Enter the invite code shared with you to download the file.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                        placeholder="Enter the invite code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        disabled={isDownloading}
                        required
                    />
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
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
