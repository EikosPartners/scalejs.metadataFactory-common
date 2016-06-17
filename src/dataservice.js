    
    let testData = {
        adapter: {
            A: 'updated_a',
            B: 'updated_b'
        },
        adapter_a: {
            "result": "updated_a"
        },
        adapter_b: {
            "result": "updated_b"
        }
    }

    function ajax(r, callback) {
        callback(null, testData[r.uri]);
    }

    export default {
        ajax: ajax
    };

