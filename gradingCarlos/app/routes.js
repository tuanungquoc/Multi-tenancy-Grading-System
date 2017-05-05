// app/routes.js
// TENANT_ID: tenant.TENANT_ID
var unzip = require('unzip-stream');

module.exports = function(app, passport,featureToggles,upload,fs,mysql,jar,tenant) {

    var toggles = {};


    app.get('/'+tenant.TENANT_ID+'/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') ,TENANT_ID: tenant.TENANT_ID});
    });

    app.post('/'+tenant.TENANT_ID+'/login', passport.authenticate('local-login', {
        successRedirect : '/'+tenant.TENANT_ID+'/grading', // redirect to the secure profile section
        failureRedirect : '/'+tenant.TENANT_ID+'/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));



    app.get('/'+tenant.TENANT_ID+'/grading', isLoggedIn, function(req, res) {
      mysql.getConnection(function(err, conn){
          conn.query("select F.FIELD_NAME, F.TOGGLE from TENANT_TABLE T, TENANT_FIELDS F where T.TENANT_ID = F.TENANT_ID and T.TENANT_ID ='"+tenant.TENANT_ID+"' order by F.FIELD_COLUMN", function(err, rows) {
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
                      pageTitle: 'Grading',
                      TENANT_ID: tenant.TENANT_ID
                  });
                  conn.release();
          })
      });


    });

    function deleteFolderRecursive(path) {
      if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
          var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    };
    app.post('/'+tenant.TENANT_ID+'/parsing',isLoggedIn,upload.single('file'), function (req, res,next ) {
      //delete previous result
      var gutil = require('gulp-util');

      fs.exists('./public/'+tenant.TENANT_ID+'/parsing/result.png', function(exists) {
        if(exists) {
          //Show in green
          console.log(gutil.colors.green('File exists. Deleting now ...'));
          fs.unlink('./public/'+tenant.TENANT_ID+'/parsing/result.png');
        } else {
          //Show in red
          console.log(gutil.colors.red('File not found, so not deleting.'));
        }
      });
      var exec = require('child_process').exec;
      var cmd ="python3 "+jar.jar+" -s ./public/unzip/";
      console.log(cmd);
      exec(cmd, function(error, stdout, stderr) {
      // command output is in stdout
          if(error){
            console.log(gutil.colors.red(error));
            res.json({image:false,error:error});
          }else{

            console.log(gutil.colors.green("Parsing successfully  "));
            var oldPath = 'umlparser/Output.png'
            var newPath = './public/'+tenant.TENANT_ID+'/parsing/result.png'
            fs.rename(oldPath, newPath, function (err) {
              if (err) throw err
              console.log('Successfully renamed - AKA moved!')
              res.json({image:true,error:{},TENANT_ID: tenant.TENANT_ID});
            })


          }
      });
    })
    app.post('/'+tenant.TENANT_ID+'/grading',isLoggedIn,upload.single('file'), function (req, res,next ) {

          // delete all files in unzip folder
         if(req.file != null){
           var path = "./public/"+tenant.TENANT_ID+"/unzip/";
           deleteFolderRecursive(path);

           fs.createReadStream(req.file.path).pipe(unzip.Extract({ path: './public/'+tenant.TENANT_ID+'/unzip/' }));
           res.render('grading.ejs', {
                       user : req.user,
                       image: false,// get the user out of session and pass to template,
                     pageTitle: 'Grading',
                     TENANT_ID: tenant.TENANT_ID
            });
        }
        else{
          res.render('grading.ejs', {
                      user : req.user,
                      image: false,// get the user out of session and pass to template,
                    pageTitle: 'Grading',
                    TENANT_ID: tenant.TENANT_ID
           });
        }
    })


    app.post('/'+tenant.TENANT_ID+'/persitgrade',isLoggedIn, function (req, res,next ) {
        var columns =[];
        mysql.getConnection(function(err, conn){
            conn.query("select F.FIELD_NAME, F.FIELD_COLUMN from TENANT_TABLE T, TENANT_FIELDS F where T.TENANT_ID = F.TENANT_ID and T.TENANT_ID ='"+tenant.TENANT_ID+"' and F.TOGGLE = 1 order by F.FIELD_COLUMN", function(err, rows) {
                    columns = JSON.parse(JSON.stringify(rows));
                    var query = "INSERT INTO TENANT_DATA( RECORD_ID, TENANT_ID, TENANT_TABLE";
                    for(var i=0 ; i < columns.length ; i++){
                      query = query + ", COLUMN_" + columns[i].FIELD_COLUMN;
                    }
                    query = query + " ) values ( '"+  new Date() +"', '"+tenant.TENANT_ID+"','TENANT_A'";
                    console.log(typeof req.body.grade);
                    var temp = JSON.parse(JSON.stringify(req.body));
                    for(var j =0 ; j < temp.grade.length; j++){
                        query = query + ", '" + temp.grade[j] + "'";

                    }
                    query = query + " )";
                    console.log(query);

                    mysql.getConnection(function(err, conn){
                        conn.query(query, function(err, rows) {
                                res.redirect("/"+tenant.TENANT_ID+"/grading");
                        })
                    });
            })
        });


    })

    app.get('/'+tenant.TENANT_ID+'/grades',isLoggedIn, function (req, res,next ) {
        var columns =[];
        mysql.getConnection(function(err, conn){
            conn.query("select F.FIELD_NAME, F.FIELD_COLUMN from TENANT_TABLE T, TENANT_FIELDS F where T.TENANT_ID = F.TENANT_ID and T.TENANT_ID ='"+tenant.TENANT_ID+"' and F.TOGGLE = 1 order by F.FIELD_COLUMN", function(err, rows) {
                    columns = JSON.parse(JSON.stringify(rows));
                    var query = "SELECT RECORD_ID";
                    for(var i=0 ; i < columns.length ; i++){
                      query = query + ", COLUMN_" + columns[i].FIELD_COLUMN;
                    }
                    query = query + " from TENANT_DATA where TENANT_ID='"+tenant.TENANT_ID+"'";
                    mysql.getConnection(function(err, conn){
                        conn.query(query, function(err, myrows) {
                                console.log(myrows);
                                res.render('grades.ejs', {
                                    user : req.user,
                                    pageTitle: 'Grades',
                                    grades: JSON.parse(JSON.stringify(myrows)),
                                    TENANT_ID: tenant.TENANT_ID
                                });
                        })
                    });
            })
        });


    })
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/'+tenant.TENANT_ID+'/logout', function(req, res) {
        featureToggles.load(toggles);
        req.logout();
        res.redirect('/'+tenant.TENANT_ID+'/login');
    });

    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/'+tenant.TENANT_ID+'/login');
    }

};

// route middleware to make sure a user is logged in
