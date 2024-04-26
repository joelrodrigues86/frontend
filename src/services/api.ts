/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient, IHttpClient } from "@aurelia/fetch-client";
import { resolve, newInstanceOf } from '@aurelia/kernel';
import { inject } from 'aurelia';

export class WebApi {
    isRequesting: boolean = false;

    constructor(readonly http: IHttpClient = resolve(newInstanceOf(IHttpClient))) {
        http.configure(config =>
            config
                .withBaseUrl('https://localhost:44317/')
                .withDefaults({
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'Fetch'
                    }
                })
                .withInterceptor({
                    request(request) {
                        console.log(`Requesting ${request.method} ${request.url}`);
                        return request;
                    },
                    response(response) {
                        console.log(`Received ${response.status} ${response.url}`);
                        return response;
                    }
                })
        );
    }


    post(url: string, data: any = null) {
        return this.doPost(url, data)
            .then(r => this.processResponse(r))
    }

    processResponse(r: Response) {
        if (r) {
            if (r.status >= 200 && r.status <= 299) {
                return r.json();
            }
            if (r.status == 400) {
                return r.json().then(r => Promise.reject(r));
            }
        }
        return this.processError(r);
    }

    /**
    *
    * @param r
    * @return {Promise<never>}
    */
    processError(r: Response) {
        if (r) {
            if (r.status == 401) { return Promise.reject(new Error("Unauthorized - User has not a valid login.")); }
            else if (r.status == 403) { return Promise.reject(new Error("Not accessible for the current user.")); }
            else if (r.status == 404) { return Promise.reject(new Error("Not found")); }
            else {
                return Promise.reject(new Error("Unknown Error from API"));
            }
        }
        return Promise.reject(new Error("Unknown Error from API - Timeout"));
    }

    /**
 * @param route
 * @param payload
 * @return {Promise<string>}
 */
    doPost(url: string, data: any = null): Promise<Response> {
        this.isRequesting = true;
        return this.http
            .fetch(url, { method: "post", headers: {}, body: JSON.stringify(data) })
            .then((r: Response) => {
                this.isRequesting = false;
                return r;
            });
        //return this.authService.promisedActiveToken()
        //    .then(tok => {
        //        let headers: any = this.jsonHeaders;

        //        if (tok) headers.Authorization = "Bearer " + tok;
        //        else {
        //            this.isRequesting = false;
        //            this.logger.error("Could not get response from server: there isn't any valid login");
        //            return Promise.reject("Could not get response from server: there isn't any valid login");
        //        }
        //        return this.httpClient
        //            .fetch(route, { method: "post", headers: headers, body: JSON.stringify(payload) })
        //            .then((r: Response) => {
        //                this.isRequesting = false;
        //                return r;
        //            });
        //    });
    }
}

// Example POST method implementation:
async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}
