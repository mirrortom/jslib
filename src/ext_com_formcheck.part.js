((win) => {
  const $ = win.ns.jslib;

  // 验证类型.每个类型对应一个完成验证功能的函数
  const vTypeFun = {
    // 必要项且不能为空或空白字符
    'notnull': (ele) => {
      return $.isNotNull(ele.value);
    },
    // 电子邮件格式
    'email': (ele) => {
      return $.isEmail(ele.value);
    },
    // 指示一个字符串是否为国内11位手机号
    // [可匹配"(+86)013800138000",()号可以省略，+号可以省略，(+86)可以省略, 11位手机号前的0可以省略; 11位手机号第二位数可以是3~9中的任意一个]
    'mobile': (ele) => {
      return $.isMobile(ele.value);
    },
    // 限26个英文,大小写不限.
    'abc': (ele) => {
      return $.isAbc(ele.value);
    },
    // 限0-9数字
    '123': (ele) => {
      return $.isDigit(ele.value);
    },
    // 限26个英文字母(开头)和0-9整数(可选)
    'abc123': (ele) => {
      return $.isAbcDigit(ele.value);
    },
    // 限26个英文字母和0-9整数(可选)和_下划线(可选),并且是字母或者下划线开头.
    'abc_123': (ele) => {
      return $.isAbcDigitUline(ele.value);
    },
    // 限url
    'url': (ele) => {
      return $.isUrl(ele.value);
    },
    // 限ipv4
    'ipv4': (ele) => {
      return $.isIpv4(ele.value);
    },
    // 标准日期 "1999-02-28 12:08:33"
    'date': (ele) => {
      return $.isDate(ele.value);
    },
    // 正整数或正1-3位小数
    'money': (ele) => {
      return $.isMoney(ele.value);
    },
    // 是否超长度限制
    'maxlen': (ele) => {
      let maxlen = ele.getAttribute('maxlength');
      return !$.isMaxLength(ele.value, maxlen);
    },
    // 是否大于最小长度
    'minlen': (ele) => {
      let minlen = ele.getAttribute('minlength');
      return !$.isMinLength(ele.value, minlen);
    },
    // 数值要大于指定数值
    'minnum': (ele) => {
      let minnum = ele.getAttribute('minnum');
      return !$.isMinNum(ele.value, minnum);
    },
    // 数值要小于指定数值
    'maxnum': (ele) => {
      let maxnum = ele.getAttribute('maxnum');
      return !$.isMaxNum(ele.value, maxnum);
    },
    // 必须同意,比如用户协议.必须是m-check元素
    'agree': (ele) => {
      return ele.checked;
    }
  };

  // 表单元素错误提示样式类,提示语样式类
  const inputCls = 'formcheck-err',
    errmsgCls = 'formcheck-errmsg';

  /**
   * 清除表单元素的错误样式和提示语.
   * @param {HTMLElement|any} elem input,textarea元素
   */
  $.formClear = (elem) => {
    if ($(elem).hasClass(inputCls)) {
      $(elem).next('.' + errmsgCls).remove();
      elem.style.backgroundColor = null;
      elem.parentNode.style.position = null;
    }
    elem.removeEventListener('focus', $.formClear);
  };
  // 
  /**
   * 生成表单元素验证出错时的错误样式和提示语: 背景变红,在其正下方生成span,显示提示语
   * @param {HTMLElement|any} elem input,textarea元素
   * @param {string} msg 提示语
   */
  $.formAlert = (elem, msg) => {
    let bgColor = '#fca5a5', fgColor = '#333';
    // input加背景色
    $(elem).addClass(inputCls);
    elem.style.backgroundColor = bgColor;
    // input父级相对定位
    elem.parentNode.style.position = 'relative';
    // 显示提示语的span.其长度,背景色与input相同.显示在input正下方,对齐input左边
    let errmsg = $('<span>').addClass(errmsgCls).text('✖ ' + msg)[0];
    errmsg.style.cssText = $.format(
      'position:absolute;top:{0}px;left:{1}px;padding:5px;background-color:{2};color:{3};font-weight:600;width:{4}px;z-index:999',
      elem.offsetTop + elem.offsetHeight, elem.offsetLeft, bgColor, fgColor, elem.offsetWidth);
    $(elem).after(errmsg);
    // 焦点/点击事件:去掉错误提示
    elem.addEventListener('focus', () => { $.formClear(elem) });
  };
  /**
   * 验证表单元素的值
   * @param {HTMLElement|any} elem input,textarea元素
   * @returns {boolean} t/f 
   */
  $.formCheck = (elem) => {
    // 1.验证准备
    // 获取验证类型和错误提示语.元素上的vtype属性值(多个验证用|隔开).未找到或者类型错误则退出
    let vtypeStr = elem.getAttribute('vtype');
    // 没有在要验证的元素上设置vtype属性,忽略并通过
    if ($.isNullOrWhiteSpace(vtypeStr))
      return true;

    //
    let formVTypes = vtypeStr.split("|");
    // 如果检测到一个验证类型无效,丢异常
    for (var i = 0, len = formVTypes.length; i < len; i++) {
      if (!vTypeFun.hasOwnProperty(formVTypes[i]))
        throw 'vtype value wrong: ' + formVTypes[i];
    }

    // 自定义的错误提示信息,多个也是|号分开.与vtype索引对应
    let validerrmsg = [],
      verrmsgStr = elem.getAttribute('verrmsg');
    if (!$.isNullOrWhiteSpace(verrmsgStr))
      validerrmsg = verrmsgStr.split("|");
    // 验证前清除旧的提示语span(如果有)
    $.formClear(elem);
    // 2.开始验证
    for (var n = 0, nlen = formVTypes.length; n < nlen; n++) {
      // 执行验证函数
      let isValid = vTypeFun[formVTypes[n]](elem);
      if (isValid != true) {
        $.formAlert(elem, validerrmsg[n] || 'validation failed: ' + formVTypes[n]);
        return false;
      }
    }
    //
    return true;
  };
  /**
   * 将一个父元素中的所有含有name属性的input,select,textarea子元素,将其name值为属性名,value值为属性值,组成一个json对象返回.
   * @param {HTMLElement} parent 容器元素dom对象
   * @param {bool} notEmptyVal 设为true时,input的值长度为空时,不加入json
   * @returns {any} json对象
   */
  $.formJson = (parent, notEmptyVal) => {
    let nodelist = parent.querySelectorAll("input[name],select[name],textarea[name]");
    let json = {};
    for (var i = 0, len = nodelist.length; i < len; i++) {
      let item = nodelist[i];
      if (notEmptyVal == true && item.value.length == 0)
        continue;
      // 如果json中已经添加了这个属性(这里是防止相同name值,如果发现则变数组)
      if (json.hasOwnProperty(item.name)) {
        if (json instanceof Array)// 如果这个属性是数组
        {
          json[item.name].push(item.value);// 往后加入值
        }
        else {
          json[item.name] = [json[item.name]];// 不是数组说明该元素当前有一个值,将其变数组并置此值于其中
          json[item.name].push(item.value);// 然后往后加入新值
        }
      }
      else {
        json[item.name] = item.value;// 加入键值对
      }
    };
    return json;
  };
})(window);