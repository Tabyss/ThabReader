import { keys, set, del, get } from "idb-keyval";
import { useState, useEffect } from "react";
import type { BookMeta } from "../../App";
import {
    initGoogleAuth,
    fetchDriveFiles,
    downloadDriveFile,
} from "../../services/gdriveAuth";
import DriveTab from "./components/DriveTab";
import LocalTab from "./components/LocalTab";
import { AiOutlineCloudSync, AiOutlineSync } from "react-icons/ai";

interface ShelfViewProps {
    onOpenBook: (book: BookMeta) => void;
}

export const ShelfView: React.FC<ShelfViewProps> = ({ onOpenBook }) => {
    const [activeTab, setActiveTab] = useState<"local" | "drive">("local");
    const [localBooks, setLocalBooks] = useState<BookMeta[]>([]);
    const [driveBooks, setDriveBooks] = useState<BookMeta[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const loadLibraries = async () => {
            const storedKeys = await keys();
            const localMeta = localStorage.getItem("ThabReader-library");
            if (localMeta) {
                const parsedMeta: BookMeta[] = JSON.parse(localMeta);
                const validBooks = parsedMeta.filter((book) =>
                    storedKeys.includes(book.id),
                );
                setLocalBooks(validBooks);
            }

            const driveMeta = localStorage.getItem("ThabReader-drive-library");
            if (driveMeta) {
                setDriveBooks(JSON.parse(driveMeta));
            }
        };
        loadLibraries();
    }, []);

    const handleGoogleLogin = () => {
        setIsSyncing(true);
        initGoogleAuth(async (accessToken) => {
            setToken(accessToken);
            try {
                const response = await fetchDriveFiles(accessToken);
                const files = response.files || [];
                setDriveBooks(files);

                localStorage.setItem(
                    "ThabReader-drive-library",
                    JSON.stringify(files),
                );
                setActiveTab("drive");
            } catch (error) {
                console.error("Gagal mengambil file:", error);
            } finally {
                setIsSyncing(false);
            }
        });
    };

    const handleDownloadBook = async (book: BookMeta) => {
        const startDownload = async (accessToken: string) => {
            setDownloadingId(book.id);
            try {
                const blob = await downloadDriveFile(accessToken, book.id);
                await set(book.id, blob);

                setLocalBooks((prevLocal) => {
                    if (prevLocal.some((b) => b.id === book.id))
                        return prevLocal;

                    const updatedLibrary = [...prevLocal, book];
                    localStorage.setItem(
                        "ThabReader-library",
                        JSON.stringify(updatedLibrary),
                    );
                    return updatedLibrary;
                });

                setActiveTab("local");
            } catch (error) {
                console.error("Gagal mengunduh buku:", error);
                alert("Gagal mengunduh file.");
            } finally {
                setDownloadingId(null);
            }
        };

        if (!token) {
            initGoogleAuth((accessToken) => {
                setToken(accessToken);
                startDownload(accessToken);
            });
        } else {
            startDownload(token);
        }
    };

    const handleOpenLocalBook = async (book: BookMeta) => {
        const existingBlob = await get(book.id);
        if (existingBlob) {
            onOpenBook(book);
        } else {
            alert(
                "File buku tidak ditemukan. Silakan hapus kartu ini dan unduh ulang dari Drive.",
            );
        }
    };

    const handleDeleteLocalBook = async (
        e: React.MouseEvent,
        bookId: string,
    ) => {
        e.stopPropagation();
        if (!window.confirm("Hapus buku ini dari perpustakaan lokal?")) return;

        try {
            await del(bookId);
            localStorage.removeItem(`${bookId}-progress`);

            setLocalBooks((prev) => {
                const updatedLibrary = prev.filter((b) => b.id !== bookId);
                localStorage.setItem(
                    "ThabReader-library",
                    JSON.stringify(updatedLibrary),
                );
                return updatedLibrary;
            });
        } catch (error) {
            console.error("Gagal menghapus buku dari lokal:", error);
            alert("Gagal menghapus buku.");
        }
    };

    return (
        <div className="min-h-screen bg-[#D3D3D3] text-[#333333] p-6 mx-auto">
            <header className="flex justify-between items-center pb-4 mb-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    ThabReader
                </h1>
                <button
                    onClick={handleGoogleLogin}
                    disabled={isSyncing}
                    className="w-max bg-[#333333] hover:bg-[#222222] border border-[#333333] text-white px-2 py-2 rounded-full font-semibold transition-colors disabled:opacity-50"
                >
                    {isSyncing ? <AiOutlineSync /> : <AiOutlineCloudSync />}
                </button>
            </header>

            <div className="flex gap-6 border-b border-[#333333]/30 mb-2">
                <button
                    onClick={() => setActiveTab("local")}
                    className={`pb-3 text-[0.75rem] font-bold uppercase tracking-widest transition-all border-b-2 ${
                        activeTab === "local"
                            ? "border-[#333333] text-[#333333]"
                            : "border-transparent text-gray-500 hover:text-[#333333]"
                    }`}
                >
                    Library
                </button>
                <button
                    onClick={() => setActiveTab("drive")}
                    className={`pb-3 text-[0.75rem] font-bold uppercase tracking-widest transition-all border-b-2 ${
                        activeTab === "drive"
                            ? "border-[#333333] text-[#333333]"
                            : "border-transparent text-gray-500 hover:text-[#333333]"
                    }`}
                >
                    Drive
                </button>
            </div>

            {activeTab === "local" ? (
                <LocalTab
                    localBooks={localBooks}
                    onOpenBook={handleOpenLocalBook}
                    onDeleteBook={handleDeleteLocalBook}
                />
            ) : (
                <DriveTab
                    driveBooks={driveBooks}
                    localBooks={localBooks}
                    downloadingId={downloadingId}
                    onDownloadBook={handleDownloadBook}
                />
            )}
        </div>
    );
};
