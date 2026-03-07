// src/utils/dbUtils.js
export const buildDynamicUpdate = (tableName, idColumn, idValue, fields) => {
    const keys = Object.keys(fields).filter(k => fields[k] !== undefined);
    if (keys.length === 0) return null;

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => fields[key]);

    // Agregamos el ID al final para el WHERE
    values.push(idValue);

    return {
        sql: `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = ?`,
        params: values
    };
};