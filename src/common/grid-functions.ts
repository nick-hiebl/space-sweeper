export const createMyMap = <T>(fillSlot: (row: number, column: number) => T, rows: number, columns: number): T[][] => {
    const allRows = [];

    for (let i = 0; i < rows; i++) {
        const row = [];

        for (let j = 0; j < columns; j++) {
            row.push(fillSlot(i, j));
        }

        allRows.push(row);
    }

    return allRows;
};
