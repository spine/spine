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
    
    expect( photo.album() ).toBeTruthy();
    expect( photo.album().name ).toBe("First Album");
  });
  
  it("should honour belongsTo with hasOne associations", function(){
    Album.hasOne("photo", Photo);
    Photo.belongsTo("album", Album);
    
    expect(Photo.attributes).toEqual(["name", "album_id"]);
    
    var album = Album.create();
    var photo = Photo.create({name: "Sunset picture"});

		album.photo(photo);

    expect(photo.album_id).toBe(album.id);

		// Sadly we need to currently save here :(
		photo.save(); 
    
    expect( album.photo() ).toBeTruthy();
    expect( album.photo().name ).toBe("Sunset picture");
  });
});
