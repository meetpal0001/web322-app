const Sequelize = require('sequelize');

var sequelize = new Sequelize('easpgdaf', 'easpgdaf', 'q0g2NxyLQBIAWvzhnTCNKzv2B8RPtLlc', {
host: 'trumpet.db.elephantsql.com',
dialect: 'postgres',
port: 5432,
dialectOptions: {
ssl: { rejectUnauthorized: false }
},
query: { raw: true }
});



var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,  // entry title
    title: Sequelize.STRING, // author of the entry
    postDate: Sequelize.DATE, // Date the entry was posted

    featureImage: Sequelize.STRING, // main text for the entry
    published: Sequelize.BOOLEAN // number of views
});


var Category = sequelize.define('Category', {
    category: Sequelize.STRING,  // entry title
   
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize=function(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            resolve();
}).catch(function () {
    reject("unable to sync the database");    
})
        });
}


 module.exports.getAllPosts=function(){
    return new Promise((resolve, reject) => {
        Post.findAll({}).then(function(data){        
           resolve(data);
        }).catch(function(){
            reject("no results returned");
        })
        });
}

module.exports.getPostsByCategory=function(cat){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: cat
            }
        }).then(function(data){        
            resolve(data);

        }).catch(function(){
            reject("no results returned");
        })
        });
}

module.exports.getPostsByMinDate=function(minDateStr){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {
                [gte]: new Date(minDateStr)
                }
                }
        }).then(function(data){        
            resolve(data);

        }).catch(function(){
            reject("no results returned");
        })
        });

}



module.exports.getPostById=function(i){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: i
            }
        }).then(function(data){        
            resolve(data);
    
        }).catch(function(){
            reject("no results returned");
        })
        });

}


module.exports.getPublishedPosts=function(){


    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then(function(data){        
            resolve(data);
    
        }).catch(function(){
            reject("no results returned");
        })
        });
}


module.exports.getPublishedPostsByCategory=function(cat){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: cat
            }
        }).then(function(data){        
            resolve(data);
    
        }).catch(function(){
            reject("no results returned");
        })
        });
};


 module.exports.getCategories=function(){



    return new Promise((resolve, reject) => {
        Category.findAll({}).then(function(data){        
            resolve(data);
    
        }).catch(function(){
            reject("no results returned");
        })
        });
    
}

module.exports.addPost=function(postData){
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (const prop in postData) {
             if(postData[prop]==""){
                postData[prop]=null;
             }
          }

          Post.create({
            body:postData.body,
            title:postData.title,
            postDate:new Date(),
            featureImage: postData.featureImage,
            published:postData.published,
            category:postData.category
          }).then(function(){
            resolve("Success");
          }).catch(function(){
            reject("unable to create post");
        })
          
        });
}


module.exports.addCategory=function(categoryData){
    return new Promise((resolve, reject) => {
        for (const prop in categoryData) {
             if(categoryData[prop]==""){
                categoryData[prop]=null;
             }
          }

          Category.create({
            
            category:categoryData.category
          }).then(function(){
            resolve("Success");
          }).catch(function(){
            reject("unable to create post");
        })
          
        });
}

module.exports.deleteCategoryById=function(id){
    return new Promise((resolve, reject) => {
    Category.destroy({
        where: { id: id } 
    }).then(function () { resolve("destroyed")}).catch(function(){
        reject("rejected");
    })
});

}

module.exports.deletePostById=function(id){
    return new Promise((resolve, reject) => {
    Post.destroy({
        where: { id: id } 
    }).then(function () { resolve("destroyed")}).catch(function(){
        reject("rejected");
    })
});

}