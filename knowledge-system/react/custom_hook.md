# 自定义 hook

## useFetch

* data 存请求结果数据，error 存错误信息，loading 标识是否请求正在进行中。isMounted 用于标识是否当前 effect 被清除

```js
import { useState, useEffect } from 'react';

const useFetch = (url = '', options = null) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    fetch(url, options)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setData(data);
          setError(null);
        }
      })
      .catch(error => {
        if (isMounted) {
          setError(error);
          setData(null);
        }
      })
      .finally(() => isMounted && setLoading(false));

    return () => (isMounted = false);
  }, [url, options]);

  return { loading, error, data };
};

export default useFetch;
```

useFetch 使用范例：

```js
import useFetch from './useFetch';

const App = () => {
  const { loading, error, data = [] } = useFetch(
    'https://hn.algolia.com/api/v1/search?query=react'
  );

  if (error) return <p>Error!</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <ul>
        {data?.hits?.map(item => (
          <li key={item.objectID}>
            <a href={item.url}>{item.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## useEventListener

useEventListener 用于添加事件监听器

```js
import { useEffect, useRef } from 'react';

const useEventListener = (
  eventType = '',
  listener = () => null,
  target = null,
  options = null
) => {
  const savedListener = useRef();

  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!target?.addEventListener) return;

    const eventListener = event => savedListener.current(event);

    target.addEventListener(eventType, eventListener, options);

    return () => {
      target.removeEventListener(eventType, eventListener, options);
    };
  }, [eventType, target, options]);
};

export default useEventListener;

```

useEventListener 使用范例，这里实现了点击空白处关闭弹窗

```js
import { useRef } from 'react';
import ReactDOM from 'react-dom';
import { useEventListener } from './hooks';

const Dialog = ({ show = false, onClose = () => null }) => {
  const dialogRef = useRef();

  // Event listener to close dialog on click outside element
  useEventListener(
    'mousedown',
    event => {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        console.log('Click outside detected -> closing dialog...');
        onClose();
      }
    },
    window
  );

  return show
    ? ReactDOM.createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-12 bg-blurred">
          <div
            className="relative bg-white rounded-md shadow-card max-h-full max-w-screen-sm w-full animate-zoom-in px-6 py-20"
            ref={dialogRef}
          >
            <p className="text-center font-semibold text-4xl">
              What's up{' '}
              <span className="text-white bg-red-500 py-1 px-3 rounded-md mr-1">
                YouTube
              </span>
              ?
            </p>
          </div>
        </div>,
        document.body
      )
    : null;
};

export default Dialog;

```

## useLocalStorage

```js
import { useState } from 'react';

const useLocalStorage = (key = '', initialValue = '') => {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setLocalStorageState = newState => {
    try {
      const newStateValue =
        typeof newState === 'function' ? newState(state) : newState;
      setState(newStateValue);
      window.localStorage.setItem(key, JSON.stringify(newStateValue));
    } catch (error) {
      console.error(`Unable to store new value for ${key} in localStorage.`);
    }
  };

  return [state, setLocalStorageState];
};

export default useLocalStorage;

```

useLocalStorage 使用范例

```js
import { useLocalStorage } from './hooks';

const defaultSettings = {
  notifications: 'weekly',
};

function App() {
  const [appSettings, setAppSettings] = useLocalStorage(
    'app-settings',
    defaultSettings
  );

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <div className="flex items-center mb-8">
        <p className="font-medium text-lg mr-4">Your application's settings:</p>

        <select
          value={appSettings.notifications}
          onChange={e =>
            setAppSettings(settings => ({
              ...settings,
              notifications: e.target.value,
            }))
          }
          className="border border-gray-900 rounded py-2 px-4 "
        >
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>
      </div>

      <button
        onClick={() => setAppSettings(defaultSettings)}
        className="rounded-md shadow-md py-2 px-6 bg-red-500 text-white uppercase font-medium tracking-wide text-sm leading-8"
      >
        Reset settings
      </button>
    </div>
  );
}

export default App;

```

## useMediaQuery

每当页面的媒体查询改变时候，找到匹配的值然后返回。queries 对应媒体查询的字符串数组，values 以与前一个数组相同的顺序匹配这些媒体查询的值数组，defaultValue 如果没有匹配的媒体查询，则使用默认值

```js
mport { useState, useCallback, useEffect } from 'react';

const useMediaQuery = (queries = [], values = [], defaultValue) => {
  const mediaQueryList = queries.map(q => window.matchMedia(q));

  const getValue = useCallback(() => {
    const index = mediaQueryList.findIndex(mql => mql.matches);
    return typeof values[index] !== 'undefined' ? values[index] : defaultValue;
  }, [mediaQueryList, values, defaultValue]);

  const [value, setValue] = useState(getValue);

  useEffect(() => {
    const handler = () => setValue(getValue);
    mediaQueryList.forEach(mql => mql.addEventListener('change', handler));

    return () =>
      mediaQueryList.forEach(mql => mql.removeEventListener('change', handler));
  }, [getValue, mediaQueryList]);

  return value;
};

export default useMediaQuery;

```

使用例子

```js
import { useMediaQuery } from './hooks';

function App() {
  const canHover = useMediaQuery(
    // Media queries
    ['(hover: hover)'],
    // Values corresponding to the above media queries by array index
    [true],
    // Default value
    false
  );

  const canHoverClass = 'opacity-0 hover:opacity-100 transition-opacity';
  const defaultClass = 'opacity-100';

  return (
    <div className={canHover ? canHoverClass : defaultClass}>Hover me!</div>
  );
}

export default App;

```

## useDarkMode

```js
import { useEffect } from 'react';
import useMediaQuery from './useMediaQuery';
import useLocalStorage from './useLocalStorage';

const useDarkMode = () => {
  const preferDarkMode = useMediaQuery(
    ['(prefers-color-scheme: dark)'],
    [true],
    false
  );

  const [enabled, setEnabled] = useLocalStorage('dark-mode', preferDarkMode);

  useEffect(() => {
    if (enabled) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [enabled]);

  return [enabled, setEnabled];
};

export default useDarkMode;

```