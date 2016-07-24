# Vanilla Notes

This is a simple journal application.

In this project, we will build a simple journal application, that has the 
ability to list our articles and create new articles. The learning objectives 
are the following;

* Data Structures
  - Array
  - Object
* DOM
  * querySelector
  * getElementById
  * insertBefore
  * addEventListener
* Tiny Modules


## Getting started

The first thing we want to do is create a form that will take our new article 
and add it to the database.

> What is a database?

A database is a container that holds data, in our case articles that we want 
to retrieve later. Most databases have a way to create containers, 
put things into containers and get things out of containers.

- create
- put
- get

We are going to store and retrieve articles or documents. 

This is called a document database. There are several types 
of databases, but for this project we only need to think about
document storage databases.

## Setup form

Our form will look something like this:

```
<section class="four columns">
  <header>
    <h2>New Article</h2>
  </header>
  <form>
    <div class="row">
      <label for="title">Title</label>
      <input class="u-full-width" type="text" id="title">
    </div>
    <div class="row">
      <label for="body">Article</label>
      <textarea class="u-full-width" id="body" id="body"></textarea>
    </div>
    <div class="row">
      <button class="button-primary u-pull-right">Submit</button>
    </div>
  </form>
</section>
```

We will wrap in a section and create three rows, a title row, a body row, 
and a button row. We will add some classes to decorate the elements with a 
nice presentation look and feel.

We will use the id attributes of both the input and textarea elements as unique 
identifiers for the form.

## Capture form data

Now that we have the form setup, we want to use `javascript` to add an event
listener, so that when the form is submitted, we can grab the data from the form
and add to the database.

This code looks like this:

> browser.js

```
var form = document.querySelector('form')
form.addEventListener('submit', onSubmit)

function onSubmit (event) {
  event.preventDefault()
  var title = document.getElementById('title').value
  var body = document.getElementById('body').value
  var doc = {
    title: title,
    body: body
  }
  // TODO: save document to database
  console.log(doc)
  // reset form 
  event.target.reset()
  
}
```

On the first line we use the `querySelector` function to return the form element 
to our application, then we call `addEventListener` to register the submit function.

> Now we could have just added an attribute to the form `onsubmit` and attached 
the listener function that way, but this is a bad practice and can result in to 
problems. By wrapping the app in a function wrapper which is called an IFFE, it 
will protect our functions from being modified or defined else where.

In the onSubmit function we immediately ask the event to prevent default 
functionality, which is to try to make a call to a remote server. We don't want
to do this, we want to handle the processing on the client. Next we get the 
title and body values using the `getElementById` function. This function explicitly 
finds and element by its id.

We can refactor this into a simple utility function:

> value.js

```
(function () {
  window.value = function (id) {
   return document.getElementById(id).value
  }
} ())
```

Then we can add this utility in our index.html as a script

```
  <body>
    ...
    <script src="value.js"></script>
    <script src="browser.js"></script>
  </body>
```

We want to make sure we include it above the browser.js file 

Lastly, we can modify our `onSubmit` function to take advantage of this refactor.

```

function onSubmit (event) {
  event.preventDefault()
  var doc = {
    title: value('title'),
    body: value('body')
  }
  
  // TODO: save document to database
  console.log(doc)
  // reset form 
  event.target.reset()
  
}

```

## Store data in the database 

For this step we are going to use a simple database that uses localstorage in the
browser.

> What is localstorage? LocalStorage is a HTML 5 api that enables the application
to persist data locally in there browser. It has two functions: `setItem` and 
`getItem`, the `setItem` function takes a string for the key name and a string
for a value. The getItem function takes a string for the key name and returns a
string for the value.

We will use a library called `sdb.js` this library mimics a popular database api.
called `pouchdb`. We need two functions from the db, `changes` and `post`, the
changes function return an `on` function, this function enables us to add a listener 
to the db, so when new documents are added we will know to add them to our list 
display. The `post` function, adds a document to the database.

So in our `onSubmit` form, we need to add the `db.post` function.

```
function onSubmit (event) {
  event.preventDefault()
  var doc = {
    title: value('title'),
    body: value('body')
  }

  db.post(doc)  

  // reset form 
  event.target.reset()
  
}

```

This will post our document to the database, now we need to create a way to list 
articles. 

## DB Changes Feed

Using the database changes feed, we can get notified to when a new article is 
posted and then we can paint the article to the screen.

We can access the changes feed using the `db.changes` function.

```
db.changes({ include_docs: true, live: true })
  .on('change', listItem)

function listItem (doc) {
  // create article view
  // add to articles view
}
```

Now everytime a new article is added the listItem document will be called.

## Update the screen with a new article

We need to create a new section in our html document:

```
<section id="articles" class="eight columns">
  <header>
    <h2>Articles</h2>
  </header>
</section>
```

Notice in this section we provided an `id` for the section called articles, we 
will use that id to reference the point we want to add articles as they are created.

In the `browser.js` file we need to create elements for an article and append them 
to the articles section.

To build the article view using the dom directly, you may see some code like this:

```
var titleElement = document.createElement('h3')
titleElement.innerText = doc.title
var headerElement = document.createElement('header')
headerElement.appendChild(titleElement)
var bodyElement = document.createElement('div')
bodyElement.innerText = doc.body

var article = document.createElement('article')
article.appendChild(headerElement)
article.appendChild(bodyElement)

var articles = document.getElementById('articles')
articles.appendChild(article)
```

But you can see this is a lot of redundant code and we can create a very simple 
abstraction to make this much easier to read and manage.

We will create a little helper function called `h` this function will make it easier
to create and nest elements.

```
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
```

This function will take a string for a tag and either an array or a string for 
content. This enables us to nest functions.

So instead of createElement then innerText, we can compose a view, like this:

```
h('article', [
  h('header', [
    h('h3', doc.title)
  ]),
  h('div', doc.body)
])
```

We can further refine the view by creating alias methods:

```
const article = content => h('article', content)
const header = content => h('header', content)
const h3 = content => h('h3', content)
const div = content => h('div', content)
```

by creating these alias methods our view can event look nicer:

```
article([
  header([
    h3(doc.title)
  ]),
  div(doc.body)
])
```



```



Our `listItem` function will look like this:

```
function listItem (chg) {
  var el = article([
      header([
        h3(chg.doc.title)
      ]),
      div(chg.doc.body)
    ])
    
  var parent = document.getElementById('articles')
  var header = parent.querySelector('header')
  parent.insertBefore(el, header.nextSibling)
}
```

Now that we have a nice view, lets abstract out the append process into a simple 
append function.

> append.js

```
(function () {
  window.append = function (id, el) {
    var parent = document.getElementById(id)
    var header = parent.querySelector('header')
    parent.insertBefore(el, header.nextSibling)
  }
}())
```

By creating a generic append function, we can reduce the listItem function into 
a clearly nested set of functions that are declarative.

When an items is added, I want to list the item by appending the new article to
the articles section. The article has a header and a h3 for the title as well as 
a div for the body.


```
function listItem (chg) {
  append('articles', 
    article([
      header([
        h3(chg.doc.title)
      ]),
      div(chg.doc.body)
    ])
  )
}
```

Putting it all together:

> browser.js

```
(function () {
  const article = content => h('article', content)
  const header = content => h('header', content)
  const h3 = content => h('h3', content)
  const div = content => h('div', content)

  db.changes({ include_docs: true, live: true })
    .on('change', listItem)
  
  document.querySelector('form').addEventListener('submit', onSubmit)
  
  function onSubmit (event) {
    event.preventDefault()
    db.post({
      title: value('title'),
      body: value('body')
    })
    event.target.reset()
  }
  
  function listItem (chg) {
    append('articles', 
      article([
        header([
          h3(chg.doc.title)
        ]),
        div(chg.doc.body)
      ])
    )
  }
}())
```

> prepend.js

```
(function () {
  window.prepend = function (id, el) {
    const parent = document.getElementById(id)
    parent.insertBefore(el, parent.firstChild.nextSibling)
  }
} ())
```

> hscript.js

```
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
} ())
```

> value.js

```
(function () {
  window.value = function (id) {
    return document.getElementById(id).value
  }
} ())
```

> sdb.js

```
(function (window) {
  function makeid() {
    var text = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length))

    return text
  }

  function get() {
    return JSON.parse(window.localStorage.getItem('db') || "[]")
  }

  var docs = get()
  
  function set() {
    window.localStorage.setItem('db', JSON.stringify(docs))
  }
  
  var listeners = {
    error: [],
    change: [],
    complete: []
  }
  
  function addListener(ev, fn) {
    listeners[ev].push(fn)
  }
  
  function changes (options) {
    setTimeout(_ => 
      docs.map(doc => {
        listeners.change.map(fn => fn({doc: doc}))  
      })
    , 0)
    
    return {
      on: (ev, fn) => addListener(ev, fn)
    }
  }
  
  function _generateRev (old) {
    if (!old) { old = '0-unknown' }
    return parseInt(old.split('-')[0], 10) + 1 + '-' + makeid()
  }

  function _delete (doc) {
    var old = get(doc._id)
    old._deleted = true
  }

  function post (doc) {
    doc._id = makeid()
    doc._rev = _generateRev()
    docs.push(doc)
    set()
    listeners.change.map(fn => fn({doc: doc}))
  }
  
  function put (doc) {
    _delete(doc)
    doc._rev = _generateRev(doc._rev) 
    docs.push(doc)
    set()
    listeners.change.map(fn => fn({doc: doc}))
  }
  
  function remove (doc) {
    _delete(doc)
    listeners.change.map(fn => fn({doc: null}))
  }
  
  function get(id) {
    var results = docs.filter(doc => doc._id === id)
    if (!results) { return null }
    return results[0]
  }
  
  function query(fn) {
    return docs
      .filter(doc => !doc._deleted)
      .map(fn)
  }
  
  window.db = {
    changes: changes,
    query: query,
    put: put,
    post: post,
    remove: remove
  }  
}(window))

```
