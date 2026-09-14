import { useState } from "react";
import { ShelfView } from "./views/ShelfView/ShelfView";
import { ReaderView } from "./views/ReaderView";

export interface BookMeta {
    id: string;
    name: string;
    mimeType: string;
}

export default function App() {
    const [currentBook, setCurrentBook] = useState<BookMeta | null>(null);

    return (
        <div className="min-h-screen bg-[#D3D3D3] font-sans antialiased">
            {currentBook ? (
                <ReaderView
                    fileId={currentBook.id}
                    mimeType={currentBook.mimeType}
                    onClose={() => setCurrentBook(null)}
                />
            ) : (
                <ShelfView onOpenBook={(book) => setCurrentBook(book)} />
            )}
        </div>
    );
}
