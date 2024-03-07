/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: ____Meetpal Singh____________ Student ID: __125926212_ Date: _2023/4/23_________
*
* Cyclic Web App URL: _______________https://inquisitive-battledress-pig.cyclic.app/
*
* GitHub Repository URL: _________https://github.com/meetpal0001/web322-app.git
*
*******************************************************************************/


var express = require("express");
var path = require("path");
var blog = require("./blog-service");
var authData = require("./auth-service");

const bodyParser = require('body-parser');
const clientSessions = require('client-sessions');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: 'dl8suci0p',
  api_key: '154896697852268',
  api_secret: '3xiB-rvmIA8dtonOGYnpaiOuLkM',
  secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage

var app = express();

app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "wbe322_assignment", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 2000 * 60 // the session will be extended by this many ms each request (2 minute)
}));



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
    },

    formatDate: function (dateObj) {
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
}));
app.set('view engine', '.hbs');


app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});


function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

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


app.get("/posts/add", ensureLogin, function (req, res) {
  blog.getCategories().then(function (data) {
    res.render("addPost", { categories: data });
  }).catch(function () {
    res.render("addPost", { categories: [] });
  })

});


app.get("/categories/delete/:id", ensureLogin, function (req, res) {
  id = req.params.id;
  blog.deleteCategoryById(id).then(function () {
    res.redirect('/categories');

  }).catch(function () {
    res.status(500).send("Unable to Remove Category / Category not found)");
  })

});


app.get("/posts/delete/:id", ensureLogin, function (req, res) {
  id = req.params.id;
  blog.deletePostById(id).then(function () {
    res.redirect('/posts');

  }).catch(function () {
    res.status(500).send("Unable to Remove Post / Post not found)");
  })

});

app.get("/categories/add", ensureLogin, function (req, res) {
  res.render('addCategory');

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

app.get("/posts", ensureLogin, function (req, res) {
  blog.getAllPosts().then(function (posts) {
    let cat = req.query.category;
    let date = req.query.minDate;
    if (cat != undefined) {
      blog.getPostsByCategory(cat).then(function (posts) {
        if (posts.length > 0) {
          res.render("posts", {
            posts:
              posts
          })
        }

        else {
          res.render("posts", { message: "no results" });
        }

      })
        .catch(function (err) {
          res.render("posts", { message: "no results" });

        })

    } else if (date != undefined) {
      blog.getPostsByMinDate(date).then(function (posts) {
        if (posts.length > 0) {
          res.render("posts", {
            posts:
              posts
          })
        }

        else {
          res.render("posts", { message: "no results" });
        }

      })
        .catch(function (err) {
          res.render("posts", { message: "no results" });

        })
    }

    else {
      if (posts.length > 0) {
        res.render("posts", { posts: posts })
      }

      else {
        res.render("posts", { message: "no results" });
      }

    }
  })
    .catch(function (err) {
      res.render("posts", { message: "no results" });
    });
});

app.get("/categories", ensureLogin, function (req, res) {
  blog.getCategories().then(function (categories) {
    if (categories.length > 0) {
      res.render("categories", { categories: categories });
    }

    else {
      res.render("categories", { message: "no results" });
    }
  })
    .catch(function (err) {
      res.render("categories",
        { message: "no results" });
    });
});

app.get("/posts/:value", ensureLogin, function (req, res) {
  blog.getAllPosts().then(function (posts) {
    id = req.params.value;
    blog.getPostById(id).then(function (posts) {
      res.json(posts);

    })
      .catch(function (err) {
        res.json({ "message": err });

      });
  }).catch(function (err) {
    res.json({ "message": err });
  });
});


app.post("/posts/add", ensureLogin, upload.single("featureImage"), function (req, res) {

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


    blog.addPost(req.body).then(function () {
      res.redirect('/posts');
    })
  }
});

app.post("/categories/add", ensureLogin, function (req, res) {

  blog.addCategory(req.body).then(function () {
    res.redirect('/categories');
  })
});

app.get("/login", function (req, res) {
  res.render('login');
});

app.post("/login", function (req, res) {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body).then((user) => {
    req.session.user = {
      userName: user.userName, // authenticated user's userName
      email: user.email,// authenticated user's email
      loginHistory: user.loginHistory// authenticated user's loginHistory
    }
    res.redirect('/posts');
  }).catch((err) => {
    res.render('login', { errorMessage: err, userName: req.body.userName });
  })
});

app.get("/register", function (req, res) {
  res.render('register');
});

app.post("/register", function (req, res) {
  4
  authData.registerUser(req.body).then(() => {
    res.render('register', { successMessage: "User created" });
  }).catch((err) => {
    res.render('register', { errorMessage: err, userName: req.body.userName });
  })
});

app.get("/logout", function (req, res) {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, function (req, res) {
  res.render('userHistory');

});

app.use((req, res) => {
  res.status(404).render("404",
    { message: "Page Not Found" })
});

// setup http server to listen on HTTP_PORT

blog.initialize()
  .then(authData.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT)
    });
  }).catch(function (err) {
    console.log("unable to start server: " + err);
  });