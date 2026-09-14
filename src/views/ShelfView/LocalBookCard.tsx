import ePub from "epubjs";
import { get } from "idb-keyval";
import { useState, useEffect } from "react";
import type { BookMeta } from "../../App";
import { RiDeleteBin5Line } from "react-icons/ri";

const LocalBookCard: React.FC<{
    book: BookMeta;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}> = ({ book, onClick, onDelete }) => {
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        let epubBook: any = null;

        const loadData = async () => {
            const savedProgress = localStorage.getItem(`${book.id}-progress`);
            if (savedProgress) {
                let parsed = parseFloat(savedProgress);
                if (!isNaN(parsed)) {
                    if (parsed > 0 && parsed <= 1) {
                        parsed = parsed * 100;
                    }
                    setProgress(Math.max(0, Math.min(100, parsed)));
                }
            }

            const blob = await get<Blob>(book.id);
            if (blob && !book.mimeType.includes("pdf")) {
                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    epubBook = ePub(arrayBuffer);
                    const url = await epubBook.coverUrl();
                    if (url) setCoverUrl(url);
                } catch (error) {
                    console.error("Gagal memuat cover:", error);
                }
            }
        };

        loadData();

        return () => {
            if (epubBook) epubBook.destroy();
        };
    }, [book]);

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col bg-[#D3D3D3] border border-[#333333] rounded-md overflow-hidden cursor-pointer transition-all duration-300"
        >
            <button
                onClick={onDelete}
                className="absolute top-0 right-0 z-20 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Hapus dari Local"
            >
               <RiDeleteBin5Line />
            </button>

            <div className="relative aspect-2/3 w-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={book.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    />
                ) : (
                    <div className="p-4 text-center">
                        <span className="text-sm uppercase font-bold opacity-30">
                            {book.mimeType.includes("pdf") ? "PDF" : "NO COVER"}
                        </span>
                    </div>
                )}
            </div>

            <div className="group p-3 flex flex-col flex-1 justify-between bg-[#D3D3D3] group-hover:bg-[#333] z-10">
                <h3
                    className="font-semibold text-xs sm:text-sm line-clamp-2 mb-2 text-[#333333] group-hover:text-[#d3d3d3]"
                    title={book.name}
                >
                    {book.name.replace(/\.[^/.]+$/, "")}
                </h3>
                <div className="w-full mt-auto">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                        <span>
                            {progress > 0
                                ? progress >= 100
                                    ? "Finished"
                                    : "Reading"
                                : "New"}
                        </span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#333333] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocalBookCard;
