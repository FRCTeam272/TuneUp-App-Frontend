// Static files imported through webpack resolve to their public URL.
declare module '*.mp3' {
    const url: string;
    export default url;
}

declare module '*.png' {
    const url: string;
    export default url;
}

// Global stylesheets imported for their side effects (checked since TypeScript 6)
declare module '*.css';
