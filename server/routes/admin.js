//require('dotenv').config()
const express = require('express')
const router = express.Router()
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt')
const  jwt = require('jsonwebtoken')

const adminLayout = '../views/Layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


/*
check log in
*/
const authMiddleware = (req,res, next)=> {
    const token = req.cookies.token

    if(!token){
        return res.status(401).json({message: 'unauthorized'})
    }

    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.id
        next();
    } catch (error) {
        return res.status(401).json({message: 'unauthorized'})
    }
}




/*
get
admin
*/
router.get('/admin', async (req,res)=>{
    try {
        const locals = {
            title: "Admin",
            description: "simple blog created with nodejs , express and mongodb"
        }

        const data = await Post.find();
        res.render('admin/index',{ locals, layout: adminLayout});
    } catch (error) {
        console.log(error)
    }
        
    });

/*
post
admin check login
*/
router.post('/admin', async (req,res)=>{
    try {
        
    
      const { username, password } = req.body;
    const user = await User.findOne({ username})

     if(!user){
        return res.status(401).json( { message: 'invalid credential'})

     }
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if(!isPasswordValid) {
        return res.status(401).json( { message: 'invalid credential'})
      }

      const token = jwt.sign({userId: user._id}, jwtSecret )
      res.cookie('token', token, { httpOnly: true});
      
      return res.redirect('/dashboard')


    } catch (error) {
        console.log(error)
    }
        
    });

/*
post
admin dashboard
*/
router.get('/dashboard', authMiddleware, async (req,res)=> {
   

try {
     const locals = {
        title: 'Dashboard',
        description: 'simple blog created with nodejs, express and mongodb'
     }
    const data = await Post.find()
    return res.render('admin/dashboard', {
        locals, 
        data,
        layout: adminLayout
    })

} catch (error) {
    console.log(error)
}
   // return res.render('admin/dashboard')
})



/*
post
admin dashboard
*/
router.get('/add-post', authMiddleware, async (req,res)=> {
   

    try {
         const locals = {
            title: 'Add Post',
            description: 'simple blog created with nodejs, express and mongodb'
         }
        const data = await Post.find()
        return res.render('admin/add-post', {
            locals, 
            layout: adminLayout
        })
    
    } catch (error) {
        console.log(error)
    }
   
    })



/*
post
admin dashboard
*/
router.post('/add-post', authMiddleware, async (req,res)=> {
    try {

        try {
            const newsPost = new Post({
                title: req.body.title,
                body: req.body.body,
            })

            await Post.create(newsPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error)
        }
        
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error)
    }
   
    });



    //get
    router.get('/edit-post/:id', authMiddleware, async (req,res)=> {
   

        try {
            const locals = {
                title: 'Dashboard',
                description: 'simple blog created with nodejs, express and mongodb'
             }
          
            const data = await Post.findOne({_id: req.params.id})
          
           res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
           })
        } catch (error) {
            console.log(error)
        }
       
        })
    



//put
    router.put('/edit-post/:id', authMiddleware, async (req,res)=> {
   

        try {
            
           await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body:req.body.body,
            updatedAt: Date.now()
           })
           res.redirect(`/edit-post/${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
       
        })
    


/*
post
admin register
*/
router.post('/register', async (req,res)=>{
    try {
        
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await User.create({ username, password: hashedPassword})
        res.status(201).json({ message: 'User Created', user})
    } catch (error) {
        if(error.code === 11000){
            res.status(409).json({ message: 'User already in user'})
        }
        res.status(500).json({ message: 'internal server error'})
    }

    } catch (error) {
        console.log(error)
    }
        
    });


//delete post
router.delete('/delete-post/:id', authMiddleware, async (req,res)=>{
    try {
        await Post.deleteOne({_id: req.params.id})
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error)
    }

})

    /**
     * 
post
admin check login

router.post('/admin', async (req,res)=>{
    try {
        
    const { username, password } = req.body;
    
if(req.body.username === 'admin' && req.body.password === 'password'){
        res.send('you are logged in...');
    } else{
        res.send('wrong username or password')
    }

    } catch (error) {
        console.log(error)
    }
        
    });
     */




    //get admin logout
router.get('/logout', (req,res)=>{
    res.clearCookie('token')
    //res.json({message: 'logout successful'})
    res.redirect('/')
})


module.exports = router