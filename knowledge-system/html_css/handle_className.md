# 处理 class

## Element.className

```js
let cName = element.className;
element.className = cName;
```

* 获取或设置指定元素的 class 属性的值

## Element.classList

```js
const elementClasses = element.classList;

elementClasses.length // class 列表的长度
elementClasses.add('test') // 添加新 class
elementClasses.remove('test') // 删除 class
elementClasses.add('test', 'test1') // 添加多个 class
elementClasses.remove('test', 'test1') // 删除多个 class
elementClasses.toggle('test') // 有则删除，无则添加
elementClasses.replace('foo', 'bar') // foo 替换成 bar，相当于删除 foo 添加 bar
```

* 只读属性，返回一个元素的class 属性的实时 DOMTokenList 集合。

## 封装方法

```js
function addClass (el, cls) {
  if (!cls || !(cls = cls.trim())) {
    return
  }

  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(c => el.classList.add(c))
    } else {
      el.classList.add(cls)
    }
  } else {
    const cur = ` ${el.getAttribute('class') || ''} `
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim())
    }
  }
}

function removeClass (el, cls) {
  if (!cls || !(cls = cls.trim())) {
    return
  }

  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(c => el.classList.remove(c))
    } else {
      el.classList.remove(cls)
    }
    if (!el.classList.length) {
      el.removeAttribute('class')
    }
  } else {
    let cur = ` ${el.getAttribute('class') || ''} `
    const tar = ' ' + cls + ' '
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ')
    }
    cur = cur.trim()
    if (cur) {
      el.setAttribute('class', cur)
    } else {
      el.removeAttribute('class')
    }
  }
}

function hasClass (el, cla) {
  if (!cls || !(cls = cls.trim())) {
    return
  }

  let cur = ` ${el.getAttribute('class')} `
  const tar = ' ' + cls + ' '
  if (cur.indexOf(tar) >= 0) {
    return true;
  }
  return false;
}
```