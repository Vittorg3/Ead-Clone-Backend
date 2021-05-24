const { checkSchema } = require('express-validator');

module.exports = {
    signin: checkSchema({
        email: {
            trim: true,
            isLength: {
                options: {min: 2}
            },
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail inválido'
        },
        password: {
            isLength: {
                options: {min: 2}
            },
            errorMessage: 'Senha inválida'
        }
    }),
    signup: checkSchema({
        email: {
            trim: true,
            isLength: {
                options: {min: 2}
            },
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail inválido'
        },
        password: {
            isLength: {
                options: {min: 2}
            },
            errorMessage: 'Senha inválida'
        }, 
        name:  {
            isLength: {
                options: {min: 2}
            },
            errorMessage: 'Nome precisa ter pelo o menos 2 caracteres'
        }
    }), 
    editUser: checkSchema({
        token: {
            notEmpty: true
        },
        id: {
            notEmpty: true
        },
        name: {
            optional: true,
            isLength: {
                options: {min: 2}
            }
        },
        password: {
            optional: true,
            isLength: {
                options: {min: 2}
            }
        }
    })
};