const isPositiveInteger = (str) => typeof str === "string" && /^[1-9]\d*$/.test(str);

const parsePagination = (query) => {
    let page = 1;
    let limit = 10;

    if (query.page !== undefined) {
        if (!isPositiveInteger(query.page)) {
            return { error: "page and limit must be positive integers" };
        }
        page = Number(query.page);
    }

    if (query.limit !== undefined) {
        if (!isPositiveInteger(query.limit)) {
            return { error: "page and limit must be positive integers" };
        }
        const limitNum = Number(query.limit);
        limit = limitNum > 50 ? 50 : limitNum;
    }

    return { page, limit };
};

module.exports = {
    parsePagination,
};
