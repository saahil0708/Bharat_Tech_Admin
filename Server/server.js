import 'dotenv/config';
import serverApp from './src/app.js';
const PORT = process.env.PORT || 5000;

serverApp.get('/', async (req, res) => {
    res.send('Hello World!');
});

serverApp.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
