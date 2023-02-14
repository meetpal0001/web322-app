/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: ____Meetpal Singh____________ Student ID: __125926212_ Date: _2023/2/3_________
*
* Cyclic Web App URL: _______________https://inquisitive-battledress-pig.cyclic.app/
*
* GitHub Repository URL: _________https://github.com/meetpal0001/web322-app.git
*
********************************************************************************/


var express = require("express");
var path = require("path");
var blog=require("./blog-service");
const bodyParser = require('body-parser');

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: 'dtthrsqfm',
  api_key: '226173794417651',
  api_secret: 'NPYA_H3dkcelNGL1gAIXo3UtBSs',
  secure: true
  });

 const upload = multer(); // no { storage: storage } since we are not using disk storage

var app = express();

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.redirect("/about");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
  });

  app.get("/blog", function(req,res){
    blog.getPublishedPosts().then(function(posts){
    res.json(posts);
    })
    .catch(function(err){
    res.json({"message":err});
    });
  });

  app.get("/posts", function(req,res){
    blog.getAllPosts().then(function(posts){
      let cat=req.query.category;
      let date=req.query.minDate;
      if (cat!=undefined) {
        blog.getPostsByCategory(cat).then(function(posts){
          res.json(posts);
  
        })
          .catch(function(err){
          res.json({"message":err});
  
          })
        
      } else if(date!=undefined){
        blog.getPostsByMinDate(date).then(function(posts){
          res.json(posts);
  
        })
          .catch(function(err){
          res.json({"message":err});
  
          })
      }

      else
      res.json(posts);
      
        })
        .catch(function(err){
        res.json({"message":err});
        });
  });

  app.get("/categories", function(req,res){
    blog.getCategories().then(function(categories){
        res.json(categories);
        })
        .catch(function(err){
        res.json({"message":err});
        });
  });

  app.get("/posts/:value", function(req,res){
    blog.getAllPosts().then(function(posts){
      id=req.params.value;
      blog.getPostsById(id).then(function(posts){
        res.json(posts);

      })
        .catch(function(err){
        res.json({"message":err});

        });
    }) .catch(function(err){
      res.json({"message":err});
      });
  });


  app.get("/posts/add", function(req,res){
    res.sendFile(path.join(__dirname,"/views/addPost.html"));
  });

  app.post("/posts/add", upload.single("featureImage"),function(req,res){
    
    if(req.file){
      let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream(
      (error, result) => {
      if (result) {
      resolve(result);
      } else {
      reject(error);
      }
      }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      };
      async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
      }
      upload(req).then((uploaded)=>{
      processPost(uploaded.url);
      });
      }else{
      processPost("");
      }
      function processPost(imageUrl){
      req.body.featureImage = imageUrl;

      // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts


      blog.addPost(req.body).then(function(postData){
      res.redirect('/posts');
      })
      }
  });


  app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });

// setup http server to listen on HTTP_PORT

blog.initialize().then(function(){
    app.listen(HTTP_PORT, onHttpStart);
})
.catch(function(reason){
    console.log(reason);
});