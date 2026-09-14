import type { BookMeta } from "../../App";
import DriveBookItem from "./DriveBookItem";

const DriveTab: React.FC<{
    driveBooks: BookMeta[];
    localBooks: BookMeta[];
    downloadingId: string | null;
    onDownloadBook: (book: BookMeta) => void;
}> = ({ driveBooks, localBooks, downloadingId, onDownloadBook }) => {
    return (
        <div className="mt-6">
            <div className="mb-5">
                <p className="text-xs opacity-60 font-medium">
                    * Only displays files (EPUB/PDF) from the{" "}
                    <strong>"Books"</strong> folder in your Google Drive.
                </p>
            </div>

            {driveBooks.length === 0 ? (
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-[#333333] rounded-2xl">
                    <p className="opacity-40 italic font-medium">
                        There are no books in Google Drive. Please click "Sync
                        Drive" above.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {driveBooks.map((book) => (
                        <DriveBookItem
                            key={book.id}
                            book={book}
                            isDownloaded={localBooks.some(
                                (l) => l.id === book.id,
                            )}
                            isDownloading={downloadingId === book.id}
                            onDownload={onDownloadBook}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DriveTab;
