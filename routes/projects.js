/* DAVID XU */
var io  = require('socket.io');
var models = require('../models/models.js');
var mongoose = require('mongoose');
var _ = require('underscore');
var ObjectId = mongoose.Types.ObjectId;
var sio;

var clients = {};

exports.start_sockets = function(server){
  sio = io.listen(server);
  console.log('Server started!');
  //Configure the socket.io connection settings. 
  //See http://socket.io/
  sio.configure(function (){
    sio.set('log level', 0);
    sio.set('authorization', function (handshakeData, callback) {
      callback(null, true); // error first callback style 
    });
  });
  sio.sockets.on('connection', function (client) {
    console.log('connected bro');

    client.on('openProject', function(data){
      clients[data.project_id] = clients[data.project_id] || [] ;
      clients[data.project_id].push(client);
      console.log('hi');
      console.log(clients);
    });

    client.on('saveAction', function(data){
      console.log('inside socket save action');
      console.log(data);
      saveActionHelper(data);
    });

    client.on('chat', function(data){
      // should check for server validation here
      console.log(data.message);
      console.log(data.username);
      sio.sockets.emit('chat', data);
    });

  });
};

//TODO: REFACTOR

exports.view_json = function(req, res) {

  var example = {
    action : "add",
    type : "method", 
    info : {
    }
  };

  var proj_id = req.params.id;
  console.log(proj_id);
    models.Project.findById(proj_id, function(err, project_result){
      if(err) {
        console.log('ERROR: project search failed');
        console.log(err);
        return;
      } 
      else {
        project_result = project_result.toObject();
        // add correct id to js object
        project_result.id = project_result._id.toString();
        console.log(project_result);
        console.log(project_result.id);
        models.Interface.find({ project: project_result._id }, function(err, interface_result){
          if(err) {
            console.log('ERROR: interface search failed');
            console.log(err);
            return;
          } 
          else {
              console.log('insideeeeeeeeeeeeeeeeeeeeeee');
              console.log(interface_result);
            if(interface_result.length > 0) {
              // convert from mongodbobject to js object
              _.each(interface_result, function(interface_item){
                console.log('over here')
                console.log(interface_item)
                interface_item = interface_item.toObject();
                interface_item.id = interface_item._id.toString();
                // convert from mongodbobject to js object
                project_result.interfaces = project_result.interfaces || [];



              models.Class.find({ project: project_result._id }, function(err, class_result){
                if(err) {
                  console.log('ERROR: class search failed');
                  console.log(err);
                  return;
                } 
                else {
                  if(class_result.length > 0) {
                    _.each(class_result, function(class_item){
                      // convert from mongodbobject to js object
                      class_item = class_item.toObject();
                      class_item.id = class_item._id.toString();
                      // convert mongodbobject to js object
                      project_result.classes = project_result.classes || [];
                      models.Method.find({ parent: class_item._id}, function(err, method_result){
                        if(err){
                          console.log('ERROR: method search failed');
                          console.log(err);
                          return;     
                        } 
                        else {
                          _.each(method_result, function(method_item){
                            method_item = method_item.toObject();
                            method_item.id = method_item._id;
                            class_item.methods = class_item.methods || [];
                            class_item.methods.push(method_item);
                          });
                          

                          // finally finished compiling entire json
                          console.log('finally finished compiling');
                          console.log("%j",project_result);
                          if(!res.headerSent)
                            res.json(project_result);
                          return;



                        }
                      });
                      project_result.classes.push(class_item);
                    });
                  }
                  else {
                    // else no classes, no interfaces, render json
                    if(!res.headerSent)
                      res.json(project_result);
                    return;

                  }
                }
              });

                project_result.interfaces.push(interface_item);
              });
            }            
            else {
              models.Class.find({ project: project_result._id }, function(err, class_result){
                if(err) {
                  console.log('ERROR: class search failed');
                  console.log(err);
                  return;
                } 
                else {
                  if(class_result.length > 0) {
                    _.each(class_result, function(class_item){
                      // convert from mongodbobject to js object
                      class_item = class_item.toObject();
                      class_item.id = class_item._id.toString();
                      // convert mongodbobject to js object
                      project_result.classes = project_result.classes || [];
                      models.Method.find({ parent: class_item._id}, function(err, method_result){
                        if(err){
                          console.log('ERROR: method search failed');
                          console.log(err);
                          return;     
                        } 
                        else {
                          _.each(method_result, function(method_item){
                            method_item = method_item.toObject();
                            method_item.id = method_item._id;
                            class_item.methods = class_item.methods || [];
                            class_item.methods.push(method_item);
                          });
                          

                          // finally finished compiling entire json
                          console.log('finally finished compiling');
                          console.log("%j",project_result);
                          if(!res.headerSent)
                            res.json(project_result);
                          return;



                        }
                      });
                      project_result.classes.push(class_item);
                    });
                  }
                  else {
                    // else no classes, no interfaces, render json
                    if(!res.headerSent)
                      res.json(project_result);
                    return;

                  }
                }
              });
            }
          }
        });

      }
    }); 
};

