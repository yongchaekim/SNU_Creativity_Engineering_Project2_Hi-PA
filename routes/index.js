var express = require('express');
var router = express.Router();
var User = require('../model/user');
var app = express();
var nodemailer = require('nodemailer');

var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());


app.set('view engine', 'ejs');

router.get('/invitation', function(req, res, next){
    return res.render('invitation.ejs');
});

router.post('/invitation', (req, res, next) => {

var transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'echae_kim@hotmail.com',
    pass: 'eungchaekim117'
  }
});

var mailOptions = {
  from: 'echae_kim@hotmail.com',
  to: req.body.email,
  subject: 'Sending Invitation of our system',
  text: 'Welcome to Presentation Assistant System! Please click the following link to access our page http://localhost:8000/' + '\n' + req.body.message
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
    console.log('Not a valid email address');
    res.send({"Success": "Not a valid email."});
  } else {
    console.log('Email sent: ' + info.response);
    res.send({"Success": "Invitation successfully sent."});
  }
});
});


router.get('/presenter/:id', (req, res) => {

	User.findOne({unique_id:req.session.userId}, function(err, data){
        console.log("Access presenter");
        console.log(data);
        if(!data || req.session.access_flags == 1){
            res.redirect('/');
        }else{
            console.log('Presenter connected');
  		    if (req.params.id === /*'$up3r$3cr3tk3ythatwiIIb3g3n3rat3d'*/'aa') {
                req.session.access_flags = 1;
                    
       			 res.render('index.ejs',{isPresenter: true,"username":data.username});
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
        if(!data || req.session.access_flags == 1){
            res.redirect('/');
        }else{
            console.log('Audience connected');
            req.session.access_flags = 1;
  		    return res.render('index', {isPresenter: false,"username":data.username});
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
                        res.send({"Success": "Email is already used. Register with another email."});
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

router.get('/emotion', function(req, res, next){
    return res.render('emotion.ejs');
});

router.post('/login', function(req, res, next){
    User.findOne({email:req.body.email}, function(err, data){
        if(data){
            if(data.password == req.body.password){
                req.session.userId = data.unique_id;
                req.session.access_flags = 0;
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
        
        if(!data || req.session.access_flags == 1){
            res.redirect('/');
        }else{
            req.session.access_flags = 0;
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
                req.session.access_flags = 0;
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

router.get('/delete', function(req, res, next){
    return res.render('delete.ejs');
});

router.post('/delete', function(req, res, next){
    User.findOne({email:req.body.email}, function(err, data){
        if(data){
            if(data.password == req.body.password){
                req.session.userId = data.unique_id;
                User.deleteOne({email:req.body.email}, function(err, data){ 
                    if(err) throw err;
                });
                res.send({"Success":"Successfully deleted account!"});

            }else{
                res.send({"Success":"Wrong password!"});
            }
        }else{
            res.send({"Success":"This Email is not registered, and could not be found!"});
        }
    });
});

module.exports = router;