import React from "react";
import type { Theme } from "../../hooks/useReaderState";
import type { NavPosition } from "./BottomNav";

interface SettingsModalProps {
    currentTheme: Theme;
    setTheme: (theme: Theme) => void;
    currentFont: number;
    setFont: (size: number) => void;
    navPosition: NavPosition;
    setNavPosition: (pos: NavPosition) => void;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    currentTheme,
    setTheme,
    currentFont,
    setFont,
    navPosition,
    setNavPosition,
    onClose,
}) => {
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const themes: { id: Theme; label: string; colorClass: string }[] = [
        {
            id: "oled",
            label: "OLED Black",
            colorClass: "bg-[#000000] text-[#E5E5E5] border-[#333333]",
        },
        {
            id: "sepia",
            label: "Sepia",
            colorClass: "bg-[#F4ECD8] text-[#2C221E] border-[#D4C4A8]",
        },
        {
            id: "night",
            label: "Night",
            colorClass: "bg-[#1E293B] text-[#94A3B8] border-[#334155]",
        },
        {
            id: "light",
            label: "Classic",
            colorClass: "bg-[#D3D3D3] text-[#333333] border-[#000000]",
        },
    ];

    const positions: { id: NavPosition; label: string }[] = [
        { id: "bottom", label: "Bottom" },
        { id: "left", label: "Left" },
        { id: "right", label: "Right" },
    ];

    const modalBg =
        currentTheme === "oled"
            ? "bg-[#111111] text-[#E5E5E5] border-[#333333]"
            : currentTheme === "sepia"
              ? "bg-[#EAE0C8] text-[#2C221E] border-[#D4C4A8]"
              : currentTheme === "night"
                ? "bg-[#0F172A] text-[#94A3B8] border-[#334155]"
                : "bg-[#D3D3D3] text-[#333333] border-[#000000]";

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        >
            <div
                className={`w-full max-w-md p-6 rounded-t-3xl sm:rounded-2xl border-t sm:border shadow-2xl transition-colors duration-300 ${modalBg}`}
                onClick={handleModalClick}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold tracking-wide">
                        Display Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100"
                    >
                        Close
                    </button>
                </div>

                {/* Pemilihan Tema */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">
                        Reading Theme
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`px-4 py-3 rounded-xl border flex items-center justify-center font-semibold transition-all ${t.colorClass} ${
                                    currentTheme === t.id
                                        ? "ring-2 ring-blue-500 opacity-100 scale-95"
                                        : "opacity-60 hover:opacity-100"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posisi Navigasi Bar */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">
                        Navigation Bar Position
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {positions.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setNavPosition(p.id)}
                                className={`py-2.5 rounded-xl border font-semibold text-xs uppercase tracking-wider transition-all ${
                                    navPosition === p.id
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                        : "opacity-60 hover:opacity-100 border-inherit"
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pengaturan Ukuran Font */}
                <div className="mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">
                        Typography
                    </h3>
                    <div
                        className="flex items-center justify-between border rounded-xl p-2"
                        style={{ borderColor: "inherit" }}
                    >
                        <button
                            onClick={() =>
                                setFont(Math.max(12, currentFont - 2))
                            }
                            className="w-16 h-10 flex items-center justify-center text-lg font-bold hover:bg-black/10 rounded-lg transition-colors"
                        >
                            A-
                        </button>
                        <span className="text-md font-bold">
                            {currentFont} px
                        </span>
                        <button
                            onClick={() =>
                                setFont(Math.min(36, currentFont + 2))
                            }
                            className="w-16 h-10 flex items-center justify-center text-lg font-bold hover:bg-black/10 rounded-lg transition-colors"
                        >
                            A+
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
