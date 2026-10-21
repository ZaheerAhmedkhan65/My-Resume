const app = require('./config/app');
const port = process.env.PORT;

app.listen(port, ()=>{
    console.log('server is running on http://localhost:'+port);
})