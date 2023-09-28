const express = require('express')
const blogRoutes = express.Router()
const Blog = require('../models/blog.model')
const verifyToken = require('../middleware/verifyToken')

// create
blogRoutes.post('/', verifyToken, async(req,res) => {
    try {
        const {username, title, content, category} = req.body
        const date = new Date();
        const newBlog = new Blog({
            username,
            title,
            content,
            category,
            date,
          });

        await newBlog.save()

        res.status(201).json({message: 'Blog created', blog:newBlog})
    } catch (error) {
        console.log(error)
        res.status(500).json('Internal server error')
    }
})

// read all blogs
// blogRoutes.get('/',async(req,res) => {
//     try {
//         // const {username, title, content, category} = req.body
//         const blogs = await Blog.find()

//         res.status(200).json({blogs})
//     } catch (error) {
//         console.log(error)
//         res.status(500).json('Internal server error')
//     }
// })

// read a specific blogs
blogRoutes.get('/:id',async(req,res) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if(!blog) 
        return res.status(404).json({message: 'Blog not found'})

        res.status(200).json({blog})
    } catch (error) {
        console.log(error)
        res.status(500).json('Internal server error')
    }
})

// search by title && sorting
blogRoutes.get('/', async (req, res) => {
    try {
      const { title,category, sort, order } = req.query;
  
      const filter = {};
  
      if (title) {
        filter.title = { $regex: title, $options: 'i' };
      }
      
      if (category) {
        filter.category = category;
      }

      const sortOptions = {};
  
      if (sort) {
        sortOptions[sort] = order === 'asc' ? 1 : -1;
      }
  
      // Query the database with the filter and sorting options
      const blogs = await Blog.find(filter).sort(sortOptions);
  
      res.status(200).json({ blogs });
    } catch (error) {
      console.error(error);
      res.status(500).json('Internal server error');
    }
  });
  
  
// blogs by category
blogRoutes.get('/category/:category',async(req,res) => {
    try {
        const {category} = req.params
      
        const blogs = await Blog.find({category});
        res.status(200).json({ blogs });
    } catch (error) {
        console.log(error)
        res.status(500).json('Internal server error')
    }
})


// update blog by id with jwt authorization
blogRoutes.put('/:id', verifyToken, async (req, res) => {
    try {
      const { username, title, content, category } = req.body;
      const { id } = req.params;
  
      const blog = await Blog.findById(id);
  
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      if (blog.username !== req.user.username) {
        return res.status(403).json({ message: 'You are not authorized to edit this blog' });
      }
  
      blog.username = username;
      blog.title = title;
      blog.content = content;
      blog.category = category;
  
      await blog.save();
  
      res.status(200).json({ message: 'Blog updated successfully', blog });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Delete a blog by id with jwt authorization
blogRoutes.delete('/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;

      const blog = await Blog.findById(id);
  
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      if (blog.username !== req.user.username) {
        return res.status(403).json({ message: 'You are not authorized to delete this blog' });
      }
  
      // Delete the blog
      await Blog.findByIdAndDelete(id);
  
      res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// like a blog
blogRoutes.patch('/:id/like', verifyToken, async (req,res) => {
    try {
        const blog = await Blog.findById(req.params.id)

        if(!blog)
        return res.status(404).json({message: 'Blog not found'})

        blog.likes += 1

        await blog.save()
        res.status(201).json({message :'Blog liked', blog})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// comment on a blog by id
blogRoutes.patch('/:id/comment',verifyToken, async(req,res) => {
    try {
        const {comment} = req.body
        const blog = await Blog.findById(req.params.id)

        if(!blog)
        return res.status(404).json({message: 'Blog not found'})

        const username = req.user.username;

        if (!Array.isArray(blog.comments)) {
        blog.comments = [];
        }

        const newComment = {
        username,
        content: comment,
        };

        blog.comments.push(newComment);

        await blog.save()
        res.status(201).json({message :'Blog commented', blog})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})


module.exports = blogRoutes