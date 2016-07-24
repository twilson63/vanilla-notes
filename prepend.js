(function () {
  window.prepend = function (id, el) {
    const parent = document.getElementById(id)
    parent.insertBefore(el, parent.querySelector('header').nextSibling)
  }
} ())
