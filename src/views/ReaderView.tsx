import React, { useEffect, useState, useRef } from "react";
import ePub, { type Book, type Rendition, type Location } from "epubjs";
import { get } from "idb-keyval";
import { useReaderState } from "../hooks/useReaderState";
import { BottomNav, type NavPosition } from "../components/ui/BottomNav";
import { SettingsModal } from "../components/ui/SettingsModal";

interface ReaderProps {
    fileId: string;
    mimeType: string;
    onClose: () => void;
}

const parsePdfNative = (blob: Blob): string => {
    return URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
};

export const ReaderView: React.FC<ReaderProps> = ({
    fileId,
    mimeType,
    onClose,
}) => {
    const viewerRef = useRef<HTMLDivElement>(null);

    const [book, setBook] = useState<Book | null>(null);
    const [rendition, setRendition] = useState<Rendition | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [progressText, setProgressText] = useState("Menyiapkan buku...");

    const [navPosition, setNavPosition] = useState<NavPosition>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("reader_navPosition");
            if (saved === "bottom" || saved === "left" || saved === "right") {
                return saved as NavPosition;
            }
        }
        return "bottom";
    });

    useEffect(() => {
        localStorage.setItem("reader_navPosition", navPosition);
    }, [navPosition]);

    const {
        currentLocation,
        saveLocation,
        theme,
        setTheme,
        fontSize,
        setFontSize,
    } = useReaderState(fileId);

    useEffect(() => {
        const loadFile = async () => {
            setIsLoading(true);
            const blob = await get<Blob>(fileId);
            if (!blob) return;

            if (mimeType === "application/pdf") {
                setPdfUrl(parsePdfNative(blob));
                setIsLoading(false);
            } else {
                const arrayBuffer = await blob.arrayBuffer();
                const newBook = ePub(arrayBuffer);
                setBook(newBook);
            }
        };
        loadFile();

        return () => {
            book?.destroy();
        };
    }, [fileId, mimeType]);

    useEffect(() => {
        if (book && viewerRef.current && !rendition) {
            const newRendition = book.renderTo(viewerRef.current, {
                width: "100%",
                height: "100%",
                spread: "none",
                flow: "paginated",
            });

            const themesConfig = {
                oled: {
                    body: {
                        background: "#000000 !important",
                        color: "#E5E5E5 !important",
                    },
                },
                sepia: {
                    body: {
                        background: "#F4ECD8 !important",
                        color: "#2C221E !important",
                    },
                },
                night: {
                    body: {
                        background: "#1E293B !important",
                        color: "#94A3B8 !important",
                    },
                },
                light: {
                    body: {
                        background: "#D3D3D3 !important",
                        color: "#333333 !important",
                    },
                },
            };

            Object.entries(themesConfig).forEach(([key, style]) => {
                newRendition.themes.register(key, style);
            });

            newRendition.themes.select(theme);
            newRendition.themes.fontSize(`${fontSize}px`);

            newRendition.display(currentLocation || undefined).then(() => {
                setIsLoading(false);
            });

            newRendition.on("relocated", (location: Location) => {
                saveLocation(location.start.cfi);
                const percent = book.locations.percentageFromCfi(
                    location.start.cfi,
                );
                const totalPages = book.locations.length() || 100;
                const currentPage = Math.round(percent * totalPages) || 1;
                setProgressText(
                    `${currentPage}/${totalPages} page (${Math.round(percent * 100)}%)`,
                );
            });

            book.ready
                .then(() => book.locations.generate(1600))
                .then(() => {
                    const current = newRendition.currentLocation() as any;
                    const cfi = current?.start?.cfi ?? current?.cfi;
                    if (cfi) {
                        const percent = book.locations.percentageFromCfi(cfi);
                        const totalPages = book.locations.length() || 100;
                        const currentPage =
                            Math.round(percent * totalPages) || 1;
                        setProgressText(
                            `${currentPage}/${totalPages} page (${Math.round(percent * 100)}%)`,
                        );
                    }
                });

            setRendition(newRendition);
        }
    }, [book]);

    useEffect(() => {
        if (rendition && viewerRef.current) {
            const timeout = setTimeout(() => {
                rendition.resize(
                    viewerRef.current?.clientWidth ?? 0,
                    viewerRef.current?.clientHeight ?? 0,
                );
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [navPosition, rendition]);

    useEffect(() => {
        if (rendition) rendition.themes.select(theme);
    }, [theme, rendition]);

    useEffect(() => {
        if (rendition) rendition.themes.fontSize(`${fontSize}px`);
    }, [fontSize, rendition]);

    const themeClasses = {
        oled: "bg-[#000000] text-[#E5E5E5]",
        sepia: "bg-[#F4ECD8] text-[#2C221E]",
        night: "bg-[#1E293B] text-[#94A3B8]",
        light: "bg-[#D3D3D3] text-[#333333]",
    };

    const getWrapperPadding = () => {
        if (navPosition === "left") return "pl-4";
        if (navPosition === "right") return "pr-4";
        return "";
    };

    if (pdfUrl) {
        return (
            <div className="w-screen h-screen relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-50 bg-black/70 text-white px-4 py-2 rounded-full font-bold"
                >
                    &larr; Back
                </button>
                <div
                    className={`w-full h-full transition-all duration-300 ${getWrapperPadding()}`}
                >
                    <iframe
                        src={`${pdfUrl}#toolbar=0`}
                        className="w-full h-[calc(100vh-1.25rem)] border-none bg-white"
                    />
                </div>
                <BottomNav
                    position={navPosition}
                    onPrev={() => {}}
                    onNext={() => {}}
                    onSettings={() => setShowSettings(true)}
                    theme={theme}
                />
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen w-screen overflow-hidden transition-colors duration-300 ${themeClasses[theme]}`}
        >
            <div
                className={`absolute top-0 left-0 w-full h-6 flex items-center justify-between px-4 z-40 backdrop-blur-md ${themeClasses[theme]} border-b`}
            >
                <button
                    onClick={onClose}
                    className="font-bold uppercase tracking-wider text-[0.65rem]"
                >
                    &larr; Library
                </button>
                <span className="text-[0.65rem] font-bold tracking-widest">
                    {isLoading ? "Memuat..." : progressText}
                </span>
            </div>

            {isLoading && !pdfUrl && (
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                    <span className="animate-pulse">
                        Parsing dengan ePub.js...
                    </span>
                </div>
            )}

            <div
                className={`w-full transition-all duration-300 ${getWrapperPadding()}`}
                style={{ height: "calc(100vh - 2.5rem)", marginTop: "1.5rem" }}
            >
                <div ref={viewerRef} className="w-full h-full" />
            </div>

            <BottomNav
                position={navPosition}
                onPrev={() => rendition?.prev()}
                onNext={() => rendition?.next()}
                onSettings={() => setShowSettings(true)}
                theme={theme}
            />

            {showSettings && (
                <SettingsModal
                    currentTheme={theme}
                    setTheme={setTheme}
                    currentFont={fontSize}
                    setFont={setFontSize}
                    navPosition={navPosition}
                    setNavPosition={setNavPosition}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
};
