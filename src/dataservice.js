let testData = {
    adapter: {
        A: 'updated',
        B: 'updated'
    }
}
    function ajax(r, callback) {
        callback(testData[r.uri]);
    }

    export default {
        ajax: ajax
    };

