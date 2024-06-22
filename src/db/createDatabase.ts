import pg from "pg";

const { Client } = pg;

export async function createDatabase(databaseName: string, config: { host: string; port: number; user: string; password: string }) {
    const client = new Client({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: "postgres",
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${databaseName}'`);
        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE ${databaseName}`);
            console.log(`Database ${databaseName} created successfully`);
        } else {
            console.log(`Database ${databaseName} already exists`);
        }
    } catch (error) {
        console.error("Error creating database:", error);
    } finally {
        await client.end();
    }
}
