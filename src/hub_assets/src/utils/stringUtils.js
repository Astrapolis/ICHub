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

export function str2blob(str) {
    return new Blob(([str]));
}

export function str2Utf8Bytes(str) {
    const utf8 = [];
    for (let ii = 0; ii < str.length; ii++) {
        let charCode = str.charCodeAt(ii);
        if (charCode < 0x80) utf8.push(charCode);
        else if (charCode < 0x800) {
            utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
        } else if (charCode < 0xd800 || charCode >= 0xe000) {
            utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
        } else {
            ii++;
            // Surrogate pair:
            // UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and
            // splitting the 20 bits of 0x0-0xFFFFF into two halves
            charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
            utf8.push(
                0xf0 | (charCode >> 18),
                0x80 | ((charCode >> 12) & 0x3f),
                0x80 | ((charCode >> 6) & 0x3f),
                0x80 | (charCode & 0x3f),
            );
        }
    }
    return utf8;
}

export function utf8Bytes2Str(data) {
    function pad(n) {
        return n.length < 2 ? "0" + n : n;
    }

    var array = new Uint8Array(data);
    var str = "";
    for (var i = 0, len = array.length; i < len; ++i) {
        str += ("%" + pad(array[i].toString(16)))
    }

    str = decodeURIComponent(str);
    return str;
}
