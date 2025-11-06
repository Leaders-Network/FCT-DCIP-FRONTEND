/**
 * React hooks type definitions
 */

import { DependencyList, EffectCallback, MutableRefObject, RefObject } from 'react';

// Custom hook return types
export interface UseAsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (...args: unknown[]) => Promise<void>;
    reset: () => void;
}

export interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    mutate: (newData: T) => void;
}

export interface UsePaginationState {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    setItemsPerPage: (items: number) => void;
}

export interface UseFormState<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isValid: boolean;
    isSubmitting: boolean;
    setValue: <K extends keyof T>(field: K, value: T[K]) => void;
    setError: <K extends keyof T>(field: K, error: string) => void;
    setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
    handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
    handleBlur: <K extends keyof T>(field: K) => () => void;
    handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (event?: React.FormEvent) => void;
    reset: (newValues?: Partial<T>) => void;
    validate: () => boolean;
}

export interface UseLocalStorageState<T> {
    value: T;
    setValue: (value: T | ((prev: T) => T)) => void;
    removeValue: () => void;
}

export interface UseDebounceState<T> {
    debouncedValue: T;
    isDebouncing: boolean;
}

export interface UseToggleState {
    value: boolean;
    toggle: () => void;
    setTrue: () => void;
    setFalse: () => void;
    setValue: (value: boolean) => void;
}

export interface UseCounterState {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
    set: (value: number) => void;
}

export interface UseArrayState<T> {
    array: T[];
    push: (item: T) => void;
    pop: () => T | undefined;
    shift: () => T | undefined;
    unshift: (item: T) => void;
    remove: (index: number) => void;
    clear: () => void;
    set: (newArray: T[]) => void;
    update: (index: number, item: T) => void;
    insert: (index: number, item: T) => void;
    move: (from: number, to: number) => void;
}

