import type { BookMeta } from "../../App";
import LocalBookCard from "./LocalBookCard";

const LocalTab: React.FC<{
    localBooks: BookMeta[];
    onOpenBook: (book: BookMeta) => void;
    onDeleteBook: (e: React.MouseEvent, id: string) => void;
}> = ({ localBooks, onOpenBook, onDeleteBook }) => {
    if (localBooks.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-[#333333] rounded-2xl mt-6">
                <p className="opacity-40 italic font-medium">
                    Shelf is empty. Open the Drive tab to download books.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mt-6">
            {localBooks.map((book) => (
                <LocalBookCard
                    key={book.id}
                    book={book}
                    onClick={() => onOpenBook(book)}
                    onDelete={(e) => onDeleteBook(e, book.id)}
                />
            ))}
        </div>
    );
};

export default LocalTab;
