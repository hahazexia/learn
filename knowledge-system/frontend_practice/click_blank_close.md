# 点击空白处关闭弹框

```html
<body>
    <button type="button" class="clickBtn">点击我</button>
    <div id="mask">
        <p class="title">提示</p>
        <p>
            <span class="area-content">这是一个弹框</span>
            <a href="javascript:;">跳转</a>
        </p>
    </div>
    <script type="text/javascript">
        document.querySelector('.clickBtn').addEventListener('click', () => {
            document.querySelector('#mask').style.display = 'block';
            setTimeout(() => {
                window.addEventListener('click', hides, false);
            }, 0);
        });
        function hides(e) {
            document.querySelector('#mask').style.display = 'none';
            window.removeEventListener('click', hides, false);
        }

        document.querySelector('#mask').addEventListener('click', e => {
            e.stopPropagation();
        });
    </script>
</body>
```