export interface UseModalState {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

export interface UseDisclosureState {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onToggle: () => void;
}

export interface UseClipboardState {
    value: string;
    onCopy: () => void;
    hasCopied: boolean;
}

export interface UseMediaQueryState {
    matches: boolean;
}

export interface UseOnlineState {
    isOnline: boolean;
}

export interface UseGeolocationState {
    location: GeolocationPosition | null;
    error: GeolocationPositionError | null;
    loading: boolean;
}

export interface UseBatteryState {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
}

export interface UseNetworkState {
    online: boolean;
    downlink?: number;
    downlinkMax?: number;
    effectiveType?: string;
    rtt?: number;
    saveData?: boolean;
    type?: string;
}

export interface UseIdleState {
    isIdle: boolean;
    lastActive: number;
}

export interface UseKeyPressState {
    isPressed: boolean;
}

export interface UseHoverState {
    isHovered: boolean;
    ref: RefObject<HTMLElement>;
}

export interface UseFocusState {
    isFocused: boolean;
    ref: RefObject<HTMLElement>;
}

export interface UseClickOutsideState {
    ref: RefObject<HTMLElement>;
}

export interface UseIntersectionObserverState {
    isIntersecting: boolean;
    entry: IntersectionObserverEntry | null;
    ref: RefObject<HTMLElement>;
}

export interface UseResizeObserverState {
    width: number;
    height: number;
    ref: RefObject<HTMLElement>;
}

export interface UseMutationObserverState {
    ref: RefObject<HTMLElement>;
}

export interface UseEventListenerState {
    ref: RefObject<HTMLElement>;
}

export interface UseWindowSizeState {
    width: number;
    height: number;
}

export interface UseScrollState {
    x: number;
    y: number;
}

export interface UseDocumentTitleState {
    title: string;
    setTitle: (newTitle: string) => void;
}

export interface UseFaviconState {
    favicon: string;
    setFavicon: (newFavicon: string) => void;
}

export interface UseColorModeState {
    colorMode: 'light' | 'dark';
    toggleColorMode: () => void;
    setColorMode: (mode: 'light' | 'dark') => void;
}

export interface UseThemeState<T> {
    theme: T;
    setTheme: (theme: T) => void;
}

export interface UseStepsState {
    currentStep: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    goToNext: () => void;
    goToPrevious: () => void;
    goToStep: (step: number) => void;
    reset: () => void;
}

export interface UseUndoState<T> {
    state: T;
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    set: (newState: T) => void;
    reset: (initialState: T) => void;
}

export interface UseQueueState<T> {
    queue: T[];
    enqueue: (item: T) => void;
    dequeue: () => T | undefined;
    peek: () => T | undefined;
    clear: () => void;
    size: number;
    isEmpty: boolean;
}

export interface UseStackState<T> {
    stack: T[];
    push: (item: T) => void;
    pop: () => T | undefined;
    peek: () => T | undefined;
    clear: () => void;
    size: number;
    isEmpty: boolean;
}

export interface UseSetState<T> {
    set: Set<T>;
    add: (item: T) => void;
    remove: (item: T) => void;
    toggle: (item: T) => void;
    clear: () => void;
    has: (item: T) => boolean;
    size: number;
}

export interface UseMapState<K, V> {
    map: Map<K, V>;
    set: (key: K, value: V) => void;
    get: (key: K) => V | undefined;
    remove: (key: K) => void;
    clear: () => void;
    has: (key: K) => boolean;
    size: number;
}

// Hook configuration types
export interface UseAsyncConfig {
    immediate?: boolean;
    onSuccess?: (data: unknown) => void;
    onError?: (error: Error) => void;
}

export interface UseApiConfig<T> {
    immediate?: boolean;
    initialData?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
}

export interface UseFormConfig<T> {
    initialValues: T;
    validate?: (values: T) => Partial<Record<keyof T, string>>;
    onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseDebounceConfig {
    delay?: number;
    leading?: boolean;
    trailing?: boolean;
}

export interface UseThrottleConfig {
    delay?: number;
    leading?: boolean;
    trailing?: boolean;
}

export interface UseIntervalConfig {
    delay: number;
    immediate?: boolean;
}

export interface UseTimeoutConfig {
    delay: number;
}

export interface UseGeolocationConfig {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

export interface UseIntersectionObserverConfig {
    threshold?: number | number[];
    root?: Element | null;
    rootMargin?: string;
}

export interface UseResizeObserverConfig {
    box?: 'border-box' | 'content-box' | 'device-pixel-content-box';
}

export interface UseMutationObserverConfig {
    attributes?: boolean;
    attributeOldValue?: boolean;
    attributeFilter?: string[];
    childList?: boolean;
    subtree?: boolean;
    characterData?: boolean;
    characterDataOldValue?: boolean;
}

// Event handler types for hooks
export type UseEventListenerHandler<T extends Event = Event> = (event: T) => void;
export type UseKeyPressHandler = (event: KeyboardEvent) => void;
export type UseClickHandler = (event: MouseEvent) => void;
export type UseScrollHandler = (event: Event) => void;
export type UseResizeHandler = (entry: ResizeObserverEntry) => void;

// Ref types for hooks
export type UseRefType<T = HTMLElement> = MutableRefObject<T | null>;
export type UseCallbackRefType<T = HTMLElement> = (node: T | null) => void;

// Effect types for hooks
export type UseEffectCleanup = ReturnType<EffectCallback>;
export type UseEffectDeps = DependencyList;

// Generic hook types
export type UseStateHook<T> = [T, React.Dispatch<React.SetStateAction<T>>];
export type UseReducerHook<S, A> = [S, React.Dispatch<A>];
export type UseContextHook<T> = T;
export type UseMemoHook<T> = T;
export type UseCallbackHook<T extends (...args: unknown[]) => unknown> = T;

// Custom hook factory types
export type HookFactory<T, P = unknown> = (params?: P) => T;
export type AsyncHookFactory<T, P = unknown> = (params?: P) => Promise<T>;

// Hook composition types
export type ComposedHook<T> = () => T;
export type ConditionalHook<T> = (condition: boolean) => T | null;

// Hook testing types
export interface MockHookState<T> {
    result: { current: T };
    rerender: (newProps?: unknown) => void;
    unmount: () => void;
}

// Hook performance types
export interface HookPerformanceMetrics {
    renderCount: number;
    lastRenderTime: number;
    averageRenderTime: number;
    totalRenderTime: number;
}

// Hook debugging types
export interface HookDebugInfo {
    name: string;
    props: unknown;
    state: unknown;
    effects: unknown[];
    memos: unknown[];
    callbacks: unknown[];
}

// Export utility types
export type ExtractHookState<T> = T extends (...args: unknown[]) => infer R ? R : never;
export type ExtractHookParams<T> = T extends (params: infer P) => unknown ? P : never;