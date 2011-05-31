describe("Ajax", function(){
  var User;
    
  beforeEach(function(){
    User = Spine.Model.setup("User", ["first", "last"]);
    User.extend(Spine.Model.Ajax);
  });
  
  it("can send POST on create", function(){
    spyOn(jQuery, "ajax");
    
    User.create({first: "Hans", last: "Zimmer", id: "IDD"});
    
    var args = jQuery.ajax.mostRecentCall.args[0];
    var success = args.success, error = args.error;

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'POST', 
      contentType:  'application/json', 
      dataType:     'json', 
      data:         '{"first":"Hans","last":"Zimmer","id":"IDD"}', 
      url:          '/users', 
      processData:  false,
      serial:       'spine',
      success:      success,
      error:        error
    });
  });
  
  it("can send PUT on update", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    
    spyOn(jQuery, "ajax");
    
    User.first().updateAttributes({first: "John2", last: "Williams2"});
    
    var args = jQuery.ajax.mostRecentCall.args[0];
    var success = args.success, error = args.error;

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'PUT', 
      contentType:  'application/json', 
      dataType:     'json', 
      data:         '{"first":"John2","last":"Williams2","id":"IDD"}', 
      url:          '/users/IDD', 
      processData:  false,
      serial:      'spine',
      success:      success,
      error:        error
    });
  });
  
  it("can send DELETE on destroy", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    
    spyOn(jQuery, "ajax");
    
    User.first().destroy();
    
    var args = jQuery.ajax.mostRecentCall.args[0];
    var error = args.error;

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:        'DELETE', 
      contentType: 'application/json', 
      dataType:    'json', 
      url :        '/users/IDD', 
      data:        {},
      error:       error,
      serial:      'spine'
    });
  });
  
  it("can update record after PUT/POST", function(){
    spyOn(jQuery, "ajax");
    
    User.create({first: "Hans", last: "Zimmer", id: "IDD"});
    
    var args    = jQuery.ajax.mostRecentCall.args[0];
    var success = args.success;
    
    var newAtts = {first: "Hans2", last: "Zimmer2", id: "IDD"};
    
    success(newAtts);
    
    expect(User.first().attributes()).toEqual(newAtts);
  });

  it("can change record ID after PUT/POST", function(){
    spyOn(jQuery, "ajax");
    
    User.create({id: "IDD"});
    
    var args    = jQuery.ajax.mostRecentCall.args[0];
    var success = args.success;
    
    var newAtts = {id: "IDD2"};
    
    success(newAtts);
    expect(User.first().id).toEqual("IDD2");
    expect(User.records["IDD2"]).toEqual(User.first());
  });  
});