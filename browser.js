// connect to databas
var db = PouchDB('http://server.pouchcloud.com/tom')
// list articles
db.changes({ include_docs: true, live: true })
  .on('change', listItem)
// listen to form submit
document.querySelector('form').addEventListener('submit', onSubmit)

// add article
// reset form

function onSubmit (event) {
  event.preventDefault()
  var article = {}
  article.title = document.getElementById('title').value
  article.body = document.getElementById('body').value
  event.target.reset()
  db.post(article)

}


function listItem (chg) {
  var title = document.createElement('h3')
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
