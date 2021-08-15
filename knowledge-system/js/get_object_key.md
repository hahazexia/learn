# 遍历对象的属性

* for...in：只遍历对象`自身的`和`继承的` `可枚举的`属性。
* Object.keys()：返回对象`自身的`所有`可枚举的`属性的键名。
* JSON.stringify()：只串行化对象`自身的` `可枚举的`属性。
* Object.assign()： 只拷贝对象`自身的` `可枚举的`属性。
* Object.getOwnPropertyNames(obj)：返回一个数组，包含对象`自身的`所有属性（不含 Symbol 属性，但是`包括不可枚举属性`）的键名。
* Object.getOwnPropertySymbols(obj)：返回一个数组，包含对象`自身的`所有 `Symbol` 属性的键名。
* Reflect.ownKeys(obj)：返回一个数组，包含对象`自身的`（不含继承的）所有键名，不管键名是 `Symbol 或字符串`，也`不管是否可枚举`。