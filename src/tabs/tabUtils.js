// will check that object 1 contains object 2
function objectContains(obj1, obj2) {
    return Object.keys(obj2 || {}).every(function (prop) {
        return obj1[prop] && obj1[prop] === obj2[prop];
    });
}


function formatText(text, getValue) {
    var matches = text.match(/{{([^{}]+)}}/g),
        returnText = text;
    if (!matches) { return text; }
    matches.forEach(function (match) {
        var prop = match.slice(2, match.length - 2);
        returnText = returnText.replace(match, getValue(prop));
    });
    return returnText;
}


export {
    objectContains,
    formatText
} 