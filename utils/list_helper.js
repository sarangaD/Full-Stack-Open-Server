const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }
    return blogs.reduce(reducer, 0);
}

const favoriteBlog = (blogs) => {
    const reducer = (max, blog) => {
        return blog.likes > max.likes ? blog : max;
    }
    const mostLikedBlog = blogs.reduce(reducer, blogs[0]);
    return mostLikedBlog
}

const mostBlogs = (blogs) => {
    const reducer = (counts, blog) => {
        counts[blog.author] = (counts[blog.author] || 0) + 1;
        return counts;
      }
    const authorBlogs = blogs.reduce(reducer, {});
 
    const topAuthor = Object.entries(authorBlogs).reduce((max, [author, blogs]) => {
        return blogs > max.blogs ? { author, blogs } : max;
      }, { author: "", blogs: 0 });

    console.log(topAuthor)
    return topAuthor;
};

const mostLikes = (blogs) => {
    const reducer = (acc, blog)=>{
        acc[blog.author] = (acc[blog.author] || 0) + blog.likes;
        return acc;
    }
    const likesByAuthor = blogs.reduce(reducer,{});

    return Object.entries(likesByAuthor).reduce((max, [author, likes]) => {
        return likes > max.likes ? { author, likes } : max;
      }, { author: "", likes: 0 });
}


module.exports = {
    totalLikes, favoriteBlog, mostBlogs, mostLikes
}