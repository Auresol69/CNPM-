class APIFeatures {
    // CHAINING: features.filter().limitField().pagination()
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // GET /api/v1/tours?price[gte]=500 ~ 
    filter() {
        // raw (Object) = {'price[gte]': '500'}
        const queryObj = this.queryString ? { ...this.queryString } : {};
        const excludeFields = ['page', 'limit', 'sort', 'fields'];

        // Biết thêm thôi chứ không xài dùng app.set('query parser', 'extended') :))
        // const queryObj = {};
        // // {'price[gte]': '500'} -> {'price': { gte: '500'}}
        // for (const [key, value] of Object.entries(raw)) {
        //     // "startDate[gte]" or "a[b][c]" -> ['startDate','gte'] or ['a','b','c']
        //     if (key.includes('[')) {
        //         const parts = key.split('[').map(p => p.replace(/\]$/, '')); // $ là anchor: kết thúc chuỗi.

        //         let cur = queryObj;

        //         for (let i = 0; i < parts.length; i++) {
        //             // i=0: p = 'startDate', i=1: p = 'gte'
        //             const p = parts[i];
        //             if (i === parts.length - 1) {
        //                 // queryObj.startDate.gte = '2025-11-23'
        //                 // < = > queryObj = { startDate: { gte: '2025-11-23' } }
        //                 cur[p] = value;
        //             } else {
        //                 if (!cur[p] || typeof cur[p] !== 'object')
        //                     // queryObj.startDate = {}
        //                     cur[p] = {};
        //                 // cur trỏ vào object rỗng mới
        //                 // cur = queryObj.startDate
        //                 cur = cur[p];
        //             }
        //         }
        //     } else {
        //         queryObj[key] = value;
        //     }
        // }

        // console.log(queryObj);

        excludeFields.forEach(el => delete queryObj[el]); // Xóa các trường đặc biệt ra khỏi đối tượng filter

        // Bảo vệ input / sanitize
        // Loại bỏ các key bắt đầu bằng "$" để tránh operator injection (prototype pollution
        const stringDollarKey = obj => {
            if (!obj || typeof obj !== 'object') return;
            for (const key of Object.keys(obj)) {
                if (key.startsWith('$'))
                    delete obj[key];
                else
                    stringDollarKey(obj[key]);
            }
        }
        stringDollarKey(queryObj);

        // queryStr = '{"price":{"gte":"500"}}'
        let queryStr = JSON.stringify(queryObj);
        // / ... /: Cặp dấu gạch chéo là cú pháp để khai báo một Regular Expression trong JavaScript

        // \b (Word Boundary - Ranh giới từ) "phải đứng độc lập hoặc là một từ riêng biệt"
        // Ký tự từ (word character): Thường bao gồm các chữ cái (\(a-z,A-Z\)), số (\(0-9\)) và dấu gạch dưới (_).
        // Mẫu \bword\b sẽ khớp với "word" trong chuỗi "The word is over" vì w và d được bao quanh bởi khoảng trắng (ký tự không phải từ).
        // Tuy nhiên, mẫu này sẽ không khớp với "word" trong "wording" hoặc "swordfish" vì w và d không đứng ở ranh giới từ

        // g (Global Flag - Cờ toàn cục) "Đừng dừng lại sau khi tìm thấy kết quả đầu tiên.
        // Hãy quét hết toàn bộ chuỗi và tìm tất cả các từ khớp"

        // Regex chỉ hoạt động với String

        // queryStr = '{"price":{"$gte":"500"}}'
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // parsed (Object) =
        // {
        //   price: {
        //        $gte: "500"
        //    }
        //}
        // const parsed = JSON.parse(queryStr);

        this.query = this.query.find(JSON.parse(queryStr));

        return this; // chaining, this = object APIFeatures moi
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query = this.query.sort('-createdAt'); // default: thoi gian gan day nhat
        }

        return this; // chaining, this = object APIFeatures moi
    }

    pagination() {
        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = parseInt(this.queryString.limit, 10) || 10;

        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this; // chaining, this = object APIFeatures moi
    }

    // Note: không cho phép trộn lẫn giữa việc "chọn lấy" (inclusion) và "loại bỏ" (exclusion)
    // Mo rong (api/users?fields=name,email) 
    limitField() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        else
            this.query = this.query.select('-__v');

        return this;
    }
};

module.exports = APIFeatures