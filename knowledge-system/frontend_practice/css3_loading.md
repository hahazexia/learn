# css 实现 loading 动画

## 菊花图案的 loading 动画

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .spin-box {
      width: 48px;
      height: 48px;
      position: relative;
    }
    .spin-box .circle {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
    }
    .spin-box .circle:before {
      content: '';
      display: block;
      margin: 0 auto;
      width: 10%;
      height: 30%;
      background-color: rgba(0, 111, 255, 1);
      border-radius: 30%;
      animation: circleFadeDelay 1.2s infinite ease-in-out both;
      animation-delay: -1.1s;
    }
    .spin-box .circle2 {
      transform: rotate(45deg);
    }
    .spin-box .circle2:before {
      background-color: rgba(0, 111, 255, 0.9);
      animation-delay: -1.0s;
    }
    .spin-box .circle3 {
      transform: rotate(90deg);
    }
    .spin-box .circle3:before {
      background-color: rgba(58, 106, 169, 0.8);
      animation-delay: -0.9s;
    }
    .spin-box .circle4 {
      transform: rotate(135deg);
    }
    .spin-box .circle4:before {
      background-color: rgba(0, 111, 255, 0.7);
      animation-delay: -0.8s;
    }
    .spin-box .circle5 {
      transform: rotate(180deg);
    }
    .spin-box .circle5:before {
      background-color: rgba(0, 111, 255, 0.6);
      animation-delay: -0.7s;
    }
    .spin-box .circle6 {
      transform: rotate(225deg);
    }
    .spin-box .circle6:before {
      background-color: rgba(0, 111, 255, 0.6);
      animation-delay: -0.6s;
    }
    .spin-box .circle7 {
      transform: rotate(270deg);
    }
    .spin-box .circle7:before {
      background-color: rgba(0, 111, 255, 0.5);
      animation-delay: -0.5s;
    }
    .spin-box .circle8 {
      transform: rotate(315deg);
    }
    .spin-box.circle8:before {
      background-color: rgba(0, 111, 255, 0.4);
      animation-delay: -0.4s;
    }

    @-webkit-keyframes circleFadeDelay {
      0%, 39%, 100% { opacity: 0; }
      40% { opacity: 1; }
    }
    @keyframes circleFadeDelay {
      0%, 39%, 100% { opacity: 0; }
      40% { opacity: 1; } 
    }
  </style>
</head>
<body>
  <div class="spin-box">
    <div class="circle"></div>
    <div class="circle circle2"></div>
    <div class="circle circle3"></div>
    <div class="circle circle4"></div>
    <div class="circle circle5"></div>
    <div class="circle circle6"></div>
    <div class="circle circle7"></div>
    <div class="circle circle8"></div>
  </div>
</body>
</html>

```

* 原理是先创建 9 个 div，对应 9 个花瓣，然后给 9 个 div 设置 before 伪元素，这个伪元素就是花瓣，写好花瓣的样式后，9 个伪元素是重叠在一起的，然后给 2 - 9 的花瓣分别设置不同角度的 transform: rotate(prev + 45deg); 样式，每一个花瓣都绕中心旋转比上一个花瓣多 45 度，这样就形成了一朵花的形状。然后设置动画帧，0% 39% 100% 的时候 opacity 都是 0，也就是看不见，而 40% 的时候 opacity 是 1，说明花瓣先快速出现，然后再缓慢消失。

* animation: circleFadeDelay 1.2s infinite ease-in-out both; 
    ```css
        .div {
            animation-name: circleFadeDelay; /* 使用 circleFadeDelay 动画帧 */
            animation-duration: 1.2s; /* 动画持续时间 */
            animation-iteration-count: infinite; /* 动画反复播放次数 infinite 无数次 */
            animation-timing-function: ease-in-out; /* 动画的速度曲线 ease-in-out 加速后减速 */
            animation-fill-mode: both;
            /*
                animation-fill-mode 填充模式
                forwards：当动画完成后，保持最后一个属性值（在最后一个关键帧中定义）。
                backwards：在 animation-delay 所指定的一段时间内，在动画显示之前，应用开始属性值（在第一个关键帧中定义）。
                both：向前和向后填充模式都被应用。
             */
        }
    ```

* 然后再设置不同花瓣不同的 animation-delay 动画开始前的延迟时间，使得每个花瓣的闪现是依次进行的即可

## 琴键长短变化 loading 动画

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .loading-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 90px;
            width: 80px;
        }
        .loading-box .key {
            width: 15px;
            height: 50px;
            margin-left: 8px;
            background-color: #67C1F5;
            animation: keyHeightScale 1.2s infinite ease-in-out both;
        }
        .loading-box .key2 {
            animation-delay: 0.2s;
        }
        .loading-box .key3 {
            animation-delay: 0.4s;
        }

        @keyframes keyHeightScale {
            0%, 100%{
                height: 50px;
            }
            50% {
                height: 80px;
            }
        }
    </style>
</head>
<body>
    <div class="loading-box">
        <div class="key key1"></div>
        <div class="key key2"></div>
        <div class="key key3"></div>
    </div>
</body>
</html>
```