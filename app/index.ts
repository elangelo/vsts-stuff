import * as fetch from "isomorphic-fetch"
import * as deepdiff from "deep-diff"
import * as readlinesync from "readline-sync"

interface Config {
    account: string,
    username: string,
    token: string,
    project: string
}

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
                console.log(`${envcloud.name} starting`);
                for (let diff of differences) {
                    console.log(`${diff.path}: ${diff.kind}`);
                    console.log(`< ${diff.lhs}`);
                    console.log(`> ${diff.rhs}`);
                    console.log('======')

                    readlinesync.question('push key to proceed');
                }
                console.log(`${envcloud.name} done`);
                console.log();
                console.log();
            }
            else {
                console.log(`${(<any>env10th).name} not found in cloud`);
            }
        }



        // // // // let ignoreKeys = ['id', 'createdBy', 'createdOn', 'modifiedBy', 'modifiedOn', 'displayName', 'uniqueName']

        // // // // let filter: deepDiff.IPrefilter = function (path, key) {
        // // // //     return ignoreKeys.indexOf(key) >= 0;
        // // // // }
        // // // let differences: deepDiff.IDiff[] = deepdiff.diff(values[0], values[1], filter, );

        // // // for (let diff of differences) {
        // // //     // let diff: deepDiff.IDiff = change;
        // // //     console.log(`${diff.path}: ${diff.kind}`);
        // // //     console.log(`< ${diff.lhs}`);
        // // //     console.log(`> ${diff.rhs}`);
        // // //     console.log('======')
        // // // }

        console.log("**done**");
    }


)


function btoa(input: string): string {
    return new Buffer(input).toString('base64');
}

function getReleaseDefinition(config: Config, releaseDefinitionId: Number): Promise<string> {
    return new Promise<string>((resolve) => {
        let apiversion: string = "3.0-preview.1";
        let releasedefinitionUri: string = `https://${account}.vsrm.visualstudio.com/defaultcollection/${project}/_apis/release/definitions/${releaseDefinitionId}?api-version=${apiversion}`

        let headers: Headers = new Headers();
        var token = btoa(`${config.username}:${config.token}`);
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
