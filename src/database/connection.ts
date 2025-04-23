import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDBConnection = async () => {
    return SQLite.openDatabase({ name: 'leitura.db', location: 'default' });
};

export const createTable = async (db: SQLite.SQLiteDatabase) => {

    await db.executeSql(`CREATE TABLE IF NOT EXISTS leitura (
        id INTEGER PRIMARY KEY,
        texto_restante TEXT
      );`);
};

export const insertTexto = async (db: SQLite.SQLiteDatabase, texto: string) => {
    await db.executeSql(`INSERT OR REPLACE INTO leitura (id, texto_restante) VALUES (1, ?);`,
        [texto]);
};

export const deletarTexto = async (db: SQLite.SQLiteDatabase) => {
    await db.executeSql(`DELETE FROM leitura where id = 1;`);
};

export const getTexto = async (db: SQLite.SQLiteDatabase): Promise<string | null> => {
    const results = await db.executeSql(`SELECT texto_restante FROM leitura WHERE id = 1;`);
    if (results[0].rows.length > 0) {
        return results[0].rows.item(0).texto_restante;
    }
    return null;
};

