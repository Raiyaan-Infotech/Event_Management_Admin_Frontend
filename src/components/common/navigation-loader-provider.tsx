'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PageLoader } from './page-loader';

interface NavigationLoaderContextType {
    startLoading: () => void;
    stopLoading: () => void;
}

const NavigationLoaderContext = createContext<NavigationLoaderContextType>({
    startLoading: () => {},
    stopLoading: () => {},
});

export const useNavigationLoader = () => useContext(NavigationLoaderContext);

export function NavigationLoaderProvider({ children }: { children: ReactNode }) {
    const [isNavigating, setIsNavigating] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Whenever pathname or searchParams changes, navigation completed!
    useEffect(() => {
        setIsNavigating(false);
    }, [pathname, searchParams]);

    const startLoading = () => setIsNavigating(true);
    const stopLoading = () => setIsNavigating(false);

    return (
        <NavigationLoaderContext.Provider value={{ startLoading, stopLoading }}>
            <PageLoader open={isNavigating} text="Loading..." />
            {children}
        </NavigationLoaderContext.Provider>
    );
}
