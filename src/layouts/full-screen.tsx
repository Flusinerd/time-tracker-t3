import { type ReactElement } from "react";

const FullScreenLayout = (page: ReactElement) => {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            {page}
        </main>
    );
}

export default FullScreenLayout;