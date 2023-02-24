const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodetask'
});

connection.connect((err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log('Database connected')
})

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/home.html'));
    } else {
        response.sendFile(path.join(__dirname + '/index.html'));
    }
});

app.get('/home', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/home.html'));
    } else {
        response.sendFile(path.join(__dirname + '/index.html'));
    }
});

app.get('/register', function (request, response) {
    response.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/login', function (request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/register', function (request, response) {
    let username = request.body.username;
    let password = request.body.password;
    let email = request.body.email;
    // let realname = request.body.realname;
    // let birthdate = request.body.birthdate;
    // let country = request.body.country;

    if (email && username.length > 3 && password.length > 3) {
        connection.query('SELECT * FROM accounts WHERE email = ? OR username = ?', [email, username], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                response.send('Username taken and/or email already registered!');
            }
            else {
                connection.query('INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)', [username, password, email], function (error, results, fields) {
                    if (error) throw error;
                    request.session.loggedin = true;
                    request.session.username = username;
                    response.redirect('/home');
                });
            }
            response.end();
        });

    } else {
        response.send('Username should be at least 3 characters, password should be at least 3 characters!');
        response.end();
    }
});

app.post('/login', function (request, response) {
    let username = request.body.username;
    let password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.post('/logout', function (request, response) {
    if (request.session) {
        request.session.destroy(err => {
            if (err) {
                response.status(400).send('Unable to log out!')
            } else {
                response.send('Logout successful!')
            }
        });
    } else {
        response.end()
    }
});

app.listen(3000);