exports.view = function(req, res) {
  var proj_id = req.params.id;
  console.log(proj_id);
    models.Project.findById(proj_id, function(err, project_result){
      if(err) {
        console.log('ERROR: project search failed');
        console.log(err);
        return;
      } 
      else {
        project_result = project_result.toObject();
        // add correct id to js object
        project_result.id = project_result._id.toString();
        console.log(project_result);
        console.log(project_result.id);
        models.Interface.find({ project: project_result._id }, function(err, interface_result){
          if(err) {
            console.log('ERROR: interface search failed');
            console.log(err);
            return;
          } 
          else {
            // convert from mongodbobject to js object
            _.each(interface_result, function(interface_item){
              console.log('over here')
              console.log(interface_item)
              interface_item = interface_item.toObject();
              interface_item.id = interface_item._id.toString();
              // convert from mongodbobject to js object
              project_result.interfaces = project_result.interfaces || [];
              models.Method.find({ parent: interface_item._id}, function(err, method_result){
                // convert from mongodbobject to js object
                if(err){
                  console.log('ERROR: method search failed');
                  console.log(err);
                  return;     
                } 
                else {
                  _.each(method_result, function(method_item){
                    method_item = method_item.toObject();
                    method_item.id = method_item._id;
                    interface_item.methods = interface_item.methods || [];
                    interface_item.methods.push(method_item);
                  });
                }
              });
              project_result.interfaces.push(interface_item);
            });
            
                
            models.Class.find({ project: project_result._id }, function(err, class_result){
              if(err) {
                console.log('ERROR: class search failed');
                console.log(err);
                return;
              } 
              else {
                _.each(class_result, function(class_item){

                  // convert from mongodbobject to js object
                  class_item = class_item.toObject();
                  class_item.id = class_item._id.toString();
                  // convert mongodbobject to js object
                  project_result.classes = project_result.classes || [];
                  models.Method.find({ parent: class_item._id}, function(err, method_result){
                    if(err){
                      console.log('ERROR: method search failed');
                      console.log(err);
                      return;     
                    } 
                    else {
                      _.each(method_result, function(method_item){
                        method_item = method_item.toObject();
                        method_item.id = method_item._id;
                        class_item.methods = class_item.methods || [];
                        class_item.methods.push(method_item);
                        console.log('IM IN HEREREEEEEE')
                      });
                    }
                  });
                  project_result.classes.push(class_item);
                });
                // finally finished compiling entire json
                console.log('finally finished compiling');
                console.log("%j",project_result);
                res.render('project', { description: project_result.description, name: project_result.name, project_id: project_result.id});
              }
            });
          }
        });

      }
    }); 
};

function show_json(type, res) {
  var model;
  switch(type)
  {
    case 'project': model = models.Project;
                    break;
    case 'method': model = models.Method;
                    break;
    case 'interface': model = models.Interface;
                    break;
    case 'class': model = models.Class;
                    break;
  }
  model.find().exec(
    function (err, results) {

      if(!res.headerSent)
        res.json(results);
    } 
  );
}
exports.project_json = function(req, res){
  show_json('project', res);
};

