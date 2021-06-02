function fib1 (n) {
    if (n <= 1) return n;
    return fib1(n - 1) + fib1(n - 2)
}

function fib2 (n) {
    if (n <= 1) return n;
    let first = 0;
    let second = 1;
    for (let i = 0; i < n -1; i++) {
        let temp = first + second;
        first = second;
        second = temp;
    }
    return second
}