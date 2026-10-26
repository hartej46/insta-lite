const prisma = require("../db");

const createPost = async (data) => {
    return await prisma.post.create({
        data,
    });
};

const listPosts = async ({ page = 1, limit = 10, sortBy = "createdAt", order = "desc", where = {} } = {}) => {
    const skip = (page - 1) * limit;
    const orderBy = sortBy === "likes"
        ? [{ likes: { _count: order } }, { createdAt: "desc" }]
        : { [sortBy]: order };

    const [data, total] = await prisma.$transaction([
        prisma.post.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                    },
                },
            },
        }),
        prisma.post.count({ where }),
    ]);
    return { data, total };
};

const getPostById = async (id) => {
    return await prisma.post.findUnique({
        where: { id },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    fullname: true,
                },
            },
            _count: {
                select: {
                    likes: true,
                },
            },
        },
    });
};

const updatePost = async (id, data) => {
    try {
        return await prisma.post.update({
            where: { id },
            data,
        });
    } catch (err) {
        if (err.code === "P2025") {
            return null;
        }
        throw err;
    }
};

const deletePost = async (id) => {
    try {
        return await prisma.post.delete({
            where: { id },
        });
    } catch (err) {
        if (err.code === "P2025") {
            return null;
        }
        throw err;
    }
};

module.exports = {
    createPost,
    listPosts,
    getPostById,
    updatePost,
    deletePost,
};
