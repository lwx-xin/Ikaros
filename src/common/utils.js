/**
 * 转换百分数
 * @param {String | Number} data 要转换的数值
 * @param {Number} decimalPlaces 小数位数,默认保留2位小数
 * @returns 
 */
const percentage = (data, decimalPlaces) => {
    var num = Number(data);
    const options = {
        style: 'percent',
        minimumFractionDigits: decimalPlaces == null ? 2 : decimalPlaces,
        maximumFractionDigits: decimalPlaces == null ? 2 : decimalPlaces,
        // signDisplay: 'always',
    };
    return new Intl.NumberFormat("zh-CN", options).format(num);
}

export {
    percentage
}