const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

const main = async () => {
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const createdUsers = await prisma.user.createManyAndReturn({ data: users });
    const userMap = {};
    for (const u of createdUsers) {
        userMap[u.username] = u.id;
    }

    const postsData = posts.map((p) => {
        const { author, ...rest } = p;
        return {
            ...rest,
            authorId: userMap[author],
        };
    });

    const createdPosts = await prisma.post.createManyAndReturn({ data: postsData });
    const postMap = {};
    for (const p of createdPosts) {
        const match = p.imageUrl.match(/insta\d+/);
        if (match) {
            postMap[match[0]] = p.id;
        }
    }

    const likesData = likes.map((l) => ({
        userId: userMap[l.user],
        postId: postMap[l.post],
    }));

    const likeResult = await prisma.like.createMany({ data: likesData });

    console.log(`🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${likeResult.count} likes`);
};

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
