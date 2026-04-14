// Type declaration for the 'aos' (Animate On Scroll) library.
// Eliminates TS7016 "implicitly has an 'any' type" errors.
declare module 'aos' {
    interface AosOptions {
        duration?: number;
        easing?: string;
        once?: boolean;
        anchorPlacement?: string;
        offset?: number;
        delay?: number;
        mirror?: boolean;
        disable?: string | boolean | (() => boolean);
    }

    function init(options?: AosOptions): void;
    function refresh(initialize?: boolean): void;
    function refreshHard(): void;

    export default { init, refresh, refreshHard };
}
