import type { DebouncedFunc, DebounceSettings } from 'lodash';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useRef } from 'react';
import type { Plugin } from '../types';

const useDebouncePlugin: Plugin<any, any[]> = (
  fetchInstance,
  { debounceWait, debounceLeading, debounceTrailing, debounceMaxWait },
) => {
  const debouncedRef = useRef<DebouncedFunc<any>>();

  const options = useMemo(() => {
    const ret: DebounceSettings = {};
    if (debounceLeading !== undefined) {
      // 指定在延迟开始前调用
      ret.leading = debounceLeading;
    }
    if (debounceTrailing !== undefined) {
      // 指定在延迟结束后调用
      ret.trailing = debounceTrailing;
    }
    if (debounceMaxWait !== undefined) {
      // 设置 func 允许被延迟的最大值
      ret.maxWait = debounceMaxWait;
    }
    return ret;
  }, [debounceLeading, debounceTrailing, debounceMaxWait]);

  useEffect(() => {
    if (debounceWait) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

      debouncedRef.current = debounce(
        // 要防抖动的函数
        (callback) => {
          callback();
        },
        // 需要延迟的毫秒数
        debounceWait,
        // 选项对象
        options,
      );

      // debounce runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      /**
       * 防抖核心是调用了lodash的debounce方法
       * 修改了调用实例的runAsync方法为返回promise解决异步防抖方法的issue
       */
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          debouncedRef.current?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        debouncedRef.current?.cancel();
        fetchInstance.runAsync = _originRunAsync;
      };
    }
  }, [debounceWait, options]);

  if (!debounceWait) {
    return {};
  }

  return {
    onCancel: () => {
      debouncedRef.current?.cancel();
    },
  };
};

export default useDebouncePlugin;
