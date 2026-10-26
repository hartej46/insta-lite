const usersService = require("../services/users.service");

const isPositiveInteger = (str) => typeof str === "string" && /^[1-9]\d*$/.test(str);

async function create(req, res) {
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
}

async function list(req, res) {
  let page = 1;
  let limit = 10;
  if (req.query.page !== undefined) {
    if (!isPositiveInteger(req.query.page)) {
      return res.status(400).json({ error: "page and limit must be positive integers" });
    }
    page = Number(req.query.page);
  }
  if (req.query.limit !== undefined) {
    if (!isPositiveInteger(req.query.limit)) {
      return res.status(400).json({ error: "page and limit must be positive integers" });
    }
    const limitNum = Number(req.query.limit);
    limit = limitNum > 50 ? 50 : limitNum;
  }
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
  const where = {};
  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
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
}

async function getOne(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const user = await usersService.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(user);
}

async function update(req, res) {
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
}

async function remove(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const deleted = await usersService.deleteUser(id);

  if (!deleted) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(204).send();
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
