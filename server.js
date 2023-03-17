/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: ____Meetpal Singh____________ Student ID: __125926212_ Date: _2023/2/17_________
*
* Cyclic Web App URL: _______________https://inquisitive-battledress-pig.cyclic.app/
*
* GitHub Repository URL: _________https://github.com/meetpal0001/web322-app.git
*
********************************************************************************/


var express = require("express");
var path = require("path");
var blog = require("./blog-service");
const bodyParser = require('body-parser');

const exphbs = require('express-handlebars');

const stripJs = require('strip-js');

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


app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    navLink: function (url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },

    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },

    safeHTML: function (context) {
      return stripJs(context);
    }
  }
}));
app.set('view engine', '.hbs');



var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
  res.redirect("/blog");
});


app.get("/posts/add", function (req, res) {
  res.render('addPost');

});


// setup another route to listen on /about
app.get("/about", function (req, res) {
  res.render('about');
});

app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try {

    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })

});

app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try {

    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blog.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })
});

app.get("/posts", function (req, res) {
  blog.getAllPosts().then(function (posts) {
    let cat = req.query.category;
    let date = req.query.minDate;
    if (cat != undefined) {
      blog.getPostsByCategory(cat).then(function (posts) {
        res.render("posts", {
          posts:
            posts
        })

      })
        .catch(function (err) {
          res.render("posts", { message: "no results" });

        })

    } else if (date != undefined) {
      blog.getPostsByMinDate(date).then(function (posts) {
        res.render("posts", {
          posts:
            posts
        })

      })
        .catch(function (err) {
          res.render("posts", { message: "no results" });

        })
    }

    else
      res.render("posts", { posts: posts })

  })
    .catch(function (err) {
      res.render("posts", { message: "no results" });
    });
});

app.get("/categories", function (req, res) {
  blog.getCategories().then(function (categories) {
    res.render("categories", { categories: categories });
  })
    .catch(function (err) {
      res.render("categories",
        { message: "no results" });
    });
});

app.get("/posts/:value", function (req, res) {
  blog.getAllPosts().then(function (posts) {
    id = req.params.value;
    blog.getPostsById(id).then(function (posts) {
      res.json(posts);

    })
      .catch(function (err) {
        res.json({ "message": err });

      });
  }).catch(function (err) {
    res.json({ "message": err });
  });
});


app.post("/posts/add", upload.single("featureImage"), function (req, res) {

  if (req.file) {
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
    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost("");
  }
  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts


    blog.addPost(req.body).then(function (postData) {
      res.redirect('/posts');
    })
  }
});


app.use((req, res) => {
  res.status(404).render("404",
    { message: "Page Not Found" })
});

// setup http server to listen on HTTP_PORT

blog.initialize().then(function () {
  app.listen(HTTP_PORT, onHttpStart);
})
  .catch(function (reason) {
    console.log(reason);
  });