// 每次请求 取消延迟的方法
function debounce(fn) {
  let timeout = null;

  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, arguments)
    } , 500);
  }
  
}

// n 秒内只执行一次
function throttle(fn) {
  let canRun = true;
  return function() {
    if (!canRun) {
      return
    }

    canRun = false;

  timeout = setTimeout(() => {
      fn.apply(this, arguments)
      canRun = true;
    } , 500);
  }
}

function changePosition(node) {
  let res = [];
  if (node.next) {
    res.push(node.value);
    // check the level
    if (node.level % 2 === 0) {
      changePosition(node.right);
      changePosition(node.left);
    } else {
      changePosition(node.left);
      changePosition(node.right);
    }
  }
}