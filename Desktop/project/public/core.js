


var app = angular.module("angularModule",[]);

app.controller("mainController",function($scope,$http,someService,$window){

    //Global variables and function 
    $scope.GetFile = function(file){
        $scope.file = file; 
    }
    $scope.product = {};
    $scope.response = "";
   
    

    //register form 

    $scope.submit=function(){
      var formData = new FormData;

      //get input values 
      for(key in $scope.product){
        formData.append(key,$scope.product[key]);
      }
        //get selected values 
        var unit = $('#unit').val();
        var size = $('#size').val();
        var subcategory = $('#subcategory').val();

        formData.append('unit',unit);
        formData.append('size',size);
        formData.append('subcategory',subcategory);
        formData.append('image',$scope.file.files[0]);
        
     $http.post('/registerProducts',formData,{
         
         'transformRequest':angular.identity,
       'headers' : {'Content-Type':undefined},
     }).then(function(res){
         console.log(res.data);
        $scope.response ="Data is saved";
     }).catch(angular.noop);
     
    }//register a form 

   /* function getSelectedText(elementId) {
        var elt = document.getElementById(elementId);
    
        if (elt.selectedIndex == -1)
            return null;
    
        return elt.options[elt.selectedIndex].text;
    }*/

    $scope.getsubcategory = function(){
        var catId = $('#category').val();
        $scope.getSubcategory(catId);
    }//get subcategories

    $scope.getSubcategory = function(catId){
        $http.get('/getsubcat/'+catId).then(function(res){
            if(res.data.length > 0){
                $scope.subcategory = res.data;
            }
            else{
                $scope.subcategory = "";
            }
        }).catch(angular.noop);
     }//get subcategories

//end of register form 

    //init function 
    $scope.init = function(){
        $http.get('/category').then(function(res){
            if(res.data.length > 0){
                $scope.categories = res.data;
            }//if
            else{
                $scope.categories = "";
            }
        }).catch(angular.noop);//get all categories
            
        $http.get('/unit').then(function(res){
            if(res.data.length > 0){
                $scope.units = res.data;
            }//if
            else{
                $scope.units = "";
            }
        }).catch(angular.noop);//get all units

        $http.get('/size').then(function(res){
            if(res.data.length > 0){
                $scope.size = res.data;
            }//if
            else{
                $scope.size = "";
            }
        }).catch(angular.noop);//get all units

     };

     //...........................get products.....................
     $scope.getProducts = function(){
        $scope.path = "./images/";
        //variables
         var subcategoryoptval = $('#subcategories').val();
         var categoryoptval = $('#categories').val();
         var proname = $('#proname').val();
         //functions
         if((subcategoryoptval==0)&&( proname=="")){
            someService.searchbycategory(categoryoptval).then(function(res){
                $scope.products = res.data;
            }).catch(angular.noop);
            $scope.getSubcategories(categoryoptval);
         }//get products by category name

         else if((categoryoptval==0)&&(subcategoryoptval==0)){
            someService.searchbypro(proname).then(function(res){
               $scope.products = res.data;
            }).catch(angular.noop);
            $scope.subcategories = "";
            
         }//get products by products name
         else if((categoryoptval==0)&&(subcategoryoptval!=0)){
            $scope.subcategories = "";
         }//if category is 0 then make subcategory 0

         else if((subcategoryoptval!=0)&&(proname=="")){
             someService.searchbysubandcat(categoryoptval,subcategoryoptval).then(function(res){
                $scope.products = res.data;
             }).catch(angular.noop);
         }//search by categroy and subcategory

         else if((subcategoryoptval==0)&&(categoryoptval!=0)&&(proname!="")){
            someService.searchbyproandcat(categoryoptval,proname).then(function(res){
                $scope.products = res.data;
            }).catch(angular.noop);
            $scope.getSubcategories(categoryoptval);
         }//search by category and productname

         else if((subcategoryoptval!=0)&&(categoryoptval!=0)&&(proname!="")){
            someService.searchbyproandcatandsubcat(categoryoptval,subcategoryoptval,proname).then(function(res){
                $scope.products = res.data;
            }).catch(angular.noop);
         }//search by category and productname and subcategory

     };

     //getsubcategories
     $scope.getSubcategories = function(catId){
        $http.get('/getsubcat/'+catId).then(function(res){
            if(res.data.length > 0){
                $scope.subcategories = res.data;
            }
            else{
                $scope.subcategories = "";
            }
        }).catch(angular.noop);
     }//get subcategories



   
    //get products by searching products
    $scope.getProductsbyproname = function(){
        $scope.path = "./images/";
        var proname = ($('#proname').val());
        someService.searchbypro(proname).then(function(response){
            if(response.data.length > 0){
                $scope.imgsource2 = response.data;
                //console.log("get product by proname",response.data);
            }
            
            else{
               $scope.imgsource2 = "";
            }
        }).catch(angular.noop);
    }//get product by product name


});//end of controller


//services
   app.service('someService', ['$http', function($http){
        return {
            searchbycategory: function(keywords){
                return $http.get('/searchbycategory/'+ keywords);
            },

            searchbysubandcat: function(catvalue , subcatvalue){
                return $http.get('/searchbysubandcat/'+ catvalue+'/'+subcatvalue);
            },

            searchbypro: function(keywords){
                return $http.get('/searchbypro/'+ keywords);
            },

            searchbyproandcat: function(catId,proname){
                return $http.get('/searchbyproandcatid/'+catId+'/'+proname)
            },

            searchbyproandcatandsubcat: function(catId,subcatId,proname){
                return $http.get('/searchbyproandcatidandsubcatid/'+catId+'/'+subcatId+'/'+proname)
            },
        }
        
            
    }]);//service to get products by selecting categories


/*

app.filter('searchFor',function(){
    return function(item,scope){
        if((!scope.searchstring) && (!scope.searchbyphone)){
             var result = [];
            return "";
        };//both name and phoneNO fields are empty

        if((!scope.searchstring) && (scope.searchbyphone)){
            var result = [];
            angular.forEach(scope.items,function(value){
                //alert(value.phoneNo.indexOf(scope.searchbyphone));
                if(value.phoneNo.indexOf(scope.searchbyphone)!== -1){
                    result.push(value);
                }
            });
            return result;
        }//name field is empty

        if((scope.searchstring) && (!scope.searchbyphone)){
            var result = [];
            scope.searchstring = scope.searchstring.toLowerCase();
            angular.forEach(scope.items,function(value){
            if(value.name.toLowerCase().indexOf(scope.searchstring)!== -1){
                result.push(value);
            }
            //alert();
        });
        return result;
   
        }//phone field is empty

        if(scope.searchstring){
            scope.searchstring = scope.searchstring.toLowerCase();
            if(scope.searchbyphone){
                result = [];
                angular.forEach(scope.items,function(value){
                    if((value.phoneNo.indexOf(scope.searchbyphone)!== -1))
                    {
                        if(value.name.toLowerCase().indexOf(scope.searchstring)!==-1){
                            result.push(value);
                        }
                       
                    }//if
                });
                return result;

            }//searchbyphone
        }//searchbystring

    };
});
*/
