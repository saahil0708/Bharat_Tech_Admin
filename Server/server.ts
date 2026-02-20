const serverApp = require('./src/app');
const PORT = process.env.PORT || 5000;

serverApp.get('/', async (req: any, res: any) => {
    res.send('Hello World!');
});

serverApp.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
