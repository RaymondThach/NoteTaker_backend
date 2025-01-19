import * as dotenv from 'dotenv';

//Load local environment variables
dotenv.config({ path: `.env`, debug: true });

//SQL Server address
const server = process.env.AZURE_SQL_SERVER;
//SQL Database name
const database = process.env.AZURE_SQL_DATABASE;
//Default port number
const port = +process.env.AZURE_SQL_PORT;
//SQL Database user credentials
const user = process.env.AZURE_SQL_USER;
const password = process.env.AZURE_SQL_PASSWORD;

//SQL Authentication connection config
export const passwordConfig = {
  server,
  port,
  database,
  user,
  password,
  options: {
    encrypt: true
  }
};