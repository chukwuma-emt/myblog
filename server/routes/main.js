const express = require('express')
const router = express.Router()
const Post = require('../models/Post');

//routes
router.get('', async (req,res)=>{
try {
    const locals = {
        title: "nodejs blog",
        description: "simple blog created with nodejs , express and mongodb"
    }

    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{$sort: { createdAt: -1}}])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count /perPage);

    
    res.render('index',{
         locals,
         data,
         current: page,
         nextPage: hasNextPage ? nextPage : null,
         currentRoute: '/'
        });
} catch (error) {
    console.log(error)
}
    
});
 
/*
router.get('', async (req,res)=>{
    const locals = {
        title: "nodejs blog",
        description: "simple blog created with nodejs , express and mongodb"
    }
    
    try {
        const data = await Post.find();
        res.render('index',{ locals, data});
    } catch (error) {
        console.log(error)
    }
        
    });
*/
/*function insertPostData () {
    Post.insertMany([
        {
            title: "building a blog 1",
            body: "this is the body text",
        },
        {
            title: "building a blog 2",
            body: "this is the body text",
        },
        {
            title: "building a blog 3",
            body: "this is the body text",
        },
        {
            title: "building a blog 4",
            body: "this is the body text",
        },
        {
            title: "building a blog 5",
            body: "this is the body text",
        },
    ])
}
insertPostData();



/*
get
post: id
*/
router.get('/post/:id', async (req,res)=>{
    try {

      
        let slug = req.params.id;

        const data = await Post.findById({ _id:slug});

        const locals = {
            title: data.title,
            description: "simple blog created with nodejs , express and mongodb",
            

        }


        res.render('post', { locals, data, currentRoute: `/post/${slug}`});
    } catch (error) {
        console.log(error)
    }
        
    });


 /*
post
post: searchterm
*/
router.post('/search', async (req,res)=>{
    try {
const locals = {
        title: "search",
        description: "simple blog created with nodejs , express and mongodb"
    }
      let searchTerm = req.body.searchTerm;
      const searchNoSpacialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "")
     
        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpacialChar, 'i')}},
                { body: { $regex: new RegExp(searchNoSpacialChar, 'i')}},
            ]
        });

        res.render("search", {
            data,
            locals,
            currentRoute: `${searchTerm}`
        });
    } catch (error) {
        console.log(error)
    }
        
    });




router.get('/about',  (req,res)=> {
    res.render('about', {
         currentRoute: '/about'
    })
});

router.get('/contact', (req,res)=>{
 res.render('contact',
    {
        currentRoute: '/contact'
   }
 );
});


module.exports = router