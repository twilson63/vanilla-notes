(function (window) {
  var _dbName = null
  const _listeners = {
    error: [],
    change: [],
    complete: []
  }

  var _docs = [] //_getData()

  function _makeid() {
    var text = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length))

    return text
  }

  function _generateRev (old) {
    if (!old) { old = '0-unknown' }
    return parseInt(old.split('-')[0], 10) + 1 + '-' + _makeid()
  }

  function _getData() {
    return JSON.parse(window.localStorage.getItem(_dbName) || "[]")
  }

  function _setData() {
    window.localStorage.setItem(_dbName, JSON.stringify(_docs))
  }

  function _addListener(ev, fn) {
    _listeners[ev].push(fn)
  }

  function changes (options) {
    setTimeout(_ => {
      _docs = _getData()
      console.log(_docs)
      _docs.map(doc => {
        _listeners.change.map(fn => fn({doc: doc}))
      })
    }
    , 0)

    return {
      on: (ev, fn) => _addListener(ev, fn)
    }
  }


  function _delete (doc) {
    var old = get(doc._id)
    old._deleted = true
  }

  function post (doc) {
    doc._id = _makeid()
    doc._rev = _generateRev()
    _docs.push(doc)
    _setData()
    _listeners.change.map(fn => fn({doc: doc}))
  }

  function put (doc) {
    _delete(doc)
    doc._rev = _generateRev(doc._rev)
    _docs.push(doc)
    _setData()
    _listeners.change.map(fn => fn({doc: doc}))
  }

  function remove (doc) {
    _delete(doc)
    _listeners.change.map(fn => fn({doc: null}))
  }

  function get(id) {
    const results = _docs.filter(doc => doc._id === id)
    if (!results) { return null }
    return results[0]
  }

  function query(fn) {
    return _docs
      .filter(doc => !doc._deleted)
      .map(fn)
  }

  window.StorageDB = function (name) {
    _dbName = name
    return {
      changes: changes,
      query: query,
      put: put,
      post: post,
      remove: remove
    }
  }
}(window))
