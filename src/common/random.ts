export function selectRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

export function selectRandomN<T>(items: T[], count: number): T[] {
    return items.reduce((chosen: T[], current: T, index: number) => {
        const stillNeeded = count - chosen.length;
        const remainingOptions = items.length - index;
        if (Math.random() < stillNeeded / remainingOptions) {
            return chosen.concat(current);
        } else {
            return chosen;
        }
    }, []);
}
