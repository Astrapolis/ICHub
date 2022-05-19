export function getHashCodeFromString(s) {
    return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
}

export function encodeStr(str) {
    const escapeChars = {
        ' ': '&nbsp;',
        '<': '&lt;',
        '>': '&gt;',
        '\n': '<br>',
    };
    const regex = new RegExp('[ <>\n]', 'g');
    return str.replace(regex, m => {
        return escapeChars[m];
    });
}

export function getUUID() {
    return new Date().getTime() + "-" + Math.floor(Math.random() * 10000);
}