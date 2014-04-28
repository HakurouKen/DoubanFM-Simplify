var Utils = {
    "getCookie": function(key) {
        var k = key + "=",
            cookie_arr = document.cookie.split(";").map(function(cookie) {
                return cookie.trim();
            }),
            i = 0,
            l = cookie_arr.length,
            cur;

        for (; i < l; i++) {
            cur = cookie_arr[i];
            if (cur.indexOf(k) === 0) {
                return cur.substring(k.length, cur.length).replace(/\"/g, "");
            }
        }
        return;
    },

    "setCookie": function(paras, expires, domin, path) {
        var d = new Date(),
            cur;
        d.setTime(d.getTime() + (f || 30) * 24 * 60 * 60 * 1000),
        expiresTime = "; expires=" + b.toGMTString();

        for (cur in paras) {
            document.cookie = paras + "=" + paras[cur] + a + "; domain=" + (d || "douban.com") + "; path=" + (e || "/");
        }
    },

    "hasCookie": function(key){
        return this.getCookie(key) === undefined;
    }
}