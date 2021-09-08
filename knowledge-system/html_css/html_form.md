# form 标签

* 表单 action 属性是提交请求的地址。
* method 属性指定 http 请求的类型，如 'get' 或 'post'
* enctype 属性指定提交数据的 MIME 类型。默认值是 application/x-www-form-urlencoded。如果表单中有文件上传，则需要设置为 multipart/form-data。还有一个值是 text/plain ，纯文本。
* application/x-www-form-urlencoded 格式的数据将使用 name1=value1&name2=value2 这种形式，如果字符是合法字符从和保留字符意外的字符，则会转义成百分号加十六进制 UTF-8 编码的形式。
* multipart/form-data 格式的数据不使用 & 分隔不同参数，而使用 boundary （分界线）来分隔。
* 表单的提交后会有默认行为，会跳转到 action 的页面。此时就可以在页面里添加一个隐藏的 iframe 标签，并设置 name 值，然后 form 表单设置 target 属性为 iframe 的 name。这样表单提交后就不再跳转页面，并且响应的数据将返回至 iframe 中。

## 常用表单元素

* input type="text" type="password"
* input type="checkbox" type="radio"
* input type="file"
* input type="hidden"
* input type="submit"
* select option

## 表单元素属性

* accept

在 input type="file" 上使用。用于规定文件上传控件中期望的文件类型。例如：accept="image/png, image/bmp, image/gif, image/webp, image/jpeg, image/jpg'

* multiple

file 上使用。是否可以提交多个文件

* autocomplete

所有表单元素都可以使用。用于自动填充。值有很多种，一般常用值有两个，on 和 off

* checked

radio 和 checkbox 使用。多选按钮和单选按钮是否初始状态是选中的。

* name

表单控件的名字，会作为提交请求的参数的名字

* maxlength minlength size

在 text 和 password 上使用，maxlength 代表最多可以输入的字符个数，minlength 代表最少输入的字符个数。size 代表输入字符的长度。

size 设置后不会有任何效果。maxlength 设置后最多就只能输入 maxlength 个字符了，minlength 设置后如果不输入任何字符，空字符串可以提交，但是如果输入了字符但是小于 minlength 长度，则提交被拦截。

* placeholder

text 使用，提示文字

* required

提交表单之前必须为该元素填充值，如果不填充，则提交被拦截

* readonly disabled

disabled 代表此表单项不可用，提交时此表单项的值不会被提交（hidden 会忽略此属性）。readonly 用户无法修改此表单项的值，但是值会被提交。

* value

表单项的初始值