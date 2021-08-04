const { validationResult, matchedData } = require('express-validator');

const CadCourse = require('../models/CadCourse');
const Course = require('../models/Course');

module.exports = {
    createCourse: async (req, res) => {
        if(req.file.filename && req.body.title && req.body.name) {
            const newCourse = await CadCourse({
                title: req.body.title,
                course: req.body.name,
                img: req.file.filename,
                status: req.body.status
            });
            //corrigir alguns bugs restantes
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
        let nameClean = req.body.course.split('-')[1].trim();
        
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
    },
    addFileToLesson: async (req, res) => {
        const course = await Course.findOne({title: req.body.course.toLowerCase()});
    
        if(course) {
            const allModules = course.modules.filter(module => {  //pega todos os modulos
                return module.titleModule !== req.body.module;
            });

            const module = course.modules.filter(module => {  //retira o modulo para editar
               return module.titleModule === req.body.module; 
            });
            
            const allLessons = [...module[0].lessons]; //copia as aulas do modulo

            //pega as aulas sem a aula desejada
            const AlllessonsToUpdate = allLessons.filter(lesson => {
                return lesson.title !== req.body.lesson;
            });

            //pegar a aula que quero editar
            const lesson = allLessons.filter(lesson => {
                return lesson.title === req.body.lesson;
            });

            //adiciona o arquivo na aula desejada
            lesson[0].file = req.file.filename;

            //atualiza as aulas
            const lessonsUpdated = [...AlllessonsToUpdate, {
                title: lesson[0].title,
                numberLessons: lesson[0].numberLessons,
                url: lesson[0].url,
                file: lesson[0].file,
                watched: lesson[0].watched
            }];
            
            //adiciona as aulas atualizadas no modulo
            module[0].lessons = lessonsUpdated;
            
            const moduleUpdated = [...allModules, {
                numberModule: module[0].numberModule,
                titleModule: module[0].titleModule,
                lessons: module[0].lessons //avisar que não aceitar caracteres especiais
            }]; 
            
            await Course.findOneAndUpdate({title: req.body.course.toLowerCase()}, {$set: {modules: moduleUpdated}});
            res.json({res: 'saved'});
        }
    },
    getDataLesson: async (req, res) => {
        const course = await Course.findOne({title: req.query.course});

        if(course) {
            const allModules = course.modules.filter(module => (
                module.titleModule !== req.query.titleModule
            ));

            const module = course.modules.filter(module => (
                module.titleModule === req.query.titleModule
            ));

            const allLessons = module[0].lessons;

            const lesson = allLessons.filter(lesson => (
                lesson.title === req.query.titleLesson
            ))

            res.json({modules: lesson[0]});
        }
    }
};