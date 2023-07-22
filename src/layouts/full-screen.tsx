import { type ReactElement } from "react";

const FullScreenLayout = ({children}: {children: React.ReactNode}) => {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            {children}
        </main>
    );
}

export default FullScreenLayout;