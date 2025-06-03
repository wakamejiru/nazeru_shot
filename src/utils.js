
// // import 時 こんなので書ける
// import * as MathUtils from './mathUtils.js';

/**
 * 指定された秒数だけ待機する関数
 * @param {number} seconds - 待機する秒数
 * @returns {Promise<void>} 待機後に解決されるPromise
 */
export function Wait(seconds) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000); // setTimeoutはミリ秒単位で指定
  });
}