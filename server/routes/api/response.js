

let createResponse = function (resStatus, msg, result, recordCount, pageNo, limit) {
    return {
        status: resStatus,
        message: msg,
        data: result,
        dataCount: recordCount,
        pageNo: pageNo,
        limit: limit
    };
};

exports.SUCCESS = 1;
exports.FAILED = 0;
exports.ERROR = 2;

exports.STATUS_OK = 200;
exports.STATUS_CREATED = 200;
exports.STATUS_NO_CONTENT = 204;
exports.STATUS_UNPROCESSABLE_ENTITY = 422;
exports.STATUS_NOT_FOUND = 404;
exports.STATUS_BAD_REQUEST = 400;
exports.STATUS_CONFLICT = 409;
exports.STATUS_UNAUTHORIZED = 401;
exports.STATUS_FORBIDDEN = 403;
exports.GONE = 410;
exports.SERVER_ERROR = 500;

exports.REASON_USER_NOT_REGISTERD = "USER_NOT_REGISTERED";
exports.REASON_USER_NEED_VERIFICATION = "USER_NOT_REGISTERED";
exports.REASON_SERVER_ERR = "SERVER_ERROR";
exports.REASON_INVALID_ENTITY = "INVALID_ENTITY";

exports.MESSAGE_INVALID_ENTITY = "ورودی های اشتباه";

exports.createResponse = createResponse;