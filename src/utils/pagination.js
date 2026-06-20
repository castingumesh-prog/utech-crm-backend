/**
 * Helper to parse pagination query parameters and return SQL LIMIT/OFFSET.
 * @param {object} query - Express request query object
 * @returns {object} { limit: number, offset: number, page: number }
 */
function getPaginationParams(query) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  return { limit, offset, page };
}

/**
 * Helper to structure paginated response data.
 * @param {Array} data - The array of records for the current page
 * @param {number} totalCount - The total number of records across all pages
 * @param {number} page - The current page number
 * @param {number} limit - The records limit per page
 * @returns {object} Paginated response payload
 */
function formatPaginatedResponse(data, totalCount, page, limit) {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    data,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

module.exports = {
  getPaginationParams,
  formatPaginatedResponse,
};
