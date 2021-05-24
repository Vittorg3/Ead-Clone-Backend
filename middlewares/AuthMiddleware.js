module.exports = {
    AuthMiddleware: (req, res, next) => {
        if (req.headers.authorization) {
            next();
        }

        if(req.body.token) {
            next();
        } 

        if(req.query.token) {
            next();
        } 

        if(!req.query.token && !req.body.token && !req.headers.authorization) {
            res.json({notallowed: true});
            return;
        }
    }
};