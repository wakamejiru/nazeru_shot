
// // import 時 こんなので書ける
// import * as MathUtils from './mathUtils.js';

/**
 * 指定された秒数だけ待機する関数
 * @param {number} seconds - 待機する秒数
 * @returns {Promise<void>} 待機後に解決されるPromise
 */
export async function Wait(seconds) {
  await waitfunc(seconds);
}


function waitfunc(seconds){
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000); // setTimeoutはミリ秒単位で指定
  });
}

/**
 * 現在のブラウザがGoogle Chromeであるかを判定します。
 * (Chromium Edgeは除外します)
 * @returns {boolean} Chromeであればtrue、それ以外はfalse
 */
export function IsChromeBrowser() {
    const ua = navigator.userAgent;

    // EdgeのUser-Agentには 'Chrome' と 'Edg/' の両方が含まれる
    const isEdge = ua.includes('Edg/');
    
    // ChromeのUser-Agentには 'Chrome' が含まれ、'Edg/' は含まれない
    const isChrome = ua.includes('Chrome') && !isEdge;
    
    return isChrome;
}