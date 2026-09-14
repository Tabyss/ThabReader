import type { BookMeta } from "../../../App";

const DriveBookItem: React.FC<{
    book: BookMeta;
    isDownloaded: boolean;
    isDownloading: boolean;
    onDownload: (book: BookMeta) => void;
}> = ({ book, isDownloaded, isDownloading, onDownload }) => {
    return (
        <div className="flex justify-between items-center bg-[#D3D3D3] border border-[#222222] p-4 rounded-xl">
            <div className="pr-4">
                <h3 className="font-semibold text-sm line-clamp-1">
                    {book.name}
                </h3>
                <p className="text-xs opacity-50 uppercase mt-1">
                    {book.mimeType.includes("pdf")
                        ? "PDF Document"
                        : "EPUB eBook"}
                </p>
            </div>
            <button
                onClick={() => onDownload(book)}
                disabled={isDownloading || isDownloaded}
                className={`shrink-0 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                    isDownloaded
                        ? "bg-transparent text-green-500 border border-green-500/30"
                        : "bg-white text-black hover:bg-gray-200"
                }`}
            >
                {isDownloading
                    ? "Loading..."
                    : isDownloaded
                      ? "Downloaded"
                      : "Download"}
            </button>
        </div>
    );
};

export default DriveBookItem;
