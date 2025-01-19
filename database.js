import sql from 'mssql';

//The database connection and functions to passed onto routes in notes.js
let database = null;

export default class Database {

    config = {};
    poolconnection = null;
    connected = false;

    //Assign config.js connections config here
    constructor(config) {
        this.config = config;
    }

    //Establish connection with the SQL Database
    async connect() {
        try {
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
        console.log('Database connected successfully.');
        return this.poolconnection;
        } catch (error) {
        console.error('Error connecting to the database:', error);
        this.connected = false;
        }
    }

    // async disconnect() {
    //     try {
    //     if (this.connected) {
    //         await this.poolconnection.close();
    //         this.connected = false;
    //         console.log('Database disconnected successfully.');
    //     }
    //     } catch (error) {
    //     console.error('Error disconnecting from the database:', error);
    //     }
    // }

    //Execute queries based on the established connection to SQL Database
    async executeQuery(query) {
        const request = this.poolconnection.request();
        const result = await request.query(query);
        return result.rowsAffected[0];
    }

//   async create(data) {
//     const request = this.poolconnection.request();

//     request.input('firstName', sql.NVarChar(255), data.firstName);
//     request.input('lastName', sql.NVarChar(255), data.lastName);

//     const result = await request.query(
//       `INSERT INTO Person (firstName, lastName) VALUES (@firstName, @lastName)`
//     );

//     return result.rowsAffected[0];
//   }

//   async readAll() {
//     const request = this.poolconnection.request();
//     const result = await request.query(`SELECT * FROM Person`);

//     return result.recordsets[0];
//   }

//   async read(id) {
//     const request = this.poolconnection.request();
//     const result = await request
//       .input('id', sql.Int, +id)
//       .query(`SELECT * FROM Person WHERE id = @id`);

//     return result.recordset[0];
//   }

//   async update(id, data) {
//     const request = this.poolconnection.request();

//     request.input('id', sql.Int, +id);
//     request.input('firstName', sql.NVarChar(255), data.firstName);
//     request.input('lastName', sql.NVarChar(255), data.lastName);

//     const result = await request.query(
//       `UPDATE Person SET firstName=@firstName, lastName=@lastName WHERE id = @id`
//     );

//     return result.rowsAffected[0];
//   }

//   async delete(id) {
//     const idAsNumber = Number(id);

//     const request = this.poolconnection.request();
//     const result = await request
//       .input('id', sql.Int, idAsNumber)
//       .query(`DELETE FROM Person WHERE id = @id`);

//     return result.rowsAffected[0];
//   }

    //Create table of users, cascades to NotesTable
    async createUsersTable() {
        this.executeQuery(
            `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UsersTable')
            BEGIN
            CREATE TABLE UsersTable (
                id int NOT NULL IDENTITY UNIQUE, 
                userName TEXT NOT NULL,
                PRIMARY KEY (id) 
                );
            END`
        )
        .then(() => {
            console.log('Users Table created');
        })
        .catch((err) => {
            // Table may already exist
            console.error(`Error creating table: ${err}`);
        });
    }

    //Creates the table of notes owned by users in UsersTable
    async createNotesTable() {
        this.executeQuery(
            `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'NotesTable')
            BEGIN
            CREATE TABLE NotesTable (
                id int NOT NULL IDENTITY UNIQUE, 
                userId int NOT NULL, 
                noteName TEXT NOT NULL,
                note TEXT
                PRIMARY KEY (id),
                FOREIGN KEY (userId) REFERENCES UsersTable(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
                );
            END`
        )
        .then(() => {
            console.log('Notes Table created');
        })
        .catch((err) => {
            // Table may already exist
            console.error(`Error creating table: ${err}`);
        });
    }
}

//Initiates one connection to SQL server and creates tables so routes can access them
export const createDatabaseConnection = async (passwordConfig) => {
    database = new Database(passwordConfig);
    await database.connect();
    await database.createUsersTable();
    await database.createNotesTable();
    return database;
};