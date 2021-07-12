# 主体

请求和响应中的 body 内容的类型都由 Content-Type 头部来指定。

MIME 组成结构如下： 由类型与子类型两个字符串中间用 '/' 分隔而组成。不允许空格存在。对大小写不敏感，但传统都是小写。允许额外参数。

```js
type/subtype;parameter=value
```

* type 对应通用类目，例如：text/video等。
* subtype 对应准确的子类，例如 text 下面细分为 plain(纯文本)、html(html源码)等。
* parameter可选一般是 charset 或者 boundary 等。

```js
Content-Type: text/html; charset=utf-8
Content-Type: multipart/form-data; boundary=something
```

* 包含两种类别：独立类型和 multipart 类型
    + 独立类型代表一个单独的文件或者媒体的类型
        - text 文本数据包括一些人类可读的内容或者源码。例如 text/plain, text/csv, text/html.
        - application 数据为二进制的一种，例如 application/octet-stream,application/pdf,application/pkcs8,application/zip.
        - audio 音频或者音乐数据，例如 audio/mpeg, audio/vorbis
        - video 视频数据或者文件，例如 video/mp4
        - image 图像或图形数据，包括位图和矢量静止图像以及静止图像格式的动画版本。例如 image/gif, image/png, image/jpeg
    + multipart 表示细分领域的文件类型的种类，经常对应不同的 MIME 类型。例如表单就是 multipart/form-data 类型

* 常见 Content-Type
    + text/plain
    + text/css
    + text/html
    + text/javascript
    + application/json
    + application/x-www-form-urlencoded 表单提交中默认的类型。参数编码规则：
        1. 字母 数字 -（连词号） _（下划线） .（点） *（星号） 不被编码，其他一些保留字符被编码成百分号 `%`加上十六进制 `ASCII` 码的形式，例如 `&` 被编码成 `%26`。剩下其他字符例如汉字被编码成使用这些字符的十六进制 UTF-8 编码，每两位算作一组，然后每组头部添加百分号`%`。例如 `中国` 被编码成 `%e4%b8%ad%e5%9b%bd`。
        2. 参数写成 key=value 的形式，多组参数之间用 & 连接。
        3. 空格被转为 `+` 符号。
    + multipart/form-data 涉及文件上传的表单请求时使用的类型。 作为多部分文档格式，它由边界线（一个由'--'开始的字符串）划分出的不同部分组成。每一部分有自己的实体，以及自己的 HTTP 请求头，Content-Disposition和 Content-Type 用于文件上传领域，最常用的 (Content-Length 因为边界线作为分隔符而被忽略）。
    ```js
    Content-Type: multipart/form-data; boundary=aBoundaryString
    (other headers associated with the multipart document as a whole)

    --aBoundaryString
    Content-Disposition: form-data; name="myFile"; filename="img.jpg"
    Content-Type: image/jpeg

    (data)
    --aBoundaryString
    Content-Disposition: form-data; name="myField"

    (data)
    --aBoundaryString
    (more subparts)
    --aBoundaryString--
    ```

注意：enctype 是 form 表单的属性，当 method 属性值为 post 时，enctype 就是将表单的内容提交给服务器的 MIME 类型 。可能的取值有：
* application/x-www-form-urlencoded：未指定属性时的默认值。
* multipart/form-data：当表单包含 type=file 的 input 元素时使用此值。