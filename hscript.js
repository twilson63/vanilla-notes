(function () {
  window.h = function (tag, content) {
    const el = document.createElement(tag)
    if (content) {
      content.map(c => 
        typeof c === 'string' ? el.innerText = c : el.appendChild(c)
      )
    }
    return el
  }
}())
