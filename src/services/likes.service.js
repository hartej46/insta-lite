const prisma = require("../db");

const createLike = async (userId, postId) => {
    return await prisma.like.create({
        data: {
            userId,
            postId,
        },
    });
};

const deleteLike = async (userId, postId) => {
    try {
        return await prisma.like.delete({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
    } catch (err) {
        if (err.code === "P2025") {
            return null;
        }
        throw err;
    }
};

const getLikesByPostId = async (postId) => {
    const likes = await prisma.like.findMany({
        where: { postId },
        orderBy: {
            user: {
                username: "asc",
            },
        },
        select: {
            user: {
                select: {
                    id: true,
                    username: true,
                    fullname: true,
                },
            },
        },
    });
    return likes.map((l) => l.user);
};

module.exports = {
    createLike,
    deleteLike,
    getLikesByPostId,
};
