const { validationResult, matchedData } = require('express-validator');

const CadCourse = require('../models/CadCourse');
const Course = require('../models/Course');

module.exports = {
    createCourse: async (req, res) => {
        if(req.file.filename && req.body.title && req.body.name) {
            const newCourse = await CadCourse({
                title: req.body.title,
                name: req.body.name,
                img: req.file.filename,
                status: req.body.status
            });

            await newCourse.save();

            res.json({result: 'saved'});
            return;
        } 

        res.json({error: 'Algum erro ocorreu ao salvar o curso. Tente mais tarde!'});
    },
    getModuleCourse: async (req, res) => {
        const course = await Course.findOne({title: req.query.title});
        
        if(course) {
            res.json({modules: course.modules});

            return;
        } else {
            res.json({error: 'Nenhum resultado encontrado'});
        }
    },
    createModule: async (req, res) => {
        const course = await Course.findOne({title: req.body.courseSelected});

        if(course) {
            let errors = [];

            const modules = [...course.modules];

            const moduleIsExists = await course.modules.filter(course =>  {
                let titleModule = course.titleModule;
                let nameModule = req.body.nameModule;

                let titleM = titleModule.trim().toLowerCase();
                let nameM = nameModule.trim().toLowerCase();
               
                if(titleM === nameM) {
                    errors.push(`Módulo com o tema '${req.body.nameModule}' já existe! Altere o tema ou edite o módulo já existente.`);
                }
            });

            if(errors.length > 0) {
                res.json({errors});
                return;
            }

            const newModule = {
                numberModule: course.modules.length + 1,
                titleModule:  req.body.nameModule,
                lessons: []
            };

            const modulesUpdated = [...modules, newModule];

            await Course.findOneAndUpdate({title: req.body.courseSelected}, {$set: {modules: modulesUpdated}});
            
            res.json({res: 'saved'});
            return;
        }

        const newCourse = new Course({
            title: req.body.courseSelected,
            introduction: {
                title: '',
                url: ''
            },
            modules: [{
                numberModule: 1,
                titleModule: req.body.nameModule,
                lessons: [],
            }]
        });

        await newCourse.save();
        
        res.json({res: 'saved'});
        
    },
    createLesson: async (req, res) => {
        let nameFormated = req.body.course.replace('-', '');
        let nameClean = nameFormated.replace(/[0-999]/g, '').trim();
        
        const course = await Course.findOne({title: req.body.nameCourse.toLowerCase()});
    
        if(course) {
            const allModules = course.modules.filter(module => {  
                return module.titleModule !== nameClean;
            });

            const module = course.modules.filter(module => { 
               return module.titleModule === nameClean; 
            });
            
            const allLessons = [...module[0].lessons]; 
            
            const newLesson = {
                title: req.body.nameLesson,
                numberLessons: allLessons.length + 1,
                url: req.file.filename.split('.')[0]
            };

            const lessonsUpdated = [...allLessons, newLesson]; 
            module[0].lessons = lessonsUpdated; 

            const moduleUpdated = [...allModules, {
                numberModule: module[0].numberModule,
                titleModule: module[0].titleModule,
                lessons: module[0].lessons //avisar que não aceitar caracteres especiais
            }]; 
            
            await Course.findOneAndUpdate({title: req.body.nameCourse.toLowerCase()}, {$set: {modules: moduleUpdated}});
        }

        
        res.json({res: 'saved'});
    }
};