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

    //Create table of users, cascades to NotesTable
    async createUsersTable() {
        this.executeQuery(
            `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UsersTable')
            BEGIN
            CREATE TABLE UsersTable (
                id int NOT NULL IDENTITY UNIQUE, 
                userName varchar(255) NOT NULL,
                PRIMARY KEY (id) 
                );
            END`
        )
        .then(() => {
            console.log('Users table created');
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
                noteName varchar(255) NOT NULL,
                note varchar(255)
                PRIMARY KEY (id),
                FOREIGN KEY (userId) REFERENCES UsersTable(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
                );
            END`
        )
        .then(() => {
            console.log('Notes table created');
        })
        .catch((err) => {
            // Table may already exist
            console.error(`Error creating table: ${err}`);
        });
    }

    //Create a user from the client's authenticated username if not already in UsersTable
    async createUser(data) {
        this.executeQuery(
        `IF NOT EXISTS (SELECT * FROM UsersTable WHERE userName = '${data.userName}')
        INSERT INTO UsersTable (userName) VALUES ('${data.userName}')`
        )
        .then(() => {
            console.log('User created');
        })
        .catch((err) => {
            console.error(`Error creating user: ${err}`);
        });
    }

    //Get all notes owned by authenticated user from NotesTable
    async allNotes(userId) {
        this.executeQuery(
        `SELECT * FROM NotesTable WHERE userId=${userId}`
        )
        .then(() => {
            console.log('Getting all user notes');
        })
        .catch((err) => {
            console.error(`Error getting all user notes: ${err}`);
        });
    }

    //Create a note for authenticated user if they haven't created a note of the same name in NotesTable
    async createNote(data) {
        this.executeQuery(
        `IF NOT EXISTS (SELECT * FROM NotesTable WHERE noteName = '${data.noteName}')
        INSERT INTO NotesTable (userId, noteName, note) VALUES (${data.userId}, '${data.noteName}', '${data.note}')`
        )
        .then(() => {
            console.log('Note created');
        })
        .catch((err) => {
            console.error(`Error creating note: ${err}`);
        });
    }

    //Delete a note for the authenticated user from NotesTable
    async deleteNote(id) {
        this.executeQuery(
        `DELETE FROM NotesTable WHERE id = ${id}`
        )
        .then(() => {
            console.log('Note deleted');
        })
        .catch((err) => {
            console.error(`Error deleting note: ${err}`);
        });    
    }

    //Update an authenticated user's note in NotesTable
    async updateNote(data) {
        this.executeQuery(
         `UPDATE NotesTable SET note='${data.newNote}' WHERE id = ${data.id}`
        )
        .then(() => {
            console.log('Note updated');
        })
        .catch((err) => {
            console.error(`Error updating note: ${err}`);
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