var express = require('express');
var router = express.Router();
var User = require('../model/user');


router.get('/presenter/:id', (req, res) => {

	User.findOne({unique_id:req.session.userId}, function(err, data){
        console.log("Access presenter");
        console.log(data);
        if(!data){
            res.redirect('/');
        }else{
            console.log('Presenter connected');
  		    if (req.params.id === /*'$up3r$3cr3tk3ythatwiIIb3g3n3rat3d'*/'aa') {
       			return res.render('index.ejs', {isPresenter: true,"name":data.username});
    		} else {
        	res.status(401);
    		}
        }
    });
});

router.get('/audience', (req, res) => {
	User.findOne({unique_id:req.session.userId}, function(err, data){
        console.log("Access presenter");
        console.log(data);
        if(!data){
            res.redirect('/');
        }else{
            console.log('Audience connected');
  		    return res.render('index', {isPresenter: false,"name":data.username});
        }
    });
});

router.get('/slideshow', (req, res) => {
    res.render('slideshow');
})

router.post('/', function(req, res, next) {
    console.log(req.body);
    var personInfo = req.body;

    if(!personInfo.email || !personInfo.username || ! personInfo.password || !personInfo.passwordConf) {
        res.send();
    }else {
        if(personInfo.password == personInfo.passwordConf) {
            User.findOne({email:personInfo.email}, function(err, data) {
                if(!data) {
                    var c;
                    User.findOne({}, function(err, data) {
                            if(data) {
                                console.log("if");
                                c = data.unique_id + 1;
                            } else {
                                c = 1;
                            }
                            var newPerson = new User({
                                    unique_id:c,
                                    email:personInfo.email,
                                    username:personInfo.username,
                                    password:personInfo.password,
                                    passwordConf:personInfo.passwordConf
                            });
                            
                            newPerson.save(function(err, Person) {
                              if(err)
                                console.log(err);
                              else
                                console.log('Success');  
                            })
                        }).sort({_id:-1}).limit(1);
                        res.send({"Success":"You are registed, You can login to our system now."});
                }else{
                        res.send({"Success": "Email is already used."});
                }
            });
        }else{
            res.send({"Success":"Password is not matched"});
        }
    }
});           

router.get('/login', function(req, res, next){
    return res.render('login.ejs');
});

router.post('/login', function(req, res, next){
    User.findOne({email:req.body.email}, function(err, data){
        if(data){
            if(data.password == req.body.password){
                req.session.userId = data.unique_id;
                res.send({"Success":"Success!"});
            }else{
                res.send({"Success":"Wrong password!"});
            }
        }else{
            res.send({"Success":"This Email is not registered!"});
        }
    });
});

router.get('/profile', function(req, res, next){
    console.log("profile");
    User.findOne({unique_id:req.session.userId}, function(err, data){
        console.log("data");
        console.log(data);
        if(!data){
            res.redirect('/');
        }else{
            return res.render('data.ejs', {"name":data.username, "email":data.email});
        }
    });
});     

router.get('/logout', function(req, res, next){
    console.log("logout");
    if(req.session){
        req.session.destroy(function(err){
            if(err){
                return next(err);
            }else{
                return res.redirect('/');
            }
        });
    }
});

router.get('/forgetpass', function(req, res, next){
    res.render("forget.ejs");
});

router.post('/forgetpass', function(req, res, next){
    User.findOne({email:req.body.email}, function(err, data){
        console.log(data);
        if(!data){
            res.send({"Success":"This Email is not registed!"});
        }else{
            if(req.body.password == req.body.passwordConf){
                data.password = req.body.password;
                data.passwordConf = req.body.passwordConf;

                data.save(function(err, Person){
                if(err)
                    console.log(err);
                else{
                    console.log('Success');
                    res.send({"Success":"Password changed!"});
                }
               });
            }else{
                res.send({"Success":"Password does not matched! Both Password should be same."});
            }
        }
    });
});

module.exports = router;