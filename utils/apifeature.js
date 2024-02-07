class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.filteredCount = false; // Initialize filteredCount to false
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

   filter() {
    // Create a shallow copy of the query string parameters and remove specified fields
    const { keyword, page, limit, ...queryCopy } = this.queryStr;

    // Convert the modified query copy to a JSON string and replace operators
    // console.log(queryStr)
    const queryStr = JSON.stringify(queryCopy).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (key) => `$${key}`
    );

    // Parse the modified JSON string and apply it to the query
    this.query = this.query.find(JSON.parse(queryStr));
    this.filteredCount =  false;


    // Return the modified query object for method chaining
    return this;
  }

  pagination(resultPerPage){
    const currentPage=Number(this.queryStr.page) || 1; //50-10
    const skip=resultPerPage *(currentPage-1);
    this.query=this.query.limit(resultPerPage).skip(skip)
    return this;
  }

  get() {
    return this.query;
  }
}

module.exports = ApiFeatures;
