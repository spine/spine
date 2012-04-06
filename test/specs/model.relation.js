describe("Model.Relation", function(){
  var Album;
  var Photo;

  beforeEach(function(){
    Album = Spine.Model.setup("Album", ["name"]);
    Photo = Spine.Model.setup("Photo", ["name"]);
  });

  it("should honour manyToMany associations", function(){
    var Viewer = Spine.Model.setup("Viewer", ["name"]);
    Album.manyToMany("viewers", Viewer);

    var album = Album.create();
    var album2 = Album.create();
        
    expect( album.viewers() ).toBeTruthy();
    expect( album2.viewers() ).toBeTruthy();
    expect( album.viewers().all() ).toEqual([]);
    expect( album2.viewers().all() ).toEqual([]);

    album.viewers().create({name: "First Friend"});
    album2.viewers().add(album.viewers().first());

    expect( album.viewers() ).toBeTruthy();
    expect( album2.viewers() ).toBeTruthy();
    expect( album.viewers().first().id ).toBe( album2.viewers().first().id );
    expect( album.viewers().all().length ).toEqual(1);
    expect( album2.viewers().all().length ).toEqual(1);

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

    expect( photo.album() ).toBeTruthy();
    expect( photo.album().name ).toBe("First Album");
  });
});

  it("should load nested Singleton record", function(){
    Album.hasOne("photo", Photo);
    Photo.belongsTo("album", Album);

    var album = new Album();
    album.load({id: "1", name: "Beautiful album",
                photo: {id: "2", name: "Beautiful photo", album_id: "1"}});

    expect( album.photo() ).toBeTruthy();
    expect( album.photo().name ).toBe("Beautiful photo");
  });

  it("should load nested Collection records", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = new Album();
    album.load({
                id: "1", name: "Beautiful album",
                photos: [{id: "1", name: "Beautiful photo 1", album_id: "1"},
                         {id: "2", name: "Beautiful photo 2", album_id: "1"}]
               });

    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all().length ).toBe(2);
    expect( album.photos().first().name ).toBe("Beautiful photo 1");
    expect( album.photos().last().name ).toBe("Beautiful photo 2");
  });
});
>>>>>>> 956f192037fefa57a280b910477f7f4d6d3e792f
