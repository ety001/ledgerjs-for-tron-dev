// 强制设置HTML语言属性为英语
// 这个脚本会在页面加载时立即执行，确保语言设置正确
(function() {
  'use strict';
  
  // 立即设置HTML lang属性
  if (typeof document !== 'undefined') {
    document.documentElement.lang = 'en';
    document.documentElement.setAttribute('lang', 'en');
    
    // 监听DOM变化，防止其他脚本修改lang属性
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
          if (document.documentElement.getAttribute('lang') !== 'en') {
            document.documentElement.lang = 'en';
            document.documentElement.setAttribute('lang', 'en');
          }
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });
  }
})();
