import { useEffect, useState } from 'react';

/**
 * False during the build-time render and the first client render, true afterwards.
 *
 * Use it to gate anything that depends on the browser (URL query string, window.location,
 * localStorage, the current time): rendering it straight away makes the first client render differ
 * from the HTML Gatsby built, which React reports as a hydration mismatch.
 */
export default function useHasMounted() {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);
    return hasMounted;
}
