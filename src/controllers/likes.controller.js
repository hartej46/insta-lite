const likesService = require("../services/likes.service");
const postsService = require("../services/posts.service");
const usersService = require("../services/users.service");

const listLikes = async (req, res) => {
    const postId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(postId)) {
        return res.status(404).json({ error: "Post not found" });
    }

    const post = await postsService.getPostById(postId);

    if (!post) {
        return res.status(404).json({ error: "Post not found" });
    }

    const likes = await likesService.getLikesByPostId(postId);
    res.status(200).json(likes);
};

const addLike = async (req, res) => {
    if (!req.body || req.body.userId === undefined) {
        return res.status(400).json({ error: "userId is required" });
    }

    const postId = Number.parseInt(req.params.id, 10);
    const userId = Number.parseInt(req.body.userId, 10);

    if (!Number.isInteger(postId)) {
        return res.status(404).json({ error: "Post not found" });
    }

    const post = await postsService.getPostById(postId);

    if (!post) {
        return res.status(404).json({ error: "Post not found" });
    }

    if (!Number.isInteger(userId)) {
        return res.status(404).json({ error: "User not found" });
    }

    const user = await usersService.getUserById(userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    try {
        const like = await likesService.createLike(userId, postId);
        res.status(201).json(like);
    } catch (err) {
        if (err.code === "P2002") {
            return res.status(409).json({ error: "Already liked" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

const removeLike = async (req, res) => {
    const postId = Number.parseInt(req.params.id, 10);
    const userId = Number.parseInt(req.params.userId, 10);

    if (!Number.isInteger(postId) || !Number.isInteger(userId)) {
        return res.status(404).json({ error: "Like not found" });
    }

    const deleted = await likesService.deleteLike(userId, postId);

    if (!deleted) {
        return res.status(404).json({ error: "Like not found" });
    }

    res.status(204).send();
};

module.exports = {
    listLikes,
    addLike,
    removeLike,
};
