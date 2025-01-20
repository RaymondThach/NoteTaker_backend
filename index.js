import express from 'express';

//Import App routes
import note from './notes.js';
//API Documentation
import openapi from './openapi.js';
//To share resources with frontend
import cors from 'cors';

//Local Host Port
const port = process.env.PORT;
//Iniate express for routing
const app = express();
//Initiate resource sharing
app.use(cors());

// Connect App routes
app.use('/api-docs', openapi);
app.use('/notes', note);
app.use('*', (_, res) => {
  res.redirect('/api-docs');
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});