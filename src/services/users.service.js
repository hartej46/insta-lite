const prisma = require("../db");

const createUser = async (data) => {
    return await prisma.user.create({
        data,
    });
};

const listUsers = async ({ page = 1, limit = 10, sortBy = "createdAt", order = "desc", where = {} } = {}) => {
    const skip = (page - 1) * limit;
    const [data, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: order },
        }),
        prisma.user.count({ where }),
    ]);
    return { data, total };
};

const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    posts: true,
                    likes: true,
                },
            },
        },
    });
};

const getUserPosts = async (userId, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;
    const where = { authorId: userId };
    const [data, total] = await prisma.$transaction([
        prisma.post.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { likes: true },
                },
            },
        }),
        prisma.post.count({ where }),
    ]);
    return { data, total };
};

const getLikedPosts = async (userId, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;
    const where = {
        likes: {
            some: {
                userId,
            },
        },
    };
    const [data, total] = await prisma.$transaction([
        prisma.post.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                    },
                },
                _count: {
                    select: { likes: true },
                },
            },
        }),
        prisma.post.count({ where }),
    ]);
    return { data, total };
};

const updateUser = async (id, data) => {
    try {
        return await prisma.user.update({
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

const deleteUser = async (id) => {
    try {
        return await prisma.user.delete({
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
    createUser,
    listUsers,
    getUserById,
    getUserPosts,
    getLikedPosts,
    updateUser,
    deleteUser,
};
