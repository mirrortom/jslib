// ====================================================================
// h5回退组件.使用了h5的3个API,replaceState,pushState,onpopstate
// 用于网页单页应用的回退导航.用法示例:
// let back=win.ns.hisBack;
// back.setBase();// 基准页,栈底.
// back.addHis();// 载入新页面时,执行加入历史记录.
// ====================================================================
((win) => {
  //===回退组件对象
  let obj = {};
  // 栈索引值,总是指向最新增加的历史.最小值为0,表示回退到底了
  obj.stackIndex = 0;

  // 历史记录起点.在第一个页面(单页应用只有一个页面)载入执行一次,回退时,最终会退到这个页面.
  obj.setBase = (baseUrl = 'index.html') => {
    win.history.replaceState({ index: 0 }, null, baseUrl);
  }

  //===method
  /**
   * 增加一个页面历史
   * @param {any} url 页面url
   * @param {any} addFun 增加后执行
   */
  obj.addHis = (url, addFun) => {
    // 栈增加一个
    obj.stackIndex++;
    // 加入历史
    win.history.pushState({ index: obj.stackIndex }, null, url);
    // 执行方法
    if (addFun == 'function') {
      addFun(obj.stackIndex);
    }
  }

  //===event
  // 浏览器回退时执行方法.
  // 例如回退时,会删除当前页面,回到前一页.参数是stackIndex的值
  obj.onBack = null;

  // 注册onpopstate事件,浏览器回退和前进时会触发这个事件.这是实现功能的关键方法.
  win.onpopstate = function (event) {
    // 如何判断回退还是前进?
    // 注意事件的state对象,是已经回退到的页面的,而不是回退前的页面的
    // 每次加入历史时,都在state对象里保留了加入时的索引值.将该值和回退前索引比较,如果小,就是点了回退.
    // 否则就是前进,但在webapp中,不考虑前进.
    if (event.state.index < obj.stackIndex) {
      //console.log('点击了后退按钮!');
      // 执行事件
      if (typeof obj.onBack == 'function') {
        obj.onBack(obj.stackIndex);
      }
      // 栈减去一个(栈总是指向最新页面,回退到的页面就是最新的了.)
      obj.stackIndex--;
      // 小于0的情况不可能发生,不操作stackIndex变量的情况下.
      //if (obj.stackIndex < 0) {
        //obj.stackIndex = 0;
        //  alert("再按一次,退出系统!");
      //}
    }
  }
  // output
  win.ns.hisBack = obj;
})(window);