import test from './test'

console.log(test())

if (module.hot) {
    module.hot.accept('./test.js', function() {
        console.log('Accepting the updated printMe module!');
        test()
    })
}