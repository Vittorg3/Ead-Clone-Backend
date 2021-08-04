const { validationResult, matchedData } = require('express-validator');

const fs = require('fs');

const User = require('../models/User');
const Course = require('../models/Course');
const courseAvailable = require('../models/CadCourse');

const bcrypt = require('bcrypt');
const remove = require('../services/removeAvatar');

const pathDirectory = require('../public/videos/pathDirectory');
const pathDirectoryFile = require('../public/files/pathDirectory');

module.exports = {
    signin: async (req, res) => {
        const erros = validationResult(req);
        if(!erros.isEmpty()) {
            res.json({error: erros.mapped()});
            return;
        }

        const data = matchedData(req);

        const user = await User.findOne({email: data.email});

        if(!user) {
            res.json({error: 'E-mail e/ou senha incorreta!'});
            return;
        }

        const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

        if(passwordMatch) {
            const token = await bcrypt.hash((Date.now() + Math.random()).toString(), 10);
            user.token = token;

            await user.save();

            res.json({token: token, user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                perm: user.admin
            }}); 

        } else {
            res.json({error: 'E-mail e/ou senha incorreta!'});
        }
    },
    signup: async (req, res) => {
        const erros = validationResult(req);
        if(!erros.isEmpty()) {
            res.json({error: erros.mapped()});
            return;
        }

        const data = matchedData(req);

        const user = await User.findOne({email: data.email});

        if(user) {
            res.json({error: 'E-mail já existe!'});
            return;
        }

        const passwordHash = await bcrypt.hash(data.password, 10);
        const ruleTokenHash = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(ruleTokenHash, 10);

        const newUser = new User({
            name: data.name,
            email: data.email,
            passwordHash,
            token, 
            avatar: 'default'
        });

        await newUser.save();
        res.json(true);
    },
    infoUser: async (req, res) => {
        const user = await User.findById({_id: req.query.id});

        if(!user) {
           res.json({error: 'Usuário não existe.'});
           return;
           
        }

        res.json({user: {
            name: user.name,
            email: user.email
        }});
    },
    infoUserAction: async (req, res) => {
        const erros = validationResult(req);
        if(!erros.isEmpty()) {
            res.json({error: erros.mapped()});
            return;
        }

        const data = matchedData(req);

        if(data.name && !data.password) {
            const user = await User.findByIdAndUpdate({_id: data.id}, {
                name: data.name
            });

            const userAfterUpdate = await User.findById({_id: data.id});

            res.json({user:{
                name: userAfterUpdate.name,
                email: userAfterUpdate.email,
                avatar: userAfterUpdate.avatar
            }});

            return;
        }

        if(!data.name && data.password) {
            const passwordHash = await bcrypt.hash(data.password, 10);
            const user = await User.findByIdAndUpdate({_id: data.id}, {
                passwordHash
            });

            const userAfterUpdate = await User.findById({_id: data.id});

            res.json({user:{
                name: userAfterUpdate.name,
                email: userAfterUpdate.email,
                avatar: userAfterUpdate.avatar
            }});

            return;
        }

        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await User.findByIdAndUpdate({_id: data.id}, {
            name: data.name,
            passwordHash
        });

        const userAfterUpdate = await User.findById({_id: data.id});

        res.json({user:{
            name: userAfterUpdate.name,
            email: userAfterUpdate.email,
            avatar: userAfterUpdate.avatar
        }});
    },
    avatarAction: async (req, res) => {
        const userHasAvatar = await User.findById({_id: req.body.id});

        if(userHasAvatar.avatar != 'default') {
            await remove.removeAvatar(userHasAvatar.avatar);

            const user = await User.findByIdAndUpdate({_id: req.body.id}, {
                avatar: `${process.env.BASE}/images/avatar/${req.file.filename}`
            });
    
            const userAfterUpdate = await User.findOne({_id: req.body.id});
            res.json({user: {
                name: userAfterUpdate.name,
                email: userAfterUpdate.email,
                avatar: userAfterUpdate.avatar
            }});

            return;
        }

        const user = await User.findByIdAndUpdate({_id: req.body.id}, {
            avatar: `${process.env.BASE}/images/avatar/${req.file.filename}`
        });

        const userAfterUpdate = await User.findOne({_id: req.body.id});
        res.json({user: {
            name: userAfterUpdate.name,
            email: userAfterUpdate.email,
            avatar: userAfterUpdate.avatar
        }});
    },
    watchVideo: (req, res) => {
        var path = '';
        if(req.params.urlLesson) {
            path = pathDirectory.pathToVideos() + '/' + req.params.urlLesson + '.mp4';
        }

        if(!req.params.urlLesson) {
            path = pathDirectory.pathToVideos() + '/' + req.params.urlVideo + '.mp4'; //criar slug
        }
        
        const stat = fs.statSync(path);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize-1;
            const chunksize = (end-start) + 1;
            const file = fs.createReadStream(path, {start, end});
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(path).pipe(res);
        }
    },
    course: async (req, res) => {
        const course = await Course.findOne({title: req.params.nameCourse});
        res.json({course: course});//pegar o conteúdo do curso pela nome do curso
    },
    courseAvailable: async (req, res) => {
        const available = await courseAvailable.find();
        
        let courses = [];

        if(available.length > 0) {
            for(let i in available) {
                available[i].img = `${process.env.BASE}${process.env.BASE_BANNER}/${available[i].img}`;
                courses.push(available[i]);
            }
        }

        res.json({available: courses}); 
    },
    watchedLesson: async (req, res) => {
        const course = await Course.findOne({title: req.body.nameCourse}); 

        if(course) {
            const allModules = await course.modules.filter(module => { 
                return module.titleModule !== req.body.titleModule;
            });
            
            const module = await course.modules.filter(module => { 
                return module.titleModule === req.body.titleModule;
            });

            const allLessons = await module[0].lessons.filter(lesson => {
                return lesson.title !== req.body.lesson;
            });

            const lesson = await module[0].lessons.filter(lesson => { 
                return lesson.title === req.body.lesson;
            });

            

           const lessons = [...allLessons]; 
            
           const allWatcheds = [...lesson[0].watched]; 
           
            const newId = { 
                id: req.body.id
            };
            
            const watchedsUpdated = [...allWatcheds, newId]; 
            

            lesson[0].watched = watchedsUpdated; 
             
            const lessonsUpdated = [...lessons, lesson[0]]
            
            module[0].lessons = [...lessonsUpdated]; 
           
            
            const modulesUpdated = [...allModules, module[0]]; 

            await Course.findOneAndUpdate({title: req.body.nameCourse}, {$set: {modules: modulesUpdated}});
        }
    },
    downloadFile: async (req, res) => {
        var filePath = pathDirectoryFile.pathFile();
        var filename = req.params.archive;

        res.download(`${filePath}/${filename}`, filename);

        //caminhoda pasta dos files/nome do arquivo, nome que o browser irá da
    }
};