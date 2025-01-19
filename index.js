import express from 'express';

//Import App routes
import note from './notes.js';
import openapi from './openapi.js';

//Local Host Port
const port = process.env.PORT;
//Iniate express for routing
const app = express();

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