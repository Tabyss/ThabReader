import React from "react";

interface BottomNavProps {
    onPrev: () => void;
    onNext: () => void;
    onSettings: () => void;
    theme: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
    onPrev,
    onNext,
    onSettings,
    theme,
}) => {
    const bgClass =
        theme === "oled"
            ? "bg-[#000000] text-[#E5E5E5]"
            : theme === "sepia"
              ? "bg-[#F4ECD8] text-[#2C221E]"
              : theme === "night"
                ? "bg-[#1E293B] text-[#94A3B8]"
                : "bg-[#D3D3D3] text-[#333333]";

    return (
        <div
            className={`fixed bottom-0 left-0 w-full h-5 flex justify-between items-center px-5 ${bgClass}`}
        >
            <button
                onClick={onSettings}
                className="px-4 h-full font-bold uppercase tracking-wider text-[0.75rem] border rounded-t-md"
            >
                Settings
            </button>
            <button
                onClick={onPrev}
                className="px-4 h-full font-bold uppercase tracking-wider text-[0.75rem] border rounded-t-md"
            >
                &lt; Prev
            </button>
            <button
                onClick={onNext}
                className="px-4 h-full font-bold uppercase tracking-wider text-[0.75rem] border rounded-t-md"
            >
                Next &gt;
            </button>
        </div>
    );
};
