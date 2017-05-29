console.log ('hello world');

import * as querystring from "querystring";
import * as url from "url";
import * as http from "http";
import * as https from "https";

/**
 * config file (config.user.json) looks like:
 * {
 *   "url": "https://test.visualstudio.com" ,
 *   "username": "testuser",
 *   "token": "testtoken"
 * }
 */

import * as config from "./config.user.json";
console.log ((<any>config).username);
// var config = require ('./config.user.json');