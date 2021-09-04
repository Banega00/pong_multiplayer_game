"use strict";
exports.__esModule = true;
exports.PlayerModel = void 0;
var mongoose_1 = require("mongoose");
var schema = new mongoose_1.Schema({
    name: { type: String, required: true }
});
exports.PlayerModel = (0, mongoose_1.model)('Player', schema);
