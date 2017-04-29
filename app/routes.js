// app/routes.js
module.exports = function(app, passport,featureToggles,upload,fs,mysql) {
    var tenantList = [];
    var toggles = {};
    mysql.getConnection(function(err, conn){
        conn.query("select * from TENANT_TABLE", function(err, rows) {
                tenantList = JSON.parse(JSON.stringify(rows));
                conn.release();
        })
    });

    //loading all feature toggles



    app.get('/data', function (req, res) {
        res.send({ data: [
            { id: 5, name: 'Bill' },
            { id: 1, name: 'Bob' }
        ]});
    });
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs fi
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user, // get the user out of session and pass to template
            pageTitle: 'Profile Page'
        });
    });

    app.get('/tenants', isLoggedIn, function(req, res) {
        res.render('tenantsetup.ejs', {
            user : req.user,
            itemSelected: {},
            pageTitle: 'Tenants',
            tenantList: tenantList,
            toggleList: []
        });

    });

    app.post('/tenants',isLoggedIn, function (req, res,next ) {
        mysql.getConnection(function(err, conn){
            conn.query("select F.FIELD_NAME, F.TOGGLE from TENANT_TABLE T, TENANT_FIELDS F where T.TENANT_ID = F.TENANT_ID and T.TENANT_ID ='"+ req.body.tenant + "' order by F.FIELD_COLUMN", function(err, rows) {
                    res.render('tenantsetup.ejs', {
                        user : req.user, // get the user out of session and pass to template
                        itemSelected: req.body.tenant,
                        pageTitle: 'Tenants',
                        tenantList: tenantList,
                        toggleList: JSON.parse(JSON.stringify(rows))
                    });
                    conn.release();
            })
        });


    })


    app.post('/tenantstest',isLoggedIn, function (req, res,next ) {
        var gradingAttr = req.body.action1;
        var pkId = req.body.action2;
        mysql.getConnection(function(err, conn){
            console.log(pkId);
            var update_tasks="UPDATE TENANT_FIELDS SET TOGGLE= NOT TOGGLE WHERE TENANT_ID=? and FIELD_NAME=?";
            conn.query(update_tasks,[pkId,gradingAttr],function (er, results, rows, fields){
                if (er) {
                   console.log("Error "+JSON.stringify(er));
                   res.status(500).send(er);
                } else{
                   res.status(200).json(results);
                }
                conn.release();
            });
        });

    });

    app.get('/grading', isLoggedIn, function(req, res) {
      mysql.getConnection(function(err, conn){
          conn.query("select F.FIELD_NAME, F.TOGGLE from TENANT_TABLE T, TENANT_FIELDS F where T.TENANT_ID = F.TENANT_ID and T.TENANT_ID ='007671040' order by F.FIELD_COLUMN", function(err, rows) {

                  var results = JSON.parse(JSON.stringify(rows));
                  console.log(results);
                  for(var i = 0 ; i < rows.length ; i++){
                      var toggleOn = false;
                      if(results[i].TOGGLE == 0 ){
                        toggles[results[i].FIELD_NAME] = false;
                      } else {
                         toggles[results[i].FIELD_NAME] = true;
                      }
                  }
                  featureToggles.load(toggles);
                  res.render('grading.ejs', {
                      user : req.user,
                      image: false ,// get the user out of session and pass to template,
                      pageTitle: 'Grading'
                  });
                  conn.release();
          })
      });


    });

    app.post('/grading',isLoggedIn,upload.single('file'), function (req, res,next ) {


         console.log(req.file.name);
         console.log(req.file.path);
         console.log(req.file.type);
         console.log(req.file);
         //var file = __dirname  +  "result.png";
         var file = "./public/images/result.png"
         fs.readFile( req.file.path, function (err, data) {
            fs.writeFile(file, data, function (err) {
                  if( err ){
                    console.log( err );
                  }else{
                     response = {
                        message:'File uploaded successfully',
                        filename:req.file.name
                     };
                  }
               console.log( response );
               res.render('grading.ejs', {
                   user : req.user,
                   image: true,// get the user out of session and pass to template,
                   pageTitle: 'Grading'
               });
            });
         });
    })
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        featureToggles.load(toggles);
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
