export function parseParam(url) {
    const res = /.+\?(.+)$/.exec(url);
    if (!res) return '';
    const paramsStr = res[1];
    const paramsArr = paramsStr.split('&');
    let paramsObj = {};

    paramsArr.forEach(param => {
        if (/=/.test(param)) {
            let [key, val] = param.split('=');
            val = decodeURIComponent(val);
            val = /^\d+$/.test(val) ? parseFloat(val) : val;
            if (Object.prototype.hasOwnProperty.call(paramsObj, key)) {
                paramsObj[key] = [].concat(paramsObj[key], val);
            } else {
                paramsObj[key] = val;
            }
        } else {
            paramsObj[param] = true;
        }
    })
    
    return paramsObj;
}
