import { get, merge } from 'scalejs';
import _ from 'lodash';
import adapter from 'test/data/adapter_data.json';
import store from 'test/data/store_data.json';
import setValue from 'test/data/adapterSetValue_data.json';
import ajax from 'test/data/ajax_data.json';

const timeout = 100;
const baseUri = window.service || '/';

let testData = {
        tasks: {
            data: [
                {
                    taskName: "My Task Name",
                    name: "Deal Name",
                    id: 1,
                    taskStatus: "Incomplete",
                    dueDate: "2017-03-07T16:20:50+00:00",
                    childData: [
                        {
                            taskName: "My Child Task",
                            name: "Child Name",
                            id: 12,
                            taskStatus: "Complete",
                            dueDate: 'February 21st, 2050'
                        }
                    ]

                },
                {
                    taskName: "Zach's Task",
                    name: "Zach's Deal",
                    id: 3,
                    taskStatus: "Complete",
                    dueDate: "NaN"
                }
            ]
        },
        childTasks: {
            data: [
                {
                    childTaskName: "Wow",
                    dealName: "Ma Deal",
                    id: 13
                },
                {
                    childTaskName: "So",
                    dealName: "Much",
                    id: 14
                }
            ]
        }
    },
    o = {};


_.merge(testData, adapter, store, setValue, ajax);

// request can either be a string (url), or an object with request.url, and/or request.options
// request.options can specify the options.type (GET/POST/ect), and options.data to send in request.
function _ajax(request, callback) {
    // Extract options and url from request:
    let req = request || baseUri; // Default for request when falsy

    const isRequestString = (typeof req === 'string' || req instanceof String),
        // use request.options if exists, otherwise use {}
        options = (!isRequestString && req.options) || {},
        type = (options.type || 'GET').toUpperCase(),
        data = req.data || req.data;

    let url = (isRequestString ? req : req.url || '/') + (req.uri || '');

    // Check if we're in the testing suite.
    // Also check if we are working from a file and not a server. (i.e. with the common bundle)
    if (window.location.port === '9004' || window.location.protocol === 'file:') {
        url = 'http://localhost:3000' + url;
    }

    // Create request:
    req = new XMLHttpRequest();

    req.withCredentials = true;

    req.onreadystatechange = function () {
        // Check to make sure request is completed, otherwise ignore:
        if (this.readyState === XMLHttpRequest.DONE) {
            let response = this.response;
            if (this.status === 200) {
                // Request was successful, now parse:
                if (this.getResponseHeader('Content-Type').includes('application/json')) {
                    try {
                        response = JSON.parse(response);
                    } catch (error) {
                        // Failed to parse, error:
                        return callback({
                            error: error,
                            status: this.status,
                            message: response
                        });
                    }
                }

                callback(undefined, response);
            } else {
                // Request errored in some way, return error:
                callback({
                    error: this.statusText,
                    status: this.status,
                    message: response
                });
            }
        }
    };

    // Open and send request:
    req.open(type, url, true);

    // Set options:
    if (type !== 'GET') { req.setRequestHeader('Content-Type', 'application/json'); }

    req.send(type !== 'GET' && JSON.stringify(data));
}

function mockAjax(request, callback) {
    setTimeout(() => {
        if (request.uri) {

            if(request.uri === 'error-endpoint'){
                callback({Status: 'Error', message: 'Error'});
            } else if (get(request, 'options.type') === 'POST' || get(request, 'options.type') === 'PUT') {
                callback(null, { Status: 'SUCCESS', Original: request.data });
            } else if (testData[request.uri]){
                callback(null, testData[request.uri]);
            } else if (request.uri.indexOf('tasks/') > -1) {
                let id = request.uri.match(/[0-9]/)[0],
                    task = {
                        data: []
                    };

                testData.tasks.data.some( (data) => {
                    if (data.id === parseInt(id)) {
                        task.data = data.childData;
                        return true;
                    }
                });

                callback(null, task);
            } else {

                _ajax(request, (error, data) => {
                    callback(error, data);
                });
            }
        } else {
            callback({Status: 'Error', message: 'Error'});
        }
    }, timeout);
}

export default {
    ajax: mockAjax
};
