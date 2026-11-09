import { useEffect, useState, type RefObject } from 'react';

// Element to measure
interface UseElementSizeParams {
    ref: RefObject<HTMLElement | null>;
}

// Width and height of an element's content
export interface ElementSize {
    width: number;
    height: number;
}

// Keeps track of an element's size as it changes
export function useElementSize({ ref }: UseElementSizeParams) {
    // Latest size
    const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

    // Measure the element whenever it resizes
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width, height });
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);

    return size;
}
