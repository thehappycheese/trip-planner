/**
 * Move an item up in an array (swap with previous item)
 */
export function move_up<T>(array: T[], index: number): T[] {
    if (index <= 0 || index >= array.length) return array;
    
    const newArray = [...array];
    [newArray[index - 1], newArray[index]] = 
        [newArray[index], newArray[index - 1]];
    
    return newArray;
}

/**
 * Move an item down in an array (swap with next item)
 */
export function move_down<T>(array: T[], index: number): T[] {
    if (index < 0 || index >= array.length - 1) return array;
    
    const newArray = [...array];
    [newArray[index], newArray[index + 1]] = 
        [newArray[index + 1], newArray[index]];
    
    return newArray;
}