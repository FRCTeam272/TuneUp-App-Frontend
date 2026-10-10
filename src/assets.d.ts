// Static files imported through webpack resolve to their public URL.
declare module '*.mp3' {
    const url: string;
    export default url;
}

declare module '*.png' {
    const url: string;
    export default url;
}
