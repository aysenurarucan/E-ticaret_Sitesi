const User = require('../models/users');
const bcryrpt = require('bcrypt');

exports.getLogin = (req, res, next) => {
    res.render('account/login', {
        path: '/login',
        title: 'Login' 
    });
}

exports.postLogin = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
        .then(user => {
            if(!user){
                return res.redirect('/login');
            }

            bcryrpt.compare(password, user.password)
                .then(isSuccess => {
                    if(isSuccess){
                        req.session.user = user;
                        req.session.isAuthenticated = true;
                        return req.session.save(function (err){
                            console.log(err);
                            var url = req.session.redirectTo || '/';
                            delete req.session.redirectTo;
                            res.redirect(url)
                        });
                    }

                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => console.log(err));
}

exports.getRegister = (req, res, next) => {
    res.render('account/register', {
        path: '/register',
        title: 'Register'
    });
}

exports.postRegister = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const isAdmin = req.body.isAdmin === 'admin';

    User.findOne({email: email})
        .then(user => {
            if(user){
                return res.redirect('/register');
            }

            return bcryrpt.hash(password, 10);
        })
        .then(hashedPassword => {
            console.log(hashedPassword);
            const newUser = new User({
                name: name,
                email: email,
                password: hashedPassword,
                isAdmin: isAdmin,
                cart: {items: []}
            });
            return newUser.save();
        })
        .then(() => {
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
        })
    
}

exports.getReset = (req, res, next) => {
    res.render('account/reset', {
        path: '/reset',
        title: 'Reset'
    });
}

exports.postReset = (req, res, next) => {
    res.redirect('/login');
}

exports.getLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}