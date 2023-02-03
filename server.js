var express = require("express");
var path = require("path");
var blog=require("./blog-service");

var app = express();

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

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
    res.send(posts);
    })
    .catch(function(err){
    res.send({"message":err});
    });
  });

  app.get("/posts", function(req,res){
    blog.getAllPosts().then(function(posts){
        res.send(posts);
        })
        .catch(function(err){
        res.send({"message":err});
        });
  });

  app.get("/categories", function(req,res){
    blog.getCategories().then(function(categories){
        res.send(categories);
        })
        .catch(function(err){
        res.send({"message":err});
        });
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