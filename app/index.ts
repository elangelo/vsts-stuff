import * as fetch from "isomorphic-fetch";
import * as deepdiff from "deep-diff";
import * as readlinesync from "readline-sync";
import * as colors from "colors/safe";
import * as functions from "./functions";

import { Config } from "./configuration";

// import * as configuration from "configuration";

let appconfig: Config = require("./config.user.json");
var account = (appconfig).account;
var username = (appconfig).username;
var token = (appconfig).token;
var project = (appconfig).project;

/**
 * config file (config.user.json) looks like:
 * {
 *   "account": "testaccount" ,
 *   "username": "testuser",
 *   "token": "testtoken",
 *   "project": "testproject"
 * }
 */
let Reset = "\x1b[0m"
let Black = "\x1b[30m"
let Red = "\x1b[31m"
let Green = "\x1b[32m"
let Yellow = "\x1b[33m"
let Blue = "\x1b[34m"
let Magenta = "\x1b[35m"
let Cyan = "\x1b[36m\x1b[1m"
let White = "\x1b[37m"

var work = [];
work.push(getReleaseDefinition(appconfig, 1));
work.push(getReleaseDefinition(appconfig, 4));
Promise.all(work).then(
    values => {

        var envs10th = (<any>(values[0])).environments;
        var envscloud = (<any>(values[1])).environments;

        for (let env10th of envs10th) {
            var envcloud = envscloud.find(e => (<any>e).name == (<any>env10th).name);
            if (envcloud) {
                let differences: deepDiff.IDiff[] = deepdiff.diff(env10th, envcloud);
                console.log(Cyan)
                console.log(`${envcloud.name} starting`);
                console.log(Reset);
                for (let diff of differences) {
                    console.log(`${diff.path}: ${diff.kind}`);
                    console.log(`< ${diff.lhs}`);
                    console.log(`> ${diff.rhs}`);
                    console.log('======')

                    readlinesync.question('push key to proceed');
                }
                console.log(Cyan);
                console.log(`${envcloud.name} done`);
                console.log(Reset);
                console.log();
            }
            else {
                console.log(`${(<any>env10th).name} not found in cloud`);
            }
        }
        console.log("**done**");
    }
)

function getReleaseDefinition(config: Config, releaseDefinitionId: Number): Promise<string> {
    return new Promise<string>((resolve) => {
        let apiversion: string = "3.0-preview.1";
        let releasedefinitionUri: string = `https://${account}.vsrm.visualstudio.com/defaultcollection/${project}/_apis/release/definitions/${releaseDefinitionId}?api-version=${apiversion}`

        let headers: Headers = new Headers();
        var token = functions.btoa(`${config.username}:${config.token}`);
        headers.append("Authorization", `Basic ${token}`);

        let init: RequestInit = {
            method: "GET",
            headers: headers,
        }

        let request: Request = new Request(releasedefinitionUri, init);

        fetch(request)
            .then((response) => {
                return response.json()
            })
            .then((json) => {
                resolve(json);
            });
    });
}