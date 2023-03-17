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

module.exports.getPostsByCategory=function(category){
    return new Promise(function(resolve,reject){

        let newPosts=posts.filter(Element=>Element.category==category);
        if (newPosts.length==0) {
            reject("no results returned")
        } else {
            resolve(newPosts);
        }
    });
}

module.exports.getPostsByMinDate=function(minDateStr){
    return new Promise(function(resolve,reject){

        let newPosts=posts.filter(Element=>new Date(Element.postDate)>=new Date(minDateStr));
        if (newPosts.length==0) {
            reject("no results returned")
        } else {
            resolve(newPosts);
        }
    });

}

module.exports.getPostsById=function(id){
    return new Promise(function(resolve,reject){

        let newPosts=posts.filter(Element=>Element.id==id);
        if (newPosts.length==0) {
            reject("no results returned")
        } else {
            resolve(newPosts);
        }
    });

}

module.exports.getPostById=function(id){
    return new Promise(function(resolve,reject){

        let newPosts=posts.filter(Element=>Element.id==id);
        if (newPosts.length==0) {
            reject("no results returned")
        } else {
            resolve(newPosts[0]);
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


module.exports.getPublishedPostsByCategory=function(category){
    let arr=posts.filter(Element=>Element.published&&Element.category==category);

    return new Promise(function(resolve,reject){

        if (arr.length==0) {
            reject("no results returned");
        } else {
            resolve(arr);
        }
    });
};


 module.exports.getCategories=function(){



    return new Promise(function(resolve,reject){

        if (categories.length==0) {
            reject("no results returned");
        } else {
            resolve(categories);
        }
    });

    
}

module.exports.addPost=function(postData){
       return new Promise(function(resolve,reject){

        const date = new Date();

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

       

        postData.postDate=`${year}-${month}-${day}`;
        if (postData.published) {
            postData.published=true;
        } else {
            postData.published=false;    
        }

        postData.id=posts.length+1;

        

        posts.push(postData);
        resolve(postData);
       }); 
}