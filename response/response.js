'use strict';angular.module('myApp').config(['$stateProvider',function($stateProvider){$stateProvider.state('root',{url:'',abstract:true,views:{'header':{templateUrl:'components/partials/header.html',controller:'headerController'}}});}]).config(function($qProvider){$qProvider.errorOnUnhandledRejections(false)}).config(['uiGmapGoogleMapApiProvider',function(GoogleMapApiProviders){GoogleMapApiProviders.configure({china:true});}]).controller('headerController',['$scope','authFact','$state','$stateParams',function($scope,authFact,$state,$stateParams){$scope.login=authFact.isAuthenticated();$scope.phoneAuth=authFact.isPhoneAuthenticated();$scope.authenticate=function(){$("#myModal").modal();var uiConfig={callbacks:{signInSuccess:function(currentUser){authFact.buildPhoneCookies(currentUser);$("#myModal").modal('hide');setTimeout(function(){$state.transitionTo($state.current,$stateParams,{reload:true,inherit:false,notify:true});},1000);return false;},uiShown:function(){}},credentialHelper:firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,queryParameterForWidgetMode:'mode',signInFlow:'popup',signInOptions:[{provider:firebase.auth.PhoneAuthProvider.PROVIDER_ID,defaultCountry:'PK'}]};var ui=new firebaseui.auth.AuthUI(firebase.auth());ui.start('#firebaseui-auth-container',uiConfig);}
$scope.disauthenticate=function(){authFact.disauthenticate();$state.transitionTo($state.current,$stateParams,{reload:true,inherit:false,notify:true});}
$('.nav a').on('click',function(){$('.btn-navbar').click();$('.navbar-toggle').click()});$('#mySidenav a ').on('click',function(){$('.closebtn').click();});}]);angular.module('myApp').factory('authFact',['$cookies','$state','$http','$location','APP_URL',function($cookies,$state,$http,$location,APP_URL){var authFact={};var authKey='JWT';var today=new Date();var expiresValue=new Date(today);expiresValue.setMinutes(today.getMinutes()+300);authFact.setAccessToken=function(accessToken){localStorage.setItem(authKey,accessToken);};authFact.getAccessToken=function(){authFact.authToken=localStorage.getItem(authKey);return authFact.authToken;};authFact.setUserObj=function(userObj){$cookies.put('emails',userObj.email,{'expires':expiresValue});$cookies.put('user_ids',userObj.user_id,{'expires':expiresValue});}
authFact.setUserPhoneObj=function(userObj){$cookies.put('phoneNumber',userObj.phone,{'expires':expiresValue});$cookies.put('phone_id',userObj.uid,{'expires':expiresValue});}
authFact.getUserEmail=function(){var userObj=$cookies.get('emails');if(userObj)
return userObj;};authFact.setLocation=function(locat){$cookies.put('locations',locat,{'expires':expiresValue});}
authFact.getLocation=function(){var locat=$cookies.get('locations');if(locat)
return JSON.parse(locat);else
return{lat:false,lng:false};};authFact.getPhoneId=function(){return $cookies.get('phone_id');};authFact.getPhoneNum=function(){return $cookies.get('phoneNumber');};authFact.getRandomId=function(){return $cookies.get('keys');};authFact.getUserId=function(){var userId=$cookies.get('user_ids');if(userId)
return userId;};authFact.navigateToHome=function(){$state.go('dashboard');};authFact.buildCookies=function(data){var userObj={};userObj.user_id=data.uid;userObj.email=data.email;authFact.setUserObj(userObj);authFact.setAccessToken(data.access_token);}
authFact.buildPhoneCookies=function(data){var userObj={};userObj.uid=data.uid;userObj.phone=data.phoneNumber;authFact.setUserPhoneObj(userObj);authFact.setAccessToken(data.refreshToken);}
authFact.destroyCookies=function(){localStorage.removeItem(authKey);$cookies.remove('emails');$cookies.remove('user_ids');};authFact.disauthenticate=function(){localStorage.removeItem(authKey);$cookies.remove('phone_id');$cookies.remove('phoneNumber');};authFact.Authenticate=function(){var access_token=localStorage.getItem(authKey);var myId=$cookies.get('user_ids');if(!access_token||!myId){$state.go('root.login');}}
authFact.isAuthenticated=function(){var access_token=localStorage.getItem(authKey);var myId=$cookies.get('user_ids');if(!access_token||!myId){return false;}
else
return true;}
authFact.isPhoneAuthenticated=function(){var access_token=localStorage.getItem(authKey);var myId=$cookies.get('phone_id');var phoneNumber=$cookies.get('phoneNumber');if(!access_token||!myId||!phoneNumber){return false;}
else
return true;}
authFact.randomString=function(){var text=$cookies.get('keys');var uid=$cookies.get('phone_id');if(!text&&!uid){text='';var possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";for(var i=0;i<5;i++){text+=possible.charAt(Math.floor(Math.random()*possible.length));}
$cookies.put('keys',text);}
else if(uid){text=uid;}
return text;}
authFact.saveInfo=function(key,value){$cookies.put(key,value,{'expires':expiresValue});}
authFact.getInfo=function(key){$cookies.get(key);}
return authFact;}])
angular.module('myApp').service('authService',['$http','APP_URL',function($http,APP_URL){var Auth={};Auth.login=function(email,password){var payload={email:email,password:password}
return $http.post(APP_URL+'signin',payload);}
Auth.register=function(payload){return $http.post(APP_URL+'register',payload);}
Auth.logout=function(){return $http.get(APP_URL+'logout');}
return Auth;}])
angular.module('myApp.client',[]).config(['$stateProvider',function($stateProvider){$stateProvider.state('root.book',{url:'/',views:{'container@':{templateUrl:'client/views/book.html',controller:'bookController'}}});}]).directive('googleplace',function(){return{require:'ngModel',link:function(scope,element,attrs,model){var options={types:[]};scope.gPlace=new google.maps.places.Autocomplete(element[0],options);google.maps.event.addListener(scope.gPlace,'place_changed',function(){scope.$apply(function(){model.$setViewValue(element.val());});});}};}).controller('bookController',['$scope','$state','reverseGeocode','authFact','$compile','$stateParams','SOCKET_URL',function($scope,$state,reverseGeocode,authFact,$compile,$stateParams,SOCKET_URL){$scope.phoneAuth=authFact.isPhoneAuthenticated();var location=authFact.getLocation();$scope.accepted={level:null,id:null}
$scope.markers=[]
$scope.moptions={icon:'../components/images/taxi.svg'}
if(location.lat&&location.lng)
{setMap(location);}
else{setLocationMap();}
function setMap(obj)
{reverseGeocode.geocodePosition(obj.lat,obj.lng,function(address){$scope.map={control:{},center:{latitude:obj.lat,longitude:obj.lng},zoom:10};$scope.markerTemp={id:0,coords:{latitude:obj.lat,longitude:obj.lng},window:{title:address,}}
$scope.$apply();});}
function setLocationMap()
{var options={enableHighAccuracy:true};navigator.geolocation.getCurrentPosition(function(pos){$scope.position=new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);var temp=JSON.stringify($scope.position);var obj=JSON.parse(temp);authFact.setLocation(temp);location=obj;setMap(obj);},function(error){alert('Unable to get location: '+error.message);},options);}
var ws_scheme=window.location.protocol=="https:"?"wss":"ws";var ws=new ReconnectingWebSocket(ws_scheme+SOCKET_URL+"/booking/"+authFact.randomString());$scope.options={scrollwheel:false};$scope.getCurrentLocation=function(){$scope.map.zoom=15;$scope.marker=$scope.markerTemp;$scope.pickup=$scope.markerTemp.window.title;}
$scope.disablePannel=function(){$scope.directions={showList:false}}
ws.onopen=function(data)
{if(authFact.isPhoneAuthenticated()){var payload={action:'bookings',data:{key:authFact.getPhoneId()}}
ws.send(JSON.stringify(payload));}};function convertUTCDateToLocalDate(date){var newDate=new Date(date.getTime()+date.getTimezoneOffset()*60*1000);var offset=date.getTimezoneOffset()/ 60;var hours=date.getHours();newDate.setHours(hours-offset);return newDate;}
ws.onmessage=function(evt){var temp=evt.data;var obj=JSON.parse(temp);if(obj.action=='created'){if(authFact.isPhoneAuthenticated()){$scope.bookSelect=obj.booking;$('.colap1').collapse("hide");$scope.openBooking(obj.booking);}
else
{$scope.expId=obj.booking;$scope.markBtn=true;$scope.$apply();var date=new Date();var myDate=new Date(date.getTime()+15*60000);$('#'+$scope.expId).countdown(myDate).on('update.countdown',function(event){$(this).html('<br> Expires in '+event.strftime('%M:%S'));}).on('finish.countdown',function(event){if(authFact.randomString()){var payload={action:'expired',data:{key:authFact.randomString(),bookingId:$scope.expId}}
ws.send(JSON.stringify(payload));}});}}
else if(obj.action=='getBooking'){var booking=JSON.parse(obj.booking);var templevel=booking.level;var tempid=booking.id;if(templevel==='Waiting'){$scope.markBtn=true;}
else{$scope.markBtn=false;}
if($scope.accepted.id!=tempid){$scope.accepted.level=templevel;$scope.accepted.id=tempid;}
else if($scope.accepted!=templevel&&$scope.accepted.id==tempid){if(templevel==='Onway'){$('#'+tempid).countdown('stop');$scope.accepted.level=templevel;$scope.accepted.id=tempid;for(var i=0;i<$scope.myBookings.length;i++){if($scope.myBookings[i].id==tempid){$scope.myBookings[i].level=templevel;$scope.$apply();break;}}}}
var quotes=JSON.parse(obj.quotes);$scope.pickup=booking.pickup;$scope.destination=booking.destination;$scope.markers=[];$scope.getLatestDirection();for(var i=0;i<quotes.length;i++){var objs=quotes[i];var mark={id:objs.location.uid,taxi:objs.location.taxi,booking:objs.booking,coords:{latitude:objs.location.latitude,longitude:objs.location.longitude},window:{title:objs.quote,icon:'https://cdn2.iconfinder.com/data/icons/location-map-simplicity/512/taxi-512.png'}}
$scope.markers.push(mark);}
$scope.$apply();$scope.myInterval=setTimeout(function(){$scope.openBooking(booking.id);},15000);}
else if(obj.action=='quote'){var notFound=true;var arr=$scope.markers;for(var i=0;i<arr.length;i++){if(arr[i].id==obj.location.uid){notFound=false;}}
if(notFound){var mark={id:obj.location.uid,taxi:obj.taxi,booking:obj.booking,coords:{latitude:obj.location.lat,longitude:obj.location.lng},window:{title:obj.quote,icon:'https://cdn2.iconfinder.com/data/icons/location-map-simplicity/512/taxi-512.png'}}
$scope.markers.push(mark);$scope.$apply();}}
else if(obj.action=='location'){var arr=$scope.markers;for(var i=0;i<arr.length;i++){if(arr[i].id==obj.location.uid){arr[i].coords.latitude=obj.location.lat;arr[i].coords.longitude=obj.location.lng;}}
$scope.markers=arr;$scope.$apply();}
else if(obj.action=='bookings'){$scope.myBookings=JSON.parse(obj.bookings);$scope.$apply();for(var i=0;i<$scope.myBookings.length;i++){var dt=$scope.myBookings[i].timestamp;var date=convertUTCDateToLocalDate(new Date(dt));var myDate=new Date(date.getTime()+15*60000);if($scope.myBookings[i].level==='Waiting'||$scope.myBookings[i].level==='Confirming'){$('#'+$scope.myBookings[i].id).countdown(myDate).on('update.countdown',function(event){$(this).html(event.strftime('%M:%S'));}).on('finish.countdown',function(event){var myid=$(this).attr('id')
if(authFact.isPhoneAuthenticated()){var payload={action:'expired',data:{key:authFact.getPhoneId(),bookingId:myid}}
ws.send(JSON.stringify(payload));}
else if(!authFact.isPhoneAuthenticated()){$state.transitionTo($state.current,$stateParams,{reload:true,inherit:false,notify:true});}});}}}
else if(obj.action=='delete'){$state.transitionTo($state.current,$stateParams,{reload:true,inherit:false,notify:true});}
else if(obj.action=='confirming'){$scope.openBooking(obj.booking);}};$scope.newValue=function(value){$scope.myTaxi=value;}
$scope.remove=function(myid){if(authFact.isPhoneAuthenticated()){var payload={action:'expired',data:{key:authFact.getPhoneId(),bookingId:myid}}
ws.send(JSON.stringify(payload));}}
$scope.openBooking=function(myid){if($scope.bookSelect!=myid)
{clearTimeout($scope.myInterval);}
if(authFact.isPhoneAuthenticated()){$scope.bookSelect=myid;var payload={action:'getBooking',data:{key:authFact.getPhoneId(),bookingId:myid}}
ws.send(JSON.stringify(payload));}}
var directionsDisplay=new google.maps.DirectionsRenderer();var directionsService=new google.maps.DirectionsService();var geocoder=new google.maps.Geocoder();$scope.getDirections=function(){var admin_area1,admin_area2,country='';var geocoder=new google.maps.Geocoder();var position=new google.maps.LatLng(location.lat,location.lng);geocoder.geocode({'latLng':position},function(results,status){if(status==google.maps.GeocoderStatus.OK){if(results[0]){for(var i=0;i<results[0].address_components.length;i++){for(var b=0;b<results[0].address_components[i].types.length;b++){if(results[0].address_components[i].types[b]=="administrative_area_level_1"){admin_area1=results[0].address_components[i].long_name;break;}
else if(results[0].address_components[i].types[b]=="administrative_area_level_2"){admin_area2=results[0].address_components[i].long_name;break;}
else if(results[0].address_components[i].types[b]=="country"){country=results[0].address_components[i].long_name;break;}}}
if(admin_area1){authFact.saveInfo('administrative_area_level_1',admin_area1);}
else{admin_area1=authFact.getInfo('administrative_area_level_1');if(!admin_area1){admin_area1='undefined'}}
if(admin_area2){authFact.saveInfo('administrative_area_level_2',admin_area2);}
else{admin_area2=authFact.getInfo('administrative_area_level_2');if(!admin_area2){admin_area2='undefined'}}
if(country){authFact.saveInfo('country',country);}
else{country=authFact.getInfo('country');if(!country){country='undefined'}}}}});$scope.directions={origin:$scope.pickup,destination:$scope.destination,}
var request={origin:$scope.directions.origin,destination:$scope.directions.destination,travelMode:google.maps.DirectionsTravelMode.DRIVING};directionsService.route(request,function(response,status){if(status===google.maps.DirectionsStatus.OK){directionsDisplay.setDirections(response);directionsDisplay.setMap($scope.map.control.getGMap());$scope.marker=null;var payload={action:'create',data:{key:authFact.randomString(),pickup:$scope.pickup,destination:$scope.destination,area1:admin_area1,area2:admin_area2,country:country,lat:location.lat,lng:location.lng}}
ws.send(JSON.stringify(payload));if(authFact.isPhoneAuthenticated()){$scope.bookSelect=null;clearTimeout($scope.myInterval);$scope.markers=[];var payload={action:'bookings',data:{key:authFact.getPhoneId()}}
ws.send(JSON.stringify(payload));}}
else{alert('Please try again');}});}
$scope.getLatestDirection=function(){$scope.directions={origin:$scope.pickup,destination:$scope.destination,}
var request={origin:$scope.directions.origin,destination:$scope.directions.destination,travelMode:google.maps.DirectionsTravelMode.DRIVING};directionsService.route(request,function(response,status){if(status===google.maps.DirectionsStatus.OK){directionsDisplay.setDirections(response);directionsDisplay.setMap($scope.map.control.getGMap());$scope.marker=null;}
else{alert('Please try again');}});}
$scope.authenticate=function(event){var bid=event.currentTarget.classList[3]
if(authFact.isPhoneAuthenticated()){var payload={action:'select',data:{key:authFact.getPhoneId(),bid:bid,phone:authFact.getPhoneNum()}}
ws.send(JSON.stringify(payload));if(authFact.isPhoneAuthenticated()){$scope.bookSelect=null;clearTimeout($scope.myInterval);$scope.markers=[];var payload={action:'bookings',data:{key:authFact.getPhoneId()}}
ws.send(JSON.stringify(payload));}}
else{$scope.login(bid);}}
$scope.login=function(bid){$("#myModal").modal();var uiConfig={callbacks:{signInSuccess:function(currentUser){authFact.buildPhoneCookies(currentUser);$("#myModal").modal('hide');$("#in").addClass("ng-hide");$("#out").removeClass("ng-hide")
var payload={action:'select',data:{key:authFact.getPhoneId(),bid:bid,phone:authFact.getPhoneNum()}}
ws.send(JSON.stringify(payload));if(authFact.isPhoneAuthenticated()){$scope.phoneAuth=true;$(".panexp").remove();$('.colap1').collapse("hide");$scope.bookSelect=null;clearTimeout($scope.myInterval);$scope.markers=[];var payload={action:'bookings',data:{key:authFact.getPhoneId()}}
ws.send(JSON.stringify(payload));}
return false;},uiShown:function(){}},credentialHelper:firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,queryParameterForWidgetMode:'mode',signInFlow:'popup',signInOptions:[{provider:firebase.auth.PhoneAuthProvider.PROVIDER_ID,defaultCountry:'PK'}]};var ui=new firebaseui.auth.AuthUI(firebase.auth());ui.start('#firebaseui-auth-container',uiConfig);}}]);angular.module('myApp.driver',[]).config(['$stateProvider',function($stateProvider){$stateProvider.state('root.dashboard',{url:'/dashboard',views:{'container@':{templateUrl:'driver/views/dashboard.html',controller:'dashboardController',}},onEnter:function(authFact){authFact.Authenticate();}}).state('root.login',{url:'/login',views:{'container@':{templateUrl:'driver/views/login.html',controller:'loginController',}}}).state('root.register',{url:'/register',views:{'container@':{templateUrl:'driver/views/register.html',controller:'registerController',}}}).state('root.logout',{url:'/logout',views:{'container@':{controller:'logoutController',}}});}]).controller('dashboardController',['$scope',function($scope){}]).controller('loginController',['$scope','$state','authService','authFact',function($scope,$state,authService,authFact){$scope.loginSubmit=function(){authService.login($scope.myemail,$scope.password).then(function(data){if(data.data.errors){var errors=data.data.errors;$('.alert').remove();for(var i in errors){$('<div class="alert alert-danger alert-dismissable fade in"> <a class="close" data-dismiss="alert" aria-label="close">×</a><strong>'+errors[i]+'</strong></div>').insertBefore($('#login_form'));break;}
window.setTimeout(function(){$(".alert").fadeTo(500,0).slideUp(500,function(){$(this).remove();});},2000);}
else{authFact.buildCookies(data.data);$state.go('root.dashboard',{},{reload:true});}})}}]).controller('registerController',['$scope','$state','authService','authFact',function($scope,$state,authService,authFact){$scope.registerSubmit=function(){var payload={email:$scope.email,password1:$scope.password}
authService.register(payload).then(function(data){if(data.data.errors){var errors=data.data.errors;$('.alert').remove();for(var i in errors){$('<div class="alert alert-danger alert-dismissable fade in"> <a class="close" data-dismiss="alert" aria-label="close">×</a><strong>'+errors[i]+'</strong></div>').insertBefore($('#register_form'));break;}
window.setTimeout(function(){$(".alert").fadeTo(500,0).slideUp(500,function(){$(this).remove();});},2000);}
else{authFact.buildCookies(data.data);$state.go('root.dashboard',{},{reload:true});}})}}]).controller('logoutController',['$scope','authService','authFact','$state',function($scope,authService,authFact,$state){authService.logout().then(function(data){authFact.destroyCookies();$state.go('root.login',{},{reload:true});});}]);
