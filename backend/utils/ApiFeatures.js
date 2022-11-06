class ApiFeatures{
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword,
                $options:"i"
            }
        }:{};
        this.query = this.query.find({...keyword});
        return this;
    }

    filter(){
        const removeFields = ["keyword","page","limit"];
        const queryCopy = {...this.queryStr};
        removeFields.forEach((field) => delete queryCopy[field]);

        // adding $ for price and ratings filtering
        let queryString = JSON.stringify(queryCopy);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g,(key) => `$${key}`);
        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    pagination(resultsPerPage){
        const currentPage = this.queryStr.page || 1;
        const skip = (currentPage - 1) * (resultsPerPage);

        this.query = this.query.limit(resultsPerPage).skip(skip);
        return this;
    }
}

module.exports = ApiFeatures;