import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Global safety patch for browser DOMException on releasePointerCapture
if (typeof Element !== 'undefined' && Element.prototype.releasePointerCapture) {
    const originalReleasePointerCapture = Element.prototype.releasePointerCapture;
    Element.prototype.releasePointerCapture = function (pointerId: number) {
        try {
            if (this.hasPointerCapture && this.hasPointerCapture(pointerId)) {
                originalReleasePointerCapture.call(this, pointerId);
            }
        } catch {
            // Silently catch browser DOMException when pointer capture is released after element unmount
        }
    };
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            retry: 1,
            staleTime: 0, // Ensure real-time reactivity without manual page reloads
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <MantineProvider>
                    <App />
                </MantineProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
);
