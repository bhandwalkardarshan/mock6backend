const mongoose  = require("mongoose");

const blogSchema = new mongoose.Schema({
    author:{ type: mongoose.Schema.Types.ObjectId, ref :'User'},
    title:{type:String, required:true},
    content:String,
    category:{
        type: String,
        enum: ['Business', 'Tech', 'Lifestyle','Entertainment']
    },
    date: Date
})

const Blog = mongoose.model('Blog',blogSchema)
module.exports=Blog;