exports.class_json = function(req, res){
  show_json('class', res);
};

exports.method_json = function(req, res){
  show_json('method', res);
};

exports.project_methods = function(req, res){
  console.log('here')
  get_project_methods(req.params.id, res);
};

function get_project_methods(id, res){
  console.log(id)
  models.Method.find({ project: id }, function(err,data){
    res.json(data);
  });
}

exports.interface_json = function(req, res){
  show_json('interface', res);
};


exports.new_project = function(req, res){
  res.render('new', {});
};

exports.create_project = function(req,res) {
  create_helper('project', req.body, res);
};

exports.create_class = function(req,res) {
  create_helper('class', req.body, res);
};

exports.create_interface = function(req,res) {
  create_helper('interface', req.body, res);
};
exports.create_method = function(req,res) {
  create_helper('method', req.body, res);
};
exports.save = function(req,res) {
  

  // var example = {
  //   action : "modify",
  //   type : "method",
  //   info : {
  //     id : "15adfdsf",
  //     name : "asdfasdf"
  //   },
  //   project_id : "1244asdf"
  //   needed for emitting
  // }; 
  saveActionHelper(req.body, res);
};

function saveActionHelper(info, res){

  switch(info.action)
  {
    case 'add': create_helper(info.type, info, res);
                break;
    case 'modify': change_helper(info.type, info, 'modify');
                   break;
    case 'delete': change_helper(info.type, info, 'delete');
                   break;
    case 'lock': break; // doesn't do anything atm
    case 'unlock': break;
  }
}

function create_helper(type, obj, res){
  var new_obj;
  var info = obj.info;
  //will not have info if creating project
  if(info){
    var hex_string = info.project || info.parent;
    // create from hexstring
    if(hex_string) hex_string = ObjectId.fromString(hex_string);

  } else info = obj;
  switch(type)
  {
    case 'project': info.classes = info.classes || [];
                    info.interfaces = info.interfaces || [];
                    console.log('INSDIE');
                    console.log(info);
                    new_obj = new models.Project(info);
                    break;
    case 'method':  info.project = obj.project_id;
                    new_obj = new models.Method(info);
                    break;
    case 'interface': new_obj = new models.Interface(info);
                    break;
    case 'class': new_obj = new models.Class(info);
                    break;
  }

  new_obj.save(function(err){
    if(err) {
      console.log('ERROR: creating ' + type + ' failed');
      console.log(err);
      return;
    } 
    else {
      console.log('creating' + type);
      if(type === 'project')
        res.redirect('/projects/' + new_obj.id.toString());
      else {
        // re create obj, add ID
        obj.info.id = new_obj.id.toString();
        for(var index in clients[obj.project_id]) {
          clients[obj.project_id][index].emit('update', obj);
        }
      }
    }
  });
}

function change_helper(type, obj, change_type){
  var mod_obj;
  console.log(obj);
  console.log('hihi');
  var info = obj.info;
  var model; 
  // create from hexstring
  if(info) {
    var hex_string = info.project || info.parent;
    // create from hexstring
    if(hex_string) hex_string = ObjectId.fromString(hex_string);
  }

  switch(type)
  {
    case 'project': model = models.Project;
                    break;
    case 'method': model = models.Method;
                    break;
    case 'interface': model = models.Interface;
                    break;
    case 'class': model = models.Class;
                    break;
  }


  if(change_type === 'modify') {
    delete info._id;
    model.findByIdAndUpdate(info.id, info, {}, function(err){
          if(err) {
            console.log('ERROR: modifying ' + type + ' failed');
            console.log(err);
            return;
          } 
          else {
            console.log(mod_obj);
            console.log('modifying' + type);
            // re create obj, add ID
            for(var index in clients[obj.project_id]) {
              clients[obj.project_id][index].emit('update', obj);
            }
          }
        });
  }
  else if(change_type === 'delete') {
    console.log(info)
    model.findByIdAndRemove(info.id, {}, function(err, product){
      if(err) {
        console.log('ERROR: removing ' + type + 'failed.');
        console.log(err);
      }
      else {
        console.log('deleting' + type);
      }
    });
  }
}

