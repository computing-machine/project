
//upload required module
var express = require("express");
var multer = require('multer');
var morgan = require("morgan");
var bodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;
var methodOverride = require("method-override");
var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var app = express();

//configration of modules
var dbUrl = "mongodb://localhost:27017/salesmodule";
app.use(express.static(__dirname + "/public"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({"extended":'false'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/+json'}));
app.use(methodOverride());
var upload = multer({dest:__dirname+"/public/uploads"});


//upload test file
app.get("/", function(req, res) {
    res.sendFile(__dirname+'/public/test.html');
 });

//register a form 
app.post('/registerProducts',upload.any(),function(req,res,next){
    if(req.files){
        req.files.forEach(function(file){
            var filename = (new Date).valueOf()+"-"+file.originalname;
            fs.rename(file.path,'./public/images/'+filename,function(err){
                if(err){
                    throw err;
                }//if
                else{
                    MongoClient.connect(dbUrl,function(err,db){
                        if(err) throw err;
                        var dbo = db.db("salesmodule");
                        var doc = {
                            'proname' : req.body.name,
                            'image' : filename,
                            'price' : parseInt(req.body.price),
                            'subcatId_fk':parseInt(req.body.subcategory),
                            'unitId_fk':parseInt(req.body.unit),
                            'sizeId_fk':parseInt(req.body.size),
                        };
                        var value = dbo.collection('Item').insert(doc,function(err,result){
                            db.close();
                            if(err){
                                throw err;
                            }
                            else{
                                
                                res.json(result);
                            }
                            
                        });
                    });
                }//else
            });//rename a file
        })
    }//if
   
});// end of register form 

// seach a form 

app.get('/searchbypro/',function(err,res){
    res.end('');
});

//search by category
app.get('/searchbycategory/:id',function(req,res){
    MongoClient.connect(dbUrl,function(err,db){
        if(err) throw err;
        var dbo = db.db("salesmodule");
        var id = req.params.id;
        catID = parseInt(id);
        //dbo.collection('Subcategory').aggregate([{$lookup:{from:'Category',localField:'catId_fk',foreignField:'_id',as:'subcat'}},{$lookup:{from:'Item',localField:'_id',foreignField:'subcatId_fk',as:'prosub'}},{$match:{'catId_fk':catID}},{$project:{prosub:1}}]).toArray(function(err,result){
            dbo.collection('Category').aggregate([{$lookup:{from:'Subcategory',localField:'_id',
             foreignField:'catId_fk',as:'subcat'}},{$unwind:{path:'$subcat',preserveNullAndEmptyArrays:true}},
             {$lookup:{from:'Item',localField:'subcat._id',foreignField:'subcatId_fk',as:'prosub'}},
             {$unwind:{ path: "$prosub", preserveNullAndEmptyArrays: true }},{$match:{_id:catID}},{$project:{prosub:1}}]).toArray(function(err,result){
            if(err){
                throw err;
                db.close();
            } 
            else if(result.length==0){
                res.json('');
                db.close();
            }
            else{
                res.json(result);
                db.close();
            }
        });
    });
});



// search by product name
app.get('/searchbypro/:name',function(req,res){
    MongoClient.connect(dbUrl,function(err,db){
        if(err) throw err;
        var dbo = db.db('salesmodule');
        dbo.collection('Subcategory').aggregate([{$lookup:{from:'Item',localField:'_id',
            foreignField:'subcatId_fk',as:'prosub'}},
            {$unwind:{path: "$prosub", preserveNullAndEmptyArrays: true }},
            {$match:{'prosub.proname':{$regex:req.params.name,$options:'i'}}}]).toArray(function(err,result){
            if(err){
                throw err;
                db.close();
            }
            else if(result.length==0){
                res.json('');
                db.close();
            }
            else{
                //console.log(res);
                res.json(result);
                db.close();
            }

        });
    });
});

//search by proname and catId
app.get('/searchbyproandcatid/:catId/:proname',function(req,res){
    MongoClient.connect(dbUrl,function(err,db){
        if(err) throw err;
        var dbo = db.db('salesmodule');
        var catID = parseInt(req.params.catId);
        dbo.collection('Subcategory').aggregate([{$lookup:{from:'Category',localField:'catId_fk',
        foreignField:'_id',as:'subcat'}},
        {$lookup:{from:'Item',localField:'_id',foreignField:'subcatId_fk',as:'prosub'}},
        {$unwind:{path:'$prosub',preserveNullAndEmptyArrays:true}},
        {$match:{'catId_fk':catID,'prosub.proname':{$regex:req.params.proname,$options:'i'}}},
        {$project:{prosub:1}}]).toArray(function(err,result){
            if(err){
                throw err;
                db.close();
                console.log('err');
            } 

            else if(result.length==0){
                res.json('');
                db.close();
            }
            else{
                res.json(result);
                db.close();
            }
        });
    });
});

//search by productname , category and subcategory

app.get('/searchbyproandcatidandsubcatid/:catId/:subcatId/:proname',function(req,res){
    MongoClient.connect(dbUrl,function(err,db){
        if(err) throw err;
        var dbo = db.db('salesmodule');
        var catID = parseInt(req.params.catId);
        var subcatId = parseInt(req.params.subcatId);
        dbo.collection('Subcategory').aggregate([{$lookup:{from:'Category',localField:'catId_fk',
        foreignField:'_id',as:'subcat'}},{$unwind:{path:'$subcat',preserveNullAndEmptyArrays:true}},
        {$lookup:{from:'Item',localField:'_id',foreignField:'subcatId_fk',as:'prosub'}},
        {$unwind:{path:'$prosub',preserveNullAndEmptyArrays:true}},
        {$match:{'subcat._id':catID,'_id':subcatId,'prosub.proname':{$regex:req.params.proname,$options:'i'}}}]).toArray(function(err,result){
            if(err){
                throw err;
                db.close();
                console.log('err');
            } 

            else if(result.length==0){
                res.json('');
                db.close();
            }
            else{
                res.json(result);
                db.close();
            }
        });
    });
});


//search by subcategory and category
app.get('/searchbysubandcat/:catid/:subcatid',function(req,res){
    MongoClient.connect(dbUrl,function(err,db){
        if(err) throw err;
        var dbo = db.db("salesmodule");
        var catid = parseInt(req.params.catid);
        var subcatid = parseInt(req.params.subcatid);
            dbo.collection('Subcategory').aggregate([{$lookup:{from:'Category',localField:'catId_fk',foreignField:'_id',as:'subcat'}},
            {$unwind:{path:'$subcat',preserveNullAndEmptyArrays:true}},
            {$lookup:{from:'Item',localField:'_id',foreignField:'subcatId_fk',as:'prosub'}},
            {$unwind:{path:'$prosub',preserveNullAndEmptyArrays:true}},
            {$match:{'subcat._id':catid,_id:subcatid}}]).toArray(function(err,result){
            if(err){
                throw err;
                db.close();
                console.log('err');
            } 

            else if(result.length==0){
                res.json('');
                db.close();
                console.log('Nothing is returned');
            }
            else{
                //console.log(res);
                res.json(result);
                db.close();
            }
        });
    });
});

//get all categories
app.get('/category',function(req,res){
    MongoClient.connect(dbUrl,function(err,db){
        if(err){
            throw err;
        }//if
        else{
            var dbo = db.db('salesmodule');
            dbo.collection('Category').find().toArray(function(err,result){
                if(err){
                    throw err;
                }//if
                else if(result.length==0){
                    res.json("");
                }
                else{
                    res.json(result);
                    db.close();
                }
            });
          
        }//else
    });//mongoClient
});//get category

//get all units
app.get('/unit',function(req,res){
    MongoClient.connect(dbUrl,function(err,db){
        if(err){
            throw err;
        }//if
        else{
            var dbo = db.db('salesmodule');
            dbo.collection('Unit').find().toArray(function(err,result){
                if(err){
                    throw err;
                }//if
                else if(result.length==0){
                    res.json("");
                }
                else{
                    res.json(result);
                    db.close();
                }
            });
          
        }//else
    });//mongoClient
});//get all units


//get all sizes
app.get('/size',function(req,res){
    MongoClient.connect(dbUrl,function(err,db){
        if(err){
            throw err;
        }//if
        else{
            var dbo = db.db('salesmodule');
            dbo.collection('Size').find().toArray(function(err,result){
                if(err){
                    throw err;
                }//if
                else if(result.length==0){
                    res.json("");
                }
                else{
                    res.json(result);
                    db.close();
                }
            });
          
        }//else
    });//mongoClient
});//get all sizes


//get all subcategories by giving catId
app.get('/getsubcat/:catId',function(req,res){
    MongoClient.connect(dbUrl,function(err,db){
        if(err){
            throw err;
        }//if
        else{
            var dbo = db.db('salesmodule');
            var id = parseInt(req.params.catId);
            dbo.collection('Subcategory').find({catId_fk:id}).toArray(function(err,result){
                if(err){
                    throw err;
                }//if
                else if(result.length==0){
                    res.json("");
                }
                else{
                    res.json(result);
                    db.close();
                }
            });
          
        }//else
    });//mongoClient
});//get category



app.listen(8080);
console.log("app is listening");



/*
class person{

    //constructor
    constructor(name,id){
        this.name =name;
        this.id = id;
    }//constructor

    set fullname(name){
        this.name = name
    }//setname

    set setid(id){
        this.id = id;
    }//setId

    get getfullname(){
        return this.name;
    }//getname

    get getid(){
        return id;
    }

}//person class

class student extends person{
    constructor(name,id,gpa){
        super(name,id);
        this.gpa = gpa;
    }//cos
    
    get studentInfo(){
        return this.name +  " " + this.id + " " + this.gpa + " ";
    }//getstudent

}//student

const p1 = new person("marium",13);
const s1 = new student("marium",10,3.4);
console.log(s1.studentInfo);

*/



