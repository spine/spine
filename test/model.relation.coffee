should = require 'should'
sinon  = require 'sinon'
zombie = require 'zombie'

describe "Model.Relation", ->
  $ = jQuery = undefined

  before (done) ->
    browser = new zombie.Browser()

    browser.visit("file://localhost#{__dirname}/index.html", ->
      global.document      ?= browser.document
      global.window        ?= browser.window
      global.window.jQuery ?= require('jQuery').create(window)

      global.Spine ?= require '../src/spine'
      require '../src/relation'
      $ = jQuery = Spine.$

      done()
    )

  after ->
    delete global[key] for key in ['document', 'window', 'Spine']

  Album = undefined
  Photo = undefined

  beforeEach ->
    Album = Spine.Model.setup("Album", ["name"])
    Photo = Spine.Model.setup("Photo", ["name"])


  it "should honour hasMany associations", ->
    Album.hasMany("photos", Photo)
    Photo.belongsTo("album", Album)

    album = Album.create()

    album.photos().should.be.ok
    album.photos().all().should.eql []

    album.photos().create({name: "First Photo"})

    Photo.first().should.be.ok
    Photo.first().name.should.equal "First Photo"
    Photo.first().album_id.should.equal album.id

  it "should honour belongsTo associations", ->
    Album.hasMany("photos", Photo)
    Photo.belongsTo("album", Album)

    Photo.attributes.should.eql ["name", "album_id"]

    album = Album.create({name: "First Album"})
    photo = Photo.create({album: album})

    photo.album().should.be.ok
    photo.album().name.should.equal "First Album"


  it "should load nested Singleton record", ->
    Album.hasOne("photo", Photo)
    Photo.belongsTo("album", Album)

    album = new Album
    album.load
      id: "1", name: "Beautiful album",
      photo:
        id: "2", name: "Beautiful photo", album_id: "1"

    album.photo().should.be.ok
    album.photo().name.should.equal "Beautiful photo"


  it "should load nested Collection records", ->
    Album.hasMany("photos", Photo)
    Photo.belongsTo("album", Album)

    album = new Album
    album.load
      id: "1", name: "Beautiful album",
      photos: [
        {id: "1", name: "Beautiful photo 1", album_id: "1"}
        {id: "2", name: "Beautiful photo 2", album_id: "1"}
      ]

    album.photos().should.be.ok
    album.photos().all().should.length 2
    album.photos().first().name.should.equal "Beautiful photo 1"
    album.photos().last().name.should.equal "Beautiful photo 2"