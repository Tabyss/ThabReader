import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export type NavPosition = "bottom" | "right" | "left";

interface BottomNavProps {
    position?: NavPosition;
    onPrev: () => void;
    onNext: () => void;
    onSettings: () => void;
    theme: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
    position = "bottom",
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

    const isVertical = position === "right" || position === "left";

    const positionClasses =
        position === "right"
            ? "fixed top-0 right-0 h-screen w-5 flex-col-reverse justify-center py-5"
            : position === "left"
              ? "fixed top-0 left-0 h-screen w-5 flex-col-reverse justify-center py-5"
              : "fixed bottom-0 left-0 w-full h-5 flex-row justify-between items-center px-5";

    return (
        <div
            className={`flex items-center ${positionClasses} ${bgClass}`}
        >
            <button
                onClick={onSettings}
                className={`flex items-center justify-center font-bold uppercase tracking-wider text-[0.7rem] border rounded-md p-2 transition-transform ${
                    isVertical ? "rotate-270 my-auto py-2" : "h-8 px-4"
                }`}
            >
                Settings
            </button>

            <div
                className={`flex ${isVertical ? "flex-col-reverse gap-6 my-auto" : "gap-4"} items-center`}
            >
                <div
                    onClick={onPrev}
                    className="flex items-center justify-center p-2 font-bold uppercase tracking-wider text-[0.7rem] border rounded-md cursor-pointer hover:opacity-75 transition-opacity"
                    title="Previous Page"
                >
                    <IoIosArrowBack size={16} />
                    {!isVertical && <span className="ml-1">Prev</span>}
                </div>
                <div
                    onClick={onNext}
                    className="flex items-center justify-center p-2 font-bold uppercase tracking-wider text-[0.7rem] border rounded-md"
                    title="Next Page"
                >
                    {!isVertical && <span className="mr-1">Next</span>}
                    <IoIosArrowForward size={16} />
                </div>
            </div>
        </div>
    );
};
