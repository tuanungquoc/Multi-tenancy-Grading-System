// app/routes.js

var unzip = require('unzip-stream');

module.exports = function(app, passport,featureToggles,upload,fs,mysql,jar) {

    var toggles = {};


    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/grading', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));



    app.get('/grading', isLoggedIn, function(req, res) {
      mysql.getConnection(function(err, conn){
          conn.query("select F.FIELD_NAME, F.TOGGLE from TENANT_TABLE T, TENANT_FIELDS F where T.TENANT_ID = F.TENANT_ID and T.TENANT_ID ='007671040' order by F.FIELD_COLUMN", function(err, rows) {

                  // var results = JSON.parse(JSON.stringify(rows));
                  // console.log(results);
                  // for(var i = 0 ; i < rows.length ; i++){
                  //     var toggleOn = false;
                  //     if(results[i].TOGGLE == 0 ){
                  //       toggles[results[i].FIELD_NAME] = false;
                  //     } else {
                  //        toggles[results[i].FIELD_NAME] = true;
                  //     }
                  // }
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
    app.post('/parsing',isLoggedIn,upload.single('file'), function (req, res,next ) {
      //delete previous result
      var gutil = require('gulp-util');

      fs.exists('./public/parsing/result.png', function(exists) {
        if(exists) {
          //Show in green
          console.log(gutil.colors.green('File exists. Deleting now ...'));
          fs.unlink('./public/parsing/result.png');
        } else {
          //Show in red
          console.log(gutil.colors.red('File not found, so not deleting.'));
        }
      });
      var exec = require('child_process').exec;
      var cmd ="java -jar ./"+jar.jar+" ./public/unzip/ ./public/parsing/result.png";
      console.log(cmd);
      exec(cmd, function(error, stdout, stderr) {
      // command output is in stdout
          if(error){
            console.log(gutil.colors.red(error));
            res.json({image:false,error:error});
          }else{
            console.log(gutil.colors.green("Parsing successfully  "));
            res.json({image:true,error:{}});
          }
      });

    })
    app.post('/grading',isLoggedIn,upload.single('file'), function (req, res,next ) {

          // delete all files in unzip folder
         if(req.file != null){
           var path = "./public/unzip/";
           deleteFolderRecursive(path);

           fs.createReadStream(req.file.path).pipe(unzip.Extract({ path: './public/unzip/' }));
           res.render('grading.ejs', {
                       user : req.user,
                       image: false,// get the user out of session and pass to template,
                     pageTitle: 'Grading'
            });
        }
        else{
          res.render('grading.ejs', {
                      user : req.user,
                      image: false,// get the user out of session and pass to template,
                    pageTitle: 'Grading'
           });
        }
        //  console.log(req.file.name);
        //  console.log(req.file.path);
        //  console.log(req.file.type);
        //  console.log(req.file);
        //  //var file = __dirname  +  "result.png";
        //  var file = "./public/images/result.png"
        //  fs.readFile( req.file.path, function (err, data) {
        //     fs.writeFile(file, data, function (err) {
        //           if( err ){
        //             console.log( err );
        //           }else{
        //              response = {
        //                 message:'File uploaded successfully',
        //                 filename:req.file.name
        //              };
        //           }
        //        console.log( response );
        //        res.render('grading.ejs', {
        //            user : req.user,
        //            image: true,// get the user out of session and pass to template,
        //            pageTitle: 'Grading'
        //        });
        //     });
        //  });
    })
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        featureToggles.load(toggles);
        req.logout();
        res.redirect('/login');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
