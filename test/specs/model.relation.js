describe("Model.Relation", function(){
  var Album;
  var Photo;

  beforeEach(function(){
    Album = Spine.Model.setup("Album", ["name"]);
    Photo = Spine.Model.setup("Photo", ["name"]);
  });

  it("should honour hasMany associations", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create();

    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all() ).toEqual([]);

    album.photos().create({name: "First Photo"});

    expect( Photo.first() ).toBeTruthy();
    expect( Photo.first().name ).toBe("First Photo");
    expect( Photo.first().album_id ).toBe(album.id);
  });

  it("should honour belongsTo associations", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    expect(Photo.attributes).toEqual(["name", "album_id"]);

    var album = Album.create({name: "First Album"});
    var photo = Photo.create({album: album});
    var photo2 = Photo.create({});

    expect( photo.album() ).toBeTruthy();
    expect( photo2.album() ).toBeFalsy();
    expect( photo.album().name ).toBe("First Album");
  });

  it("can count Collection records", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      name: "Beautiful album",
      photos: [{
        id: "1",
        name: "Beautiful photo 1"
      },
      {
        id: "2",
        name: "Beautiful photo 2"
      }],
      id: "1"
    });

    expect( album.photos().count ).toBeDefined()
    expect( album.photos().count() ).toEqual(2)
  });

  it("can find records by ID within a Collection", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create();
    var photo = album.photos().create({ id: "1" });
    Photo.create({ id: "2" });

    expect( album.photos().find("1").id ).toEqual(photo.id);
    expect( album.photos().find("2") ).toBeFalsy();
    expect( album.photos().find("wut?") ).toBeFalsy();
  });

  it("should associate an existing Singleton record", function(){
    Album.hasOne("photo", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      id: "1",
      name: "Beautiful album",
    });
    var photo = Photo.create({
      id: "2",
      name: "Beautiful photo"
    });

    album.photo(photo);

    expect( album.photo() ).toBeTruthy();
    expect( album.photo().album_id ).toBe("1");
    expect( album.photo().name ).toBe("Beautiful photo");
  });

  it("should create a new related Singleton record", function(){
    Album.hasOne("photo", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      name: "Beautiful album",
      photo: {
        name: "Beautiful photo"
      },
      id: "1"
    });

    expect( album.photo() ).toBeTruthy();
    expect( album.photo().album_id ).toBe("1");
    expect( album.photo().name ).toBe("Beautiful photo");
  });

  it("can create new parent and related Singleton record at once if UUIDs are enabled", function(){
    Album.uuid = function(){ return 'fc0942b0-956f-11e2-9c95-9b0af2c6635d' };
    Photo.uuid = function(){ return '2d08ad90-9572-11e2-9c95-9b0af2c6635d' };

    Album.hasOne("photo", Photo);
    Photo.belongsTo("album", Album);

    var album = new Album({
      name: "Beautiful album",
      photo: {
        name: "Beautiful photo"
      }
    });

    expect( album ).toBeTruthy();
    expect( album.id ).toEqual(Album.uuid());
    expect( album.photo() ).toBeTruthy();
    expect( album.photo().album_id ).toEqual(Album.uuid());
    expect( album.photo().name ).toBe("Beautiful photo");

    delete Album.uuid
    delete Photo.uuid
  });

  it("should associate existing Collection records", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      name: "Beautiful album",
      id: "1"
    });
    var photo1 = Photo.create({
      id: "1",
      name: "Beautiful photo 1"
    });
    var photo2 = Photo.create({
      id: "2",
      name: "Beautiful photo 2"
    });

    album.photos([ photo1, photo2 ]);

    expect( Photo.count() ).toBe(2);
    expect( album.photos() ).toBeTruthy();
    expect( album.photos().count() ).toBe(2);
    expect( album.photos().first().album_id ).toBe("1");
    expect( album.photos().last().album_id ).toBe("1");
    expect( album.photos().first().name ).toBe("Beautiful photo 1");
    expect( album.photos().last().name ).toBe("Beautiful photo 2");
  });

  it("can refresh Collection records without effecting unrelated model records", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      name: "Beautiful album",
      photos: [{
        id: "1",
        name: "This record should be removed"
      }],
      id: "2"
    });

    Photo.create({
	    id: "3",
	    name: "This record should NOT be removed"
    });

    expect( Photo.count() ).toBe(2);
    expect( album.photos().count() ).toBe(1);
    expect( album.photos().first().id ).toBe("1");

    var photo1 = {
      id: "4",
      name: "Beautiful photo 1"
    }
    var photo2 = {
      id: "5",
      name: "Beautiful photo 2"
    }

    album.photos([ photo1, photo2 ]);

    expect( Photo.count() ).toBe(3);
    expect( Photo.first().id ).toBe("3");
    expect( Photo.first().name ).toBe("This record should NOT be removed");
    expect( album.photos().count() ).toBe(2);
    expect( album.photos().first().album_id ).toBe("2");
    expect( album.photos().last().album_id ).toBe("2");
    expect( album.photos().first().name ).toBe("Beautiful photo 1");
    expect( album.photos().last().name ).toBe("Beautiful photo 2");
  });

  it("can add unassociated records to an existing Collection", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      photos: [{
        id: "1",
        name: "Beautiful photo 1"
      }],
      name: "Beautiful album",
      id: "1"
    });

    var photo2 = Photo.create({
      id: "2",
      name: "Beautiful photo 2"
    });

    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all().length ).toBe(1);

    album.photos().add(photo2);

    expect( album.photos().all().length ).toBe(2);
    expect( album.photos().first().album_id ).toBe("1");
    expect( album.photos().last().album_id ).toBe("1");
    expect( album.photos().first().name ).toBe("Beautiful photo 1");
    expect( album.photos().last().name ).toBe("Beautiful photo 2");
  });

  it("can remove records from a Collection", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      photos: [{
        id: "1",
        name: "Beautiful photo 1"
      }],
      name: "Beautiful album",
      id: "1"
    });

    var photo2 = Photo.create({
      id: "2",
      name: "Beautiful photo 2"
    });

    album.photos().add(photo2);

    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all().length ).toBe(2);
    expect( album.photos().last().name ).toBe("Beautiful photo 2");

    album.photos().remove(photo2);

    expect( album.photos().all().length ).toBe(1);
    expect( album.photos().last().name ).toBe("Beautiful photo 1");
  });

  it("can create new related Collection records", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      name: "Beautiful album",
      photos: [{
        id: "1",
        name: "Beautiful photo 1"
      },
      {
        id: "2",
        name: "Beautiful photo 2"
      }],
      id: "1"
    });

    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all().length ).toBe(2);
    expect( album.photos().first().album_id ).toBe("1");
    expect( album.photos().last().album_id ).toBe("1");
    expect( album.photos().first().name ).toBe("Beautiful photo 1");
    expect( album.photos().last().name ).toBe("Beautiful photo 2");
  });

  it("can create new parent and related Collection records at once if UUIDs are enabled", function(){
    Album.uuid = function(){ return 'fc0942b0-956f-11e2-9c95-9b0af2c6635d' };
    Photo.uuid = function(){ return '2d08ad90-9572-11e2-9c95-9b0af2c6635d' };

    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = new Album({
      name: "Beautiful album",
      photos: [{
        name: "Beautiful photo 1"
      },
      {
        id: "2",
        name: "Beautiful photo 2"
      }]
    });

    expect( album ).toBeTruthy();
    expect( album.id ).toEqual(Album.uuid());
    expect( album.photos().first() ).toBeTruthy();
    expect( album.photos().first().album_id ).toEqual(Album.uuid());
    expect( album.photos().first().name ).toBe("Beautiful photo 1");

    delete Album.uuid
    delete Photo.uuid
  });

});
