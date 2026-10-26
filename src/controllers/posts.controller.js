const postsService = require("../services/posts.service");

const isPositiveInteger = (str) => typeof str === "string" && /^[1-9]\d*$/.test(str);

async function create(req, res) {
  if (!req.body || !req.body.imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  const data = {
    imageUrl: req.body.imageUrl,
  };

  if (req.body.caption !== undefined) {
    data.caption = req.body.caption;
  }

  if (req.body.location !== undefined) {
    data.location = req.body.location;
  }

  const post = await postsService.createPost(data);
  res.status(201).json(post);
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
    if (!["createdAt", "updatedAt"].includes(req.query.sortBy)) {
      return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt" });
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
  let fromDate;
  let toDate;
  if (req.query.from !== undefined) {
    fromDate = new Date(req.query.from);
    if (Number.isNaN(fromDate.getTime())) {
      return res.status(400).json({ error: "from and to must be valid dates" });
    }
  }
  if (req.query.to !== undefined) {
    toDate = new Date(req.query.to);
    if (Number.isNaN(toDate.getTime())) {
      return res.status(400).json({ error: "from and to must be valid dates" });
    }
  }
  const where = {};
  if (req.query.location) {
    where.location = { equals: req.query.location, mode: "insensitive" };
  }
  if (req.query.search) {
    where.caption = { contains: req.query.search, mode: "insensitive" };
  }
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) {
      where.createdAt.gte = fromDate;
    }
    if (toDate) {
      where.createdAt.lt = toDate;
    }
  }
  const { data, total } = await postsService.listPosts({ page, limit, sortBy, order, where });
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
    return res.status(404).json({ error: "Post not found" });
  }

  const post = await postsService.getPostById(id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.status(200).json(post);
}

async function update(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  const data = {};

  for (const field of ["caption", "location"]) {
    if (Object.hasOwn(req.body, field)) {
      data[field] = req.body[field];
    }
  }

  const updatedPost = await postsService.updatePost(id, data);

  if (!updatedPost) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.status(200).json(updatedPost);
}

async function remove(req, res) {
  const id = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  const deleted = await postsService.deletePost(id);

  if (!deleted) {
    return res.status(404).json({ error: "Post not found" });
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
