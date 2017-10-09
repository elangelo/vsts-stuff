import * as fetch from "isomorphic-fetch";
import * as deepdiff from "deep-diff";
import * as jsdiff from "diff";
import * as readlinesync from "readline-sync";
import * as colors from "colors/safe";
import * as functions from "./functions";

import { Config } from "./configuration";

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
// work.push(getReleaseDefinition(appconfig, 1));
// work.push(getReleaseDefinition(appconfig, 4));

work.push(getReleaseRelease(appconfig, 320));
work.push(getReleaseRelease(appconfig, 350))
Promise.all(work).then(
    values => {

        var envs10th = (<any>(values[0])).environments;
        var envscloud = (<any>(values[1])).environments;

        for (let env10th of envs10th) {
            var envcloud = envscloud.find(e => (<any>e).name == (<any>env10th).name);
            if (envcloud) {
                // // // // // let differences = diff.diffJson(env10th, envcloud);
                // // // // // differences.forEach(function (part) {
                // // // // //     var color = part.added ? 'green' : part.removed ? 'red' : 'grey';
                // // // // //     console.log(part.added)
                // // // // //     console.log(part.removed);
                // // // // //     process.stderr.write(part.value);
                // // // // //     readlinesync.question('push key to proceed');
                // // // // // });
                let differences: deepDiff.IDiff[] = deepdiff.diff(env10th, envcloud);
                console.log(Cyan)
                console.log(`${envcloud.name} starting`);
                console.log(Reset);
                for (let diff of differences) {
                    var kind: string = '';
                    switch (diff.kind) {
                        case 'A':
                            {
                                kind = '<add>'
                                process.stderr.write(`${diff.path}: ${kind} : `);
                                process.stderr.write(colors.green(diff.rhs));
                                process.stderr.write('\n');
                                break;
                            }
                        case 'E':
                            {
                                kind = '<edit>';
                                process.stderr.write(`${diff.path}: ${kind} : `);
                                var lhs = diff.lhs.toString();
                                var rhs = diff.rhs.toString();
                                let differ = new jsdiff.Diff();

                                // let intdifferences: jsdiff.IDiffResult[] = differ.diff(lhs,rhs);
                                let intdifferences: jsdiff.IDiffResult[] = jsdiff.diffWordsWithSpace(lhs, rhs);
                                intdifferences.forEach(function (part) {
                                    if (part.added) {
                                        process.stderr.write(colors.green(part.value));
                                    }
                                    else if (part.removed) {
                                        process.stderr.write(colors.red(part.value));
                                    }
                                    else {
                                        process.stderr.write(colors.grey(part.value));
                                    }
                                });
                                process.stderr.write('\n');
                                break;
                            }
                        default:
                            kind = diff.kind;
                    }


                }
                readlinesync.question('push key to proceed');
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
        let token: string = functions.btoa(`${config.username}:${config.token}`);
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

function getReleaseRelease(config: Config, releaseReleaseId: Number): Promise<string> {
    return new Promise<string>((resolve) => {
        let apiversion: string = "3.0-preview.1";
        let releasesreleaseUri: string = `https://${account}.vsrm.visualstudio.com/defaultcollection/${project}/_apis/release/releases/${releaseReleaseId}?api-version=${apiversion}`

        let headers: Headers = new Headers();
        let token: string = functions.btoa(`${config.username}:${config.token}`);
        headers.append("Authorization", `Basic ${token}`);

        let init: RequestInit = {
            method: "GET",
            headers: headers,
        }

        let request: Request = new Request(releasesreleaseUri, init);

        fetch(request)
            .then((response) => {
                return response.json()
            })
            .then((json) => {
                resolve(json);
            });
    });
}