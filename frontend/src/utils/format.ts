/**
 * Safely formats any value as a price string (e.g., "10.00").
 * Handles numbers, strings, null, undefined, and invalid inputs gracefully.
 * @param price The price to format
 * @returns A formatted price string with 2 decimal places
 */
export const formatPrice = (price: any): string => {
    if (price === null || price === undefined) {
        return '0.00';
    }

    // If it's already a number, safe to format
    if (typeof price === 'number' && !isNaN(price)) {
        return price.toFixed(2);
    }

    // If it's a string, try to parse it
    if (typeof price === 'string') {
        const parsed = parseFloat(price);
        if (!isNaN(parsed)) {
            return parsed.toFixed(2);
        }
    }

    // Fallback for objects, arrays, or invalid strings
    return '0.00';
};
