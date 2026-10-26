const prisma = require("../db");

async function createUser(data) {
  return await prisma.user.create({
    data,
  });
}

async function listUsers({ page = 1, limit = 10, sortBy = "createdAt", order = "desc", where = {} } = {}) {
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
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

async function updateUser(id, data) {
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
}

async function deleteUser(id) {
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
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
