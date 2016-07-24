(function () {
  // list articles
  var sdb = StorageDB('journal2')
  sdb.changes({ include_docs: true, live: true })
    .on('change', listItem)
  // listen to form submit
  document.querySelector('form').addEventListener('submit', onSubmit)

  // add article
  // reset form

  function onSubmit (event) {
    event.preventDefault()
    var article = {
      title: value('title'),
      body: value('body')
    }
    event.target.reset()
    sdb.post(article)
  }

  function listItem (chg) {
    var article = h('article', [
      h('header', [
        h('h4', [chg.doc.title])
      ]),
      h('div', [chg.doc.body]),
      h('hr')
    ])

    prepend('articles', article)
  }

  /*
  function listItem (chg) {
    var title = document.createElement('h4')
    title.innerText = chg.doc.title
    var body = document.createElement('div')
    body.innerText = chg.doc.body

    var header = document.createElement('header')
    header.appendChild(title)

    var article = document.createElement('article')
    article.id = chg.doc._id
    article.appendChild(header)
    article.appendChild(body)

    var articles = document.getElementById('articles')

    articles.insertBefore(article, articles.querySelector('article'))
  }
  */
}())
