import React, { useState, useEffect } from "react";
import ePub from "epubjs";
import { set, get, keys } from "idb-keyval";
import {
    initGoogleAuth,
    fetchDriveFiles,
    downloadDriveFile,
} from "../services/gdriveAuth";
import type { BookMeta } from "../App";

interface ShelfViewProps {
    onOpenBook: (book: BookMeta) => void;
}

const LocalBookCard: React.FC<{ book: BookMeta; onClick: () => void }> = ({
    book,
    onClick,
}) => {
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        let epubBook: any = null;

        const loadData = async () => {
            const savedProgress = localStorage.getItem(`${book.id}-progress`);
            if (savedProgress) setProgress(parseFloat(savedProgress));

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
            {/* Area Cover Buku */}
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

            {/* Info Buku & Progress Bar */}
            <div className="group p-3 flex flex-col flex-1 justify-between bg-[#D3D3D3] group-hover:bg-[#333] z-10">
                <h3
                    className="font-semibold text-xs sm:text-sm line-clamp-2 mb-2 text-[#333333] group-hover:text-[#d3d3d3]"
                    title={book.name}
                >
                    {book.name.replace(/\.[^/.]+$/, "")}
                </h3>

                <div className="w-full mt-auto">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                        <span>{progress > 0 ? "Reading" : "New"}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    {/* Progress Bar Track */}
                    <div className="w-full h-1.5 bg-[#333333] rounded-full overflow-hidden">
                        {/* Progress Bar Fill */}
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

export const ShelfView: React.FC<ShelfViewProps> = ({ onOpenBook }) => {
    const [localBooks, setLocalBooks] = useState<BookMeta[]>([]);
    const [driveBooks, setDriveBooks] = useState<BookMeta[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const loadLocalBooks = async () => {
            const storedKeys = await keys();
            const meta = localStorage.getItem("ThabReader-library");
            if (meta) {
                const parsedMeta: BookMeta[] = JSON.parse(meta);
                const validBooks = parsedMeta.filter((book) =>
                    storedKeys.includes(book.id),
                );
                setLocalBooks(validBooks);
            }
        };
        loadLocalBooks();
    }, []);

    const handleGoogleLogin = () => {
        setIsSyncing(true);
        initGoogleAuth(async (accessToken) => {
            setToken(accessToken);
            try {
                const response = await fetchDriveFiles(accessToken);
                setDriveBooks(response.files || []);
            } catch (error) {
                console.error("Gagal mengambil file:", error);
            } finally {
                setIsSyncing(false);
            }
        });
    };

    const handleDownloadAndOpen = async (book: BookMeta) => {
        const existingBlob = await get(book.id);
        if (existingBlob) {
            onOpenBook(book);
            return;
        }

        if (!token)
            return alert(
                "Silakan sinkronisasi dengan Google Drive terlebih dahulu.",
            );

        setDownloadingId(book.id);
        try {
            const blob = await downloadDriveFile(token, book.id);

            await set(book.id, blob);

            const updatedLibrary = [...localBooks, book];
            localStorage.setItem(
                "ThabReader-library",
                JSON.stringify(updatedLibrary),
            );
            setLocalBooks(updatedLibrary);

            onOpenBook(book);
        } catch (error) {
            console.error("Gagal mengunduh buku:", error);
            alert("Gagal mengunduh file.");
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#D3D3D3] text-[#333333] p-6 mx-auto">
            <header className="flex justify-between items-center py-6 mb-8 border-b border-[#333333]">
                <h1 className="text-3xl font-bold tracking-tight">ThabReader</h1>
                <button
                    onClick={handleGoogleLogin}
                    disabled={isSyncing}
                    className="bg-[#333333] hover:bg-[#222222] border border-[#333333] text-white px-5 py-2 rounded-full font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isSyncing ? "Syncing..." : "Sync Drive"}
                </button>
            </header>

            <section className="mb-12">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6">
                    Local Library
                </h2>
                {localBooks.length === 0 ? (
                    <div className="h-40 flex items-center justify-center border-2 border-dashed border-[#333333] rounded-2xl">
                        <p className="opacity-40 italic font-medium">
                            Rak buku kosong. Sinkronisasikan Google Drive Anda.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {localBooks.map((book) => (
                            <LocalBookCard
                                key={book.id}
                                book={book}
                                onClick={() => handleDownloadAndOpen(book)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {driveBooks.length > 0 && (
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4">
                        Available on Drive
                    </h2>
                    <div className="flex flex-col gap-3">
                        {driveBooks.map((book) => {
                            const isDownloaded = localBooks.some(
                                (l) => l.id === book.id,
                            );
                            return (
                                <div
                                    key={book.id}
                                    className="flex justify-between items-center bg-[#D3D3D3] border border-[#222222] p-4 rounded-xl"
                                >
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
                                        onClick={() =>
                                            handleDownloadAndOpen(book)
                                        }
                                        disabled={
                                            downloadingId === book.id ||
                                            isDownloaded
                                        }
                                        className={`shrink-0 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                                            isDownloaded
                                                ? "bg-transparent text-green-500 border border-green-500/30"
                                                : "bg-white text-black hover:bg-gray-200"
                                        }`}
                                    >
                                        {downloadingId === book.id
                                            ? "Loading..."
                                            : isDownloaded
                                              ? "Downloaded"
                                              : "Download"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};
