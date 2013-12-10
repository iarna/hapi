// Load modules

var Hapi = require('../lib');


// Declare internals

var internals = {};


internals.users = {
    john: {
        id: 'john',
        password: 'password',
        name: 'John Doe'
    }
};


internals.home = function (request, reply) {

    reply('<html><head><title>Login page</title></head><body><h3>Welcome ' + this.auth.credentials.name + '!</h3><br/><form method="get" action="/logout"><input type="submit" value="Logout"></form></body></html>');
};


internals.login = function (request, reply) {

    if (this.auth.isAuthenticated) {
        return reply.redirect('/');
    }

    var message = '';
    var account = null;

    if (this.method === 'post') {
        
        if (!this.payload.username ||
            !this.payload.password) {

            message = 'Missing username or password';
        }
        else {
            account = internals.users[this.payload.username];
            if (!account ||
                account.password !== this.payload.password) {

                message = 'Invalid username or password';
            }
        }
    }

    if (this.method === 'get' ||
        message) {

        return reply('<html><head><title>Login page</title></head><body>' + (message ? '<h3>' + message + '</h3><br/>' : '') + '<form method="post" action="/login">Username: <input type="text" name="username"><br>Password: <input type="password" name="password"><br/><input type="submit" value="Login"></form></body></html>');
    }

    this.auth.session.set(account);
    return reply.redirect('/');
};


internals.logout = function (request, reply) {

    this.auth.session.clear();
    return reply.redirect('/');
};


internals.main = function () {

    var config = {
        auth: {
            scheme: 'cookie',
            password: 'secret',
            cookie: 'sid-example',
            redirectTo: '/login',
            isSecure: false
        }
    };

    var server = new Hapi.Server('localhost', 8000, config);

    server.route([
        { method: 'GET', path: '/', config: { handler: internals.home, auth: true } },
        { method: '*', path: '/login', config: { handler: internals.login, auth: { mode: 'try' } } },
        { method: 'GET', path: '/logout', config: { handler: internals.logout, auth: true } }
    ]);

    server.start();
};


internals.main();