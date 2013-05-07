Spine  = @Spine or require('spine')
$      = Spine.$
Model  = Spine.Model

DefaultMigration = (db, versionChangeEvent) ->
  db.createObjectStore @dbMetadata.objectStoreName,
    keyPath: @dbMetadata.primaryKey
    autoIncrement: @dbMetadata.autoIncrement

DbMetadata = (options) ->
  @name            = options.name
  @version         = options.version
  @primaryKey      = options.primaryKey
  @autoIncrement   = options.autoIncrement
  @objectStoreName = options.objectStoreName
  #                  version : migration function
  @migrations      = 1: DefaultMigration
  
doMigration = (modelContext, db, versionChangeEvent) ->
  migration = modelContext.dbMetadata.migrations[db.version]
  migration and migration.call(modelContext, db, versionChangeEvent)

class Base
  extended: ->
    @dbMetadata = new DbMetadata(
      name: "default"
      version: 1
      primaryKey: "id"
      autoIncrement: true
      objectStoreName: @className
    )

  connect: (callback) ->
    dbRequest = indexedDB.open(@dbMetadata.name, @dbMetadata.version)
    that = this
    dbRequest.onsuccess = (e) ->
      db = @result
      # rack for onupgradeneeded for webkit implementations
      if parseFloat(db.version) isnt that.dbMetadata.version
        versionRequest = db.setVersion(that.dbMetadata.version)
        versionRequest.onsuccess = (e) ->
          doMigration that, db, null
          # processs just after migration call
          callback.call that, db
          db.close()
      else
        # process normally
        callback.call that, db
        db.close()
    dbRequest.onupgradeneeded = (evt) ->
      doMigration that, @result, evt
    dbRequest.onerror = ->
      console.log "Error while creating dbRequest"

class Collection extends Base
  constructor: (@model) ->
  
  fetch: ->
    @connect (db) ->
      objectStore = db.transaction(@dbMetadata.objectStoreName).objectStore(@dbMetadata.objectStoreName)
      that = this
      # use the optimized form provided by gecko
      if (objectStore.getAll)
        objectStore.getAll().onsuccess = (event) ->
          that.refresh(@result)
          console.log('Fetched all data')
      else
        objectStore.openCursor().onsuccess = (event) ->
          cursor = event.target.result
          if cursor
            that.refresh(cursor.value)
            cursor.continue()
          else
            console.log('Fetched all data')

class Singleton extends Base
  constructor: (@record) ->
    @model = @record.constructor
  
  create: (record, options) ->
    @connect (db) ->
      transaction = db.transaction(@dbMetadata.objectStoreName,IDBTransaction.READ_WRITE)
      transaction.oncomplete = ->
        console.log('Transaction complete')
      store = transaction.objectStore(@dbMetadata.objectStoreName)
      oldId = record.__proto__.id
      # forces the id to be an autoincrement
      if @dbMetadata.autoIncrement
        delete record.__proto__.id
      # spine put the data on __proto__ but objectStore does not save the data on prototype chain
      writeRequest = store.add(record.__proto__)
      writeRequest.onsuccess = (e) ->
        if oldId isnt e.target.result 
          id = e.target.result
          records = record.constructor.records
          records[id] = records[oldId]
          delete records[oldId]
        console.log('Data created')
      writeRequest.onerror = (e) ->
        console.log("Error while creating")
      
  destroy: (record, options) ->
    @connect (db) ->
      request = db.transaction(@dbMetadata.objectStoreName, IDBTransaction.READ_WRITE)
        .objectStore(@dbMetadata.objectStoreName)
        .delete(record.id)
      request.onsuccess = (e) -> console.log('Data removed')
      request.onerror = -> console.log("Error while removing")

  update: (record, options) ->
    @connect (db) ->
      transaction = db.transaction(@dbMetadata.objectStoreName,IDBTransaction.READ_WRITE)
      transaction.oncomplete = -> console.log('Transaction complete')
      store = transaction.objectStore(@dbMetadata.objectStoreName)
      # spined put the data on __proto__ but objectStore do not save the data on prototype chain
      writeRequest = store.put(record.__proto__)
      writeRequest.onsuccess = (e) -> console.log('Data updated')
      writeRequest.onerror = (e) -> console.log("Error while updating")

Include =
  indexedDb: -> new Singleton(this)

Extend =
  indexedDb: -> new Collection(this)

Spine.Model.IndexedDb =
  extended: ->
    @change @indexedDbChange
    @fetch @indexedDbFetch
    @extend Extend
    @include Include
  
  indexedDbFetch: ->
    @indexedDb.fetch()
  
  indexedDbChange: (record, type, options = {}) ->
    return if options.indexedDb is false
    record.indexedDb()[type] options

module?.exports = Spine.Model.IndexedDb
