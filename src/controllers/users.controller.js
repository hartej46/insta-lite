const usersService = require("../services/users.service");
const { parsePagination } = require("../utils/pagination");

const create = async (req, res) => {
    if (!req.body || !req.body.username || !req.body.email || !req.body.fullname) {
        return res
            .status(400)
            .json({ error: "username, email and fullname are required" });
    }

    const data = {
        username: req.body.username,
        email: req.body.email,
        fullname: req.body.fullname,
    };

    if (req.body.bio !== undefined) {
        data.bio = req.body.bio;
    }

    try {
        const user = await usersService.createUser(data);
        res.status(201).json(user);
    } catch (err) {
        if (err.code === "P2002") {
            return res
                .status(409)
                .json({ error: "username or email already taken" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

const list = async (req, res) => {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
        return res.status(400).json({ error: pagination.error });
    }
    const { page, limit } = pagination;

    let sortBy = "createdAt";
    if (req.query.sortBy !== undefined) {
        if (!["createdAt", "username", "fullname"].includes(req.query.sortBy)) {
            return res.status(400).json({ error: "sortBy must be one of: createdAt, username, fullname" });
        }
        sortBy = req.query.sortBy;
    }

    let order = "desc";
    if (req.query.order !== undefined) {
        if (!["asc", "desc"].includes(req.query.order)) {
            return res.status(400).json({ error: "order must be asc or desc" });
        }
        order = req.query.order;
    }

    let isPrivate;
    if (req.query.isPrivate !== undefined) {
        if (req.query.isPrivate === "true") {
            isPrivate = true;
        } else if (req.query.isPrivate === "false") {
            isPrivate = false;
        } else {
            return res.status(400).json({ error: "isPrivate must be true or false" });
        }
    }

    let hasPosts;
    if (req.query.hasPosts !== undefined) {
        if (req.query.hasPosts === "true") {
            hasPosts = true;
        } else if (req.query.hasPosts === "false") {
            hasPosts = false;
        } else {
            return res.status(400).json({ error: "hasPosts must be true or false" });
        }
    }

    const where = {};
    if (isPrivate !== undefined) {
        where.isPrivate = isPrivate;
    }
    if (hasPosts === true) {
        where.posts = { some: {} };
    } else if (hasPosts === false) {
        where.posts = { none: {} };
    }
    if (req.query.search) {
        where.OR = [
            { username: { contains: req.query.search, mode: "insensitive" } },
            { fullname: { contains: req.query.search, mode: "insensitive" } },
        ];
    }

    const { data, total } = await usersService.listUsers({ page, limit, sortBy, order, where });
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    res.status(200).json({
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    });
};

const getOne = async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id)) {
        return res.status(404).json({ error: "User not found" });
    }

    const user = await usersService.getUserById(id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
};

const getUserPosts = async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id)) {
        return res.status(404).json({ error: "User not found" });
    }

    const user = await usersService.getUserById(id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const pagination = parsePagination(req.query);
    if (pagination.error) {
        return res.status(400).json({ error: pagination.error });
    }
    const { page, limit } = pagination;

    const { data, total } = await usersService.getUserPosts(id, { page, limit });
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    res.status(200).json({
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    });
};

const getLikedPosts = async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id)) {
        return res.status(404).json({ error: "User not found" });
    }

    const user = await usersService.getUserById(id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const pagination = parsePagination(req.query);
    if (pagination.error) {
        return res.status(400).json({ error: pagination.error });
    }
    const { page, limit } = pagination;

    const { data, total } = await usersService.getLikedPosts(id, { page, limit });
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    res.status(200).json({
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    });
};

const update = async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id)) {
        return res.status(404).json({ error: "User not found" });
    }

    const data = {};

    for (const field of ["fullname", "bio", "isPrivate"]) {
        if (Object.hasOwn(req.body, field)) {
            data[field] = req.body[field];
        }
    }

    const updatedUser = await usersService.updateUser(id, data);

    if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
};

const remove = async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id)) {
        return res.status(404).json({ error: "User not found" });
    }

    const deleted = await usersService.deleteUser(id);

    if (!deleted) {
        return res.status(404).json({ error: "User not found" });
    }

    res.status(204).send();
};

module.exports = {
    create,
    list,
    getOne,
    getUserPosts,
    getLikedPosts,
    update,
    remove,
};
