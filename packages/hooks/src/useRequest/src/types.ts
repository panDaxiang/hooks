import type { DependencyList } from 'react';
import type Fetch from './Fetch';
import type { CachedData } from './utils/cache';

/**
 * @description 请求方法
 * @returns Promise
 */
export type Service<TData, TParams extends any[]> = (...args: TParams) => Promise<TData>;

/** 更新发布通知方法 */
export type Subscribe = () => void;

/** 请求的状态 */
export interface FetchState<TData, TParams extends any[]> {
  loading: boolean;
  params?: TParams;
  data?: TData;
  error?: Error;
}

/**
 * @description 自定义插件返回的值
 * @props onBefore 请求发送前执行,此阶段不可中断
 * @props onRequest 请求发送前执行，可通过stopNow、returnNow中断
 * @props onSuccess 请求成功
 * @props onError 请求失败
 * @props onFinally 请求结束
 * @props onCancel 中断请求响应时候执行
 * @props onMutate 修改响应data时候执行
 */
export interface PluginReturn<TData, TParams extends any[]> {
  onBefore?: (params: TParams) =>
    | ({
        stopNow?: boolean;
        returnNow?: boolean;
      } & Partial<FetchState<TData, TParams>>)
    | void;

  onRequest?: (
    service: Service<TData, TParams>,
    params: TParams,
  ) => {
    servicePromise?: Promise<TData>;
  };

  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (e: Error, params: TParams) => void;
  onFinally?: (params: TParams, data?: TData, e?: Error) => void;
  onCancel?: () => void;
  onMutate?: (data: TData) => void;
}

/** @description 配置项 */
export interface Options<TData, TParams extends any[]> {
  manual?: boolean;

  onBefore?: (params: TParams) => void;
  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (e: Error, params: TParams) => void;
  // formatResult?: (res: any) => TData;
  onFinally?: (params: TParams, data?: TData, e?: Error) => void;

  defaultParams?: TParams;

  // refreshDeps
  refreshDeps?: DependencyList;
  refreshDepsAction?: () => void;

  // loading delay
  loadingDelay?: number;

  // polling
  pollingInterval?: number;
  pollingWhenHidden?: boolean;
  pollingErrorRetryCount?: number;

  // refresh on window focus
  refreshOnWindowFocus?: boolean;
  focusTimespan?: number;

  // debounce
  debounceWait?: number;
  debounceLeading?: boolean;
  debounceTrailing?: boolean;
  debounceMaxWait?: number;

  // throttle
  throttleWait?: number;
  throttleLeading?: boolean;
  throttleTrailing?: boolean;

  // cache
  cacheKey?: string;
  cacheTime?: number;
  staleTime?: number;
  setCache?: (data: CachedData<TData, TParams>) => void;
  getCache?: (params: TParams) => CachedData<TData, TParams> | undefined;

  // retry
  retryCount?: number;
  retryInterval?: number;

  // ready
  ready?: boolean;

  // [key: string]: any;
}

/**
 * 自定义的useRequest插件;
 * 插件格式是一个函数，上面或许有属性onInit;
 */
export type Plugin<TData, TParams extends any[]> = {
  (fetchInstance: Fetch<TData, TParams>, options: Options<TData, TParams>): PluginReturn<
    TData,
    TParams
  >;
  onInit?: (options: Options<TData, TParams>) => Partial<FetchState<TData, TParams>>;
};

/** useRequest暴露的属性 */
export interface Result<TData, TParams extends any[]> {
  loading: boolean;
  data?: TData;
  error?: Error;
  params: TParams | [];
  cancel: Fetch<TData, TParams>['cancel'];
  refresh: Fetch<TData, TParams>['refresh'];
  refreshAsync: Fetch<TData, TParams>['refreshAsync'];
  run: Fetch<TData, TParams>['run'];
  runAsync: Fetch<TData, TParams>['runAsync'];
  mutate: Fetch<TData, TParams>['mutate'];
}

export type Timeout = ReturnType<typeof setTimeout>;
