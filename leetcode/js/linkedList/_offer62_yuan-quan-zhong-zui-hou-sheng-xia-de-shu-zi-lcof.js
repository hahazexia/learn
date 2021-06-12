/**
 * https://leetcode-cn.com/problems/yuan-quan-zhong-zui-hou-sheng-xia-de-shu-zi-lcof/
 * 
 * @param {number} n
 * @param {number} m
 * @return {number}
 */
 var lastRemaining = function(n, m) {
    if (n === 1) return n - 1;
    return (lastRemaining(n - 1, m) + m) % n;
};

