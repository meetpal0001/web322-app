const { json } = require("express");
const fs = require("fs");

var posts;
var categories;


 module.exports.initialize=function(){
    return new Promise(function(resolve,reject){
        try {
            fs.readFile('./data/posts.json', 'utf8', (err, data) => {
                posts=JSON.parse(data);
                });
        } catch (error) {
            reject("unable to read file");
        }

        try {
            fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                categories=JSON.parse(data);
                });
        } catch (error) {
            reject("unable to read file");
        }

        resolve("Success");
    });
}


 module.exports.getAllPosts=function(){
    return new Promise(function(resolve,reject){

        if (posts.length==0) {
            reject("no results returned");
        } else {
            resolve(posts);
        }
    });
}


module.exports.getPublishedPosts=function(){


    let arr=posts.filter(Element=>Element.published);

    return new Promise(function(resolve,reject){

        if (arr.length==0) {
            reject("no results returned");
        } else {
            resolve(arr);
        }
    });
}

 module.exports.getCategories=function(){



    return new Promise(function(resolve,reject){

        if (categories.length==0) {
            reject("no results returned");
        } else {
            resolve(categories);
        }
    });
}