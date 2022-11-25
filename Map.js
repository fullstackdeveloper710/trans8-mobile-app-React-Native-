import React, { Component } from 'react';
import { View, Text,TextInput, Image,ScrollView, SafeAreaView, NetInfo,Button, StyleSheet,Platform,Linking,Dimensions,TouchableOpacity,FlatList,ImageBackground,Modal,Animated,TouchableHighlight } from 'react-native';
import { Select } from 'native-base';
import { _retrieveWaypoints,image,_retrieveAddress,_retrieveWarehouse,_storeData,_retrieveData,_storeRouteApiStatus,_retrieveFulladdress,Loader,_retrieveRouteApiStatus,_retrieveUser,_showSuccessMessage, _storeNextPoint, _retrieveNextPoint,_showErrorMessage,_storeWaypoints,_storeAddress,_storeFulladdress } from 'assets';
// import { StackActions } from '@react-navigation/native';
import { getRoutes,markNumberToPackages,getUpdatedPoints,getPostalCode,getRouteApiStatus,delete_stop,safezone_warehouse_list, complete_my_route,save_skip_stop,update_last_point,getData  } from 'api';
import { AsyncStorage } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker, AnimatedRegion,PROVIDER_GOOGLE,Polyline } from "react-native-maps";
import Geolocation from '@react-native-community/geolocation';
import List from './List';
import PushNotification from "react-native-push-notification";

import getDirections from 'react-native-google-maps-directions' 

import 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';

navigator.geolocation = require('@react-native-community/geolocation');
const haversine = require('haversine');
 
import { showLocation } from 'react-native-map-link'
const { width, height } = Dimensions.get('window'); 
const ASPECT_RATIO = width / height;
 
  
const LATITUDE = 43.6038821;
const LONGITUDE = -79.5127419; 
const LATITUDE_DELTA = 0.1; 
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAeeswuHY3asdBd8afsdasdkR-4dFNfVFogyWyhNrTsosyu';
const WAYPOINT_LIMIT = 10;

class Map extends Component { 
  constructor(props){
    super(props);    
  
    this.state = {

      latitude: null,
      longitude: null,
      maplatitude: null,
      maplongitude: null,
      origin:null,
      destination:null,
      routeCoordinates: [],
      polyCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      points:[],
      FlatListItems:[],
      CustomRoutePoints:[],
      points2:null,
      showview:'list',
      warehouse:'',
      fulladdress:[],
      nextpoint:0,
      LATITUDE_DELTA : 0.1,
      LONGITUDE_DELTA : LATITUDE_DELTA * ASPECT_RATIO,
      currentpointstatus:true,
      bottomMargin:null,
      title:'',
      modalVisible:false,
      CustomRouteModal:false,
      popupfornewStop:false,
      modalDefault:false,
      deliveryModal:false,
      skipmodals:false,
      selectedfirst:'',
      selectedsecond:'',
      routecheck:true,
      skipcomment:'',
      commentVisible:false,
      totalDistance:'',
      totalDuration:'',
      totalDurationtime:'',
      drivername:'',
      skip_comment:'',
      date:'',
      currentAddress:'',
      isloading:false,
      curruntlistindex:'',
      currenttime:'',
       poupparcellist:[
          {address:'11 Morningside Ave, Toronto, ON M6S 1C1, Canada'},
          {address:'11 Morningside Ave, Toronto, ON M6S 1C1, Canada'},
          {address:'11 Morningside Ave, Toronto, ON M6S 1C1, Canada'},
          {address:'11 Morningside Ave, Toronto, ON M6S 1C1, Canada'},
          {address:'11 Morningside Ave, Toronto, ON M6S 1C1, Canada'}
      ],
      rescuelist:'no',
      rescue_strtingAddress:'',
      bounceValue: new Animated.Value(100),
      iconName: "caret-down", 
      ishidden:false,
      currentCoordinate:{},   
      safeZonStops:[],
      yardStop:{},
      yardStopToFulladdress:{},
      is_marking:true,
      route_distance:'',
      route_time:'',
      hide_route_option:false,
      last_point_lat:'',
      last_point_long:'',
      startlatitude:'44.467838',
      startlongitude:'-79.489261',
      rescuelatitude:'',
      rescuelongitude:'',
      polyCoordinatesRescue:[],
      rescueorigin:null,
      rescuedestination:null,
      fuelstations:[],
      fuelstationpopup:'',
      fuelstationCoordinate:{}
    }
    
}

componentDidMount = () => { 

  Geolocation.getCurrentPosition((position) => {

      this.setState({startlatitude:position.coords.latitude,startlongitude:position.coords.longitude});

    })

  safezone_warehouse_list().then((res) => {

    if(res.type == 1){
            
      this.setState({safeZonStops:res.data.safezone_warehouses});
    }
    else{
      _showErrorMessage(res.message);
    }
    
  })

  this.props.navigation.addListener('focus', () => {
      this.updateWaypoints();
      this.getFuelStations();
    });
  this.setState({popupfornewStop: false});
  // setTimeout(()=>this.setState({modalDefault: false}),2500)

  var date = new Date;
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  // return strTime;

 //Default Modal 
_retrieveData('default_popup').then((res) => {
    // if(res == null){
    //     this.setState({modalDefault:true});

    //     _storeData('default_popup','yes').then();
    //   }
    //   else{

    //       this.setState({modalDefault:false});
    //   } 
})

  _retrieveData('route_start_time').then((res) => {
      // console.log(res)

      if(res == null){
        this.setState({currenttime:strTime});

        _storeData('route_start_time',strTime).then();
      }
      else{

          this.setState({currenttime:res});
      }
  })

  _retrieveData('routecheck').then((res) => {

      // if(res == null){
      //   this.setState({routecheck:true});  
      // }
      // else{

      //     this.setState({routecheck:false});
      // }

  })

  _retrieveData('is_marking').then((res) => { 

      if(res != null){
        this.setState({is_marking:false});  
      }
      

  })

  _retrieveData('hide_route_option').then((res) => { 

      if(res != null){
        this.setState({hide_route_option:true});  
      }
      

  })

this.setState({currenttime:strTime});

     _retrieveData('is_rescue').then((res) => {
       // console.log(res)
          if(res == 'yes'){
            this.setState({rescuelist:res});
            Geolocation.getCurrentPosition( (position) => {
               
               getPostalCode(position.coords.latitude,position.coords.longitude).then((res) => {

               this.setState({rescue_strtingAddress:res.items[0].address.label});

               });

            })   

          }
        }); 

   const unsubscribe = this.props.navigation.addListener('tabPress', () => {
      // console.log('Refreshed!');

      this.updateWaypoints();
      this.getFuelStations();
    });

this.updateWaypoints();
this.getFuelStations();

  PushNotification.configure({
    
     onNotification:(notification) => {

        this.updateWaypoints();
    },

  }) 

_retrieveNextPoint().then((point) => {
  // console.log(point);
  if(point != null){
    this.setState({nextpoint:point})
  }
 
})            

setTimeout(()=>this.setState({statusBarHeight: 1}),500);

_retrieveUser().then((user) => {

    var userdata = JSON.parse(user);

    this.setState({drivername:userdata.userInfo.first_name+' '+userdata.userInfo.last_name,date:userdata.userInfo.date})
})

this.watchID = navigator.geolocation.watchPosition(

    position => {
      const { coordinate, routeCoordinates, distanceTravelled } =   this.state;
      const { latitude, longitude } = position.coords;
      // console.log(position.coords); 
      const newCoordinate = {
        latitude,
        longitude 
      };
      
       this.checkOnArrive(latitude, longitude);



     },
     error => console.log(error),
     { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000,distanceFilter:0 }
  );

// setInterval(() => {
//     this.checkforretailDrop();
//   }, 60000);


}
getFuelStations(){
//     getData('get_driver_app_setting').then((res)=>{
    
//     if(res.type == 1){
//      console.log(res.data.DriverAppSettingList[0].show_fuel_stations_on_map);
//       if(res.data.DriverAppSettingList[0].show_fuel_stations_on_map == "yes"){
//          getData('get_esso_fuel_stations').then((res) => {
//             if(res.type == 1){
              
//                 this.setState({fuelstations:res.data});
              
//             }
//             else{
//               _showErrorMessage(res.message);
//             }
           
//           }); 
//        }
//     }
//   else{
//       _showErrorMessage(res.message);
//     }
// }).catch(error => {
//            this.setState({isloading:false});
//              _showErrorMessage(error.message);
//    });
}
checkforretailDrop(){
     navigator.geolocation.getCurrentPosition(
              (position) => {
                // console.log(position.coords.latitude)

                getPostalCode(position.coords.latitude,position.coords.longitude).then((res) => {
                  // console.log(res.items[0].address.postalCode);
                })

              },
              (error) => console.warn(error.message),
              { enableHighAccuracy: true, timeout: 10000 }
            )
} 

 
checkOnArrive = (lat,long) => {

  if(this.state.nextpoint < this.state.points.length){

    const destinationltlg = {latitude:this.state.points[this.state.nextpoint].latitude,longitude:this.state.points[this.state.nextpoint].longitude}
 
    const start = {latitude: lat, longitude: long }
 
    const distance = Math.round(haversine(start,destinationltlg,  {unit: 'meter'}));
   
    if(distance < 30 && this.state.currentpointstatus == true){

        const address = this.getaddress(destinationltlg.latitude);
      
        this.setState({nextpoint:this.state.nextpoint+1,currentpointstatus:false,modalVisible:true,currentAddress:address}); 

        _storeNextPoint(this.state.nextpoint);

    }
    else{
      this.setState({currentpointstatus:true});
    }
    
 }

}

confirmDestination(){

  this.setState({currentpointstatus:true,modalVisible:false}); 
}

componentWillUnmount() {
  
}
 
getaddress(latitude){
 
   for (const key of this.state.fulladdress) {
        if(key.latitude == latitude){
          return key.address;
        }

     }
} 

ShowMangeStopPupup = (coordinate) => {
  // console.log(coordinate);
  if(coordinate.status == 'active' && coordinate.rescue == 'no'){

    this.setState({popupfornewStop:true,currentCoordinate:coordinate});
  }

 }
 ShowFuelStationPupup = (coordinate) =>{

  this.setState({fuelstationpopup:true,fuelstationCoordinate:coordinate});

 } 
 closeFuelStationPupup(){
  this.setState({fuelstationpopup:false});
} 
addStop(){
  this.setState({popupfornewStop:false});
  this.props.navigation.navigate('AddMapStop')
}
 closeStop(){

    this.setState({popupfornewStop:false});
 }


deleteStop(){
  this.setState({isloading:true,popupfornewStop:false}); 
  var postdata = { stop_id:this.state.currentCoordinate.stop_id};
  delete_stop(postdata).then((res) => {
    if(res.type == 1){
      this.setState({isloading:false,}); 
      _showSuccessMessage(res.message);
      this.updateWaypoints();
    }
    else{
      this.setState({isloading:false}); 
      _showErrorMessage(res.message)
    }
  })
}
routecheck(){

this.setState({isloading:true});
  complete_my_route({is_route_complete:'yes'}).then((res) => {
     if(res.type == 1){
        _storeData('routecheck','yes').then();
      
        this.setState({routecheck:false})
     _storeData('is_marking',null).then();
      this.props.navigation.navigate('PackageNumbering');

      this.setState({isloading:false});
    }
    else{
      this.setState({isloading:false});
      _showErrorMessage(res.message)
    }

  })

}

editStop(){

  _storeData('current_stop_id',this.state.currentCoordinate.stop_id).then((res) => { 

    if(res){
      this.setState({popupfornewStop:false});
      this.props.navigation.navigate('EditMapStop');
    }

  });
}
showSkipModal(){ 
  this.setState({popupfornewStop:false, skipmodals:true})
}
Skiprouteclose(){

  this.setState({skipmodals:false});
}

Skiproute(){

  this.setState({isloading:true});

  if(this.state.skipcomment == ""){
    _showErrorMessage('Please enter the skip reason')
    this.setState({isloading:false});
    return false;
  }

  this.setState({skipmodals:false});

  save_skip_stop({stop_id:this.state.currentCoordinate.stop_id,comment:this.state.skipcomment}).then((res) => {
    // console.log(res);
    if(res.type == 1){
      _showSuccessMessage('Route skiped successfully');
      this.setState({isloading:false});
    }else{
        _showErrorMessage(res.message)

        this.setState({isloading:false});
    }


  })
}
storeLastpoint(itemValue){
  // alert(itemValue); 
  this.setState({selectedsecond:itemValue})

  _storeData('selectedsecond',itemValue).then();
}

numberingtopackage(){

  this.setState({isloading:true});

  complete_my_route({is_route_complete:'yes'}).then((res) => {

    if(res.type == 1){

     _storeData('is_marking',null).then();
     
      this.props.navigation.navigate('PackageNumbering');

      
    }
    else{
      _showErrorMessage(res.message)
      this.setState({isloading:false});
    }

  })
       
        
}

canceloptimize(){
  this.setState({CustomRouteModal:false})
}

optimizeAfterDeliveryRoute(){
  this.setState({isloading:true});
  this.setState({deliveryModal:false})
  _retrieveData('updatedwaypoints').then((newdata)=>{
    safezone_warehouse_list().then((list) => {
    if(list.type == 1){
    
    for (const key of list.data.safezone_warehouses) { 
                if(key.warehouse_id == this.state.selectedsecond){
                  
                  var add2 = {barcode:key.warehouse_id,stop_id:'',address:key.Warehouse_address,lat: key.warehouse_latitude, lng:key.warehouse_longitude,status:'',sequence:0,rescue:'no',nearby:'',nearbytitle:'',yard:'yes',customer_name:'',is_skip_stop:'no'}
                  
                    newdata.push(add2);

                    this.setState({last_point_lat:key.warehouse_latitude,last_point_long:key.warehouse_longitude})
                   
                }
              }

        var url = 'https://wse.ls.hereapi.com/2/findsequence.json?apiKey=wSg9ZNFX0A6AGmgaH7Euid5UQM2yFgtubg1_FfO-iIg&start='+newdata[0].lat+','+newdata[0].lng+'&improveFor=distance&mode=fastest;car;traffic:disabled;&';

        var count = 0;
        var string = url;
        for (const key of newdata) {
            
            // console.log(key.barcode)
            if(count != 0 && key.barcode != ""){
              
              string+= 'destination'+count+'='+key.barcode+';'+key.lat+','+key.lng+'&'
            }

            count++;
        }

        this.savedistanceTime(string,newdata);
    }
  })
  })

}

async savedistanceTime(url,data){

 await fetch(url,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }       
  })
  .then((response) => response.json())
  .then((res) => {
  if(res.results != null){

    var route_distance = parseFloat(res.results[0].distance/1000).toFixed(2)+' KM';
    var additional = data.length*3;
    var combaine = res.results[0].time/60;
    var time = parseFloat(additional+combaine).toFixed(2);
    var route_time = this.timeConvert(time);
    var actual_route_time = this.timeConvert(combaine);
      

      var formdata = {route_distance:route_distance,route_time:route_time,actual_route_time:actual_route_time,last_point_id:this.state.selectedsecond,last_point_lat:this.state.last_point_lat,last_point_long:this.state.last_point_long,is_rescue_route:'no'}

      update_last_point(formdata).then((res) => { 
        if(res.type == 1){
            
            _storeData('store_distance_time','yes');
            this.setState({isloading:false});
            _showSuccessMessage(res.message);

            _storeData('last_point_after_deleivery',this.state.selectedsecond);

            this.updateWaypoints();
            
        }
        else
        {
          this.setState({isloading:false}); 
           _showErrorMessage(res.message);
          
         } 


      }) 
          
  }
  else 
  {
     _showErrorMessage(res.errors[0]);
     this.setState({isloading:false}); 
    
  }
 
 })
  
}


optimizeCustomRoute(){
 
   if(this.state.selectedfirst == ''){
        _showErrorMessage('Please choose the First stop');
        this.setState({ isloading: false });
        return false; 
      }

    if(this.state.selectedsecond == ''){
        _showErrorMessage('Please choose the last stop');
        this.setState({ isloading: false });
        return false;
      }  

  var data = this.state.FlatListItems;
  var firstpoint = this.state.selectedfirst;


  var index = data.findIndex(p => p.stop_id == firstpoint);
      // console.log(data[index].address);
      var startStop_id = data[index].stop_id;
      var url = 'https://wse.ls.hereapi.com/2/findsequence.json?apiKey=wSg9ZNFX0A6AGmgaH7Euid5UQM2yFgtubg1_FfO-iIg&start='+data[index].lat+','+data[index].lng+'&improveFor=distance&mode=fastest;car;traffic:disabled;&';

      var count = 0;
      var string = url;
      for (const key of data) {
          
          // console.log(key.barcode)
          if(count != 0 && key.barcode != ""){
            // console.log(key.barcode);
            string+= 'destination'+count+'='+key.barcode+';'+key.lat+','+key.lng+'&'
          }

          count++;
      }
     // console.log(string);
      this.sequenceWaypoints(string,startStop_id);
}

timeConvert2(n) {
var num = n;

var minutes = n;
var hours = (minutes / 60);
var rminutes = Math.floor(minutes);
var rhours = Math.floor(hours);
var minutes2 = (hours - rhours) * 60;
// console.log(minutes2,minutes);

return rhours + " HRS " + Math.floor(minutes2) + " MIN";
}
async sequenceWaypoints(url,startStop_id){
  // console.log(url);
  this.setState({isloading:true}); 
  this.setState({CustomRouteModal:false})
  var ldata = await _retrieveData('selectedsecond').then();

 await fetch(url,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }       
  })
  .then((response) => response.json())
  .then((res) => {
  if(res.results != null){
    const markersData = [];

    const _this = this;
    

    var route_distance = parseFloat(res.results[0].distance/1000).toFixed(2)+' KM';

    var time = parseFloat(res.results[0].time/60).toFixed(2);

    var route_time = this.timeConvert2(time);
    // console.log(res.results[0].waypoints);
    for (const key of res.results[0].waypoints) {
          markersData.push({barcode:key.id,lat: key.lat, lng:key.lng,sequence:key.sequence});
     }
     
       const formdata = new FormData();
 
        formdata.append('number_packages', JSON.stringify(markersData));
        formdata.append('route_distance',  route_distance);
        formdata.append('route_time',  route_time);
        formdata.append('is_custom_route',  'yes');
        formdata.append('custom_route_start',  startStop_id);
        formdata.append('custom_route_end', ldata);
        _storeData('custom_route_data',markersData).then();

        this.setState({route_distance:route_distance,route_time:route_time});

        markNumberToPackages(formdata).then((res) => {

          if(res.type == 1){
              _storeData('is_marking','yes').then();
              this.setState({isloading:false,is_marking:false});
              _showSuccessMessage(res.message);
              this.updateWaypoints();
              // this.props.navigation.navigate('PackageNumbering');

            
          }
          else
          {
            this.setState({isloading:false}); 
             _showErrorMessage(res.message);
            
           }


        }) 
          
  }
  else 
  {
     _showErrorMessage(res.errors[0]);
     this.setState({ modalVisible: false });
     this.setState({isloading:false}); 
    
  }
 
  })
  
}
handleRescueGetDirections(coord){
 if(Platform.OS == 'ios') {
  Linking.openURL('comgooglemaps://?daddr='+ coord.latitude + "," + coord.longitude );
 }
 else{
          const data = {
              destination: {
                latitude: coord.latitude,
                longitude: coord.longitude
              },
              params: [
                {
                  key: "travelmode",
                  value: "driving"        // may be "walking", "bicycling" or "transit" as well
                },
                {
                  key: "dir_action",
                  value: "navigate"       // this instantly initializes navigation using the given travel mode
                }
              ],
              waypoints: [
                
                
              ]
            }
         
            getDirections(data)
   }
}
 handleGetDirections = (coordinate) => {
 if(Platform.OS == 'ios') {
  Linking.openURL('comgooglemaps://?daddr='+ coordinate.lat + "," + coordinate.lng );
 }
 else{
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?key=sjdkgfdhs&address='+coordinate.address;
    fetch(url,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }       
    }).then((response) => response.json())
    .then((res) => {
      // console.log(res.results[0].formatted_address); 
      if(res.results[0].formatted_address == coordinate.address){
        var url = "https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination="+coordinate.address;
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                // console.log('Can\'t handle url: ' + url);
                 const data = {
                  destination: {
                    latitude: coordinate.lat,
                    longitude: coordinate.lng
                  },
                  params: [
                    {
                      key: "travelmode",
                      value: "driving"        // may be "walking", "bicycling" or "transit" as well
                    },
                    {
                      key: "dir_action",
                      value: "navigate"       // this instantly initializes navigation using the given travel mode
                    }
                  ],
                  waypoints: [
                    
                    
                  ]
                }
             
                getDirections(data)
            } else {

                const data = {
                  destination: {
                    latitude: coordinate.lat,
                    longitude: coordinate.lng
                  },
                  params: [
                    {
                      key: "travelmode",
                      value: "driving"        // may be "walking", "bicycling" or "transit" as well
                    },
                    {
                      key: "dir_action",
                      value: "navigate"       // this instantly initializes navigation using the given travel mode
                    }
                  ],
                  waypoints: [
                    
                    
                  ]
                }
             
                getDirections(data)

                //return Linking.openURL(url);
            }
        }).catch(err => console.error('An error occurred', err)); 
      }
      else{
        // alert('sdfsdfsdfsd')
          if(coordinate.status == 'active' && coordinate.rescue == 'no'){
          const data = {
              destination: {
                latitude: coordinate.lat,
                longitude: coordinate.lng
              },
              params: [
                {
                  key: "travelmode",
                  value: "driving"        // may be "walking", "bicycling" or "transit" as well
                },
                {
                  key: "dir_action",
                  value: "navigate"       // this instantly initializes navigation using the given travel mode
                }
              ],
              waypoints: [
                
                
              ]
            }
         
            getDirections(data)
          }
      }
    })
   }
  }

  handleGetDirectionsFromList = (lat,lng,address) => {

 if(Platform.OS == 'ios') {
  // Linking.openURL('maps://app?daddr='+ lat + "," + lng );
  Linking.openURL('comgooglemaps://?daddr='+ lat + "," + lng );
 }
 else{
  
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?key=jhagsdjaghsd&address='+address;
    fetch(url,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }       
    }).then((response) => response.json())
    .then((res) => {
      // console.log(res.results[0].formatted_address); 
      if(res.results[0].formatted_address == address){
        var url = "https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination="+address;
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                const data = {
                destination: {
                  latitude: lat,
                  longitude: lng
                },
                params: [
                  {
                    key: "travelmode",
                    value: "driving"        // may be "walking", "bicycling" or "transit" as well
                  },
                  {
                    key: "dir_action",
                    value: "navigate"       // this instantly initializes navigation using the given travel mode
                  }
                ],
                waypoints: [
                  
                  
                ]
              }
           
              getDirections(data)
            } else {
                //return Linking.openURL(url);

                const data = {
                destination: {
                  latitude: lat,
                  longitude: lng
                },
                params: [
                  {
                    key: "travelmode",
                    value: "driving"        // may be "walking", "bicycling" or "transit" as well
                  },
                  {
                    key: "dir_action",
                    value: "navigate"       // this instantly initializes navigation using the given travel mode
                  }
                ],
                waypoints: [
                  
                  
                ]
              }
           
              getDirections(data)
            }
        }).catch(err => console.error('An error occurred', err)); 
      }
      else{
         
          const data = {
              destination: {
                latitude: lat,
                longitude: lng
              },
              params: [
                {
                  key: "travelmode",
                  value: "driving"        // may be "walking", "bicycling" or "transit" as well
                },
                {
                  key: "dir_action",
                  value: "navigate"       // this instantly initializes navigation using the given travel mode
                }
              ],
              waypoints: [
                
                
              ]
            }
         
            getDirections(data)
          
      }
    })
 }   

  }


ChangeView(view){

  this.setState({
        showview:view,
      })

  }
convertnumber(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

array_move(arr, old_index, new_index) {

    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }

    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing

  }
calculateAverage(array) {
    var total = 0;
    var count = 0;

    array.forEach(function(item, index) {
        total += item;
        count++;
    });

    return total / count;
}
async  getNextFiveBusiness(data){

    var currentStop = '';
    var currentIndex = '';
    var currentlat = '';
    var currentlon = '';


  var checkminimumTime = [];
  var distArr = [];
  for (let i = 0; i < data.length; i++) {
   if(data[i].sequence != 0){
      checkminimumTime.push({index:i,end_business_time:data[i].end_business_time});
      distArr.push(data[i].total_distance/1000);
   }
    
  }

  var averageKM = this.calculateAverage(distArr);
  var AVGKM = Math.round(averageKM);

   AVGKM = AVGKM*1000;
 
   var sortlesstime = checkminimumTime.sort(function (a, b) {
        return a.end_business_time - b.end_business_time
    })

   let date_ob = new Date();

  let hours = date_ob.getHours();

  if(parseFloat(sortlesstime[0].end_business_time)+12 <= hours ){


      var makeData = [];

      for (let i = 0; i < data.length; i++) {
        console.log(data[i].is_business_address);
        if(data[i].is_rescue == "no" && data[i].is_business_address != "no"){
          makeData.push({sequence:data[i].sequence,index:i,end_business_time:data[i].end_business_time,address:data[i].address,status:data[i].status,latitude:data[i].latitude,longitude:data[i].longitude,is_business_address:data[i].is_business_address});
        }
      }



      // console.log(makeData.length);
      if(makeData.length < 1){
        console.log("false");
        return false;
      }
        for (let i = 0; i < makeData.length; i++) {

          if(makeData[i].sequence != 0){
            if(makeData[i].status == 'active'){
              currentStop = makeData[i].sequence;
              currentIndex = makeData[i].sequence;
              currentlat = makeData[i].latitude;
              currentlon = makeData[i].longitude;

              break;
            }
          }
        } 

        var count = 0;
        var count2 = 0;
        var timeobject = []; 
        var checkdelivernext = 0;

        var routeString = 'https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=hoeC8KKbZAQv2dVprjVcaN0LrXnojTkNThDzV9iG2kM&mode=fastest;car&';
        
        for (let i = 0; i < makeData.length; i++) {
          
          if(count <= 6+currentStop){
            if(makeData[i].status != "active" && count >= currentStop){
              checkdelivernext = 1; 
            }
          
            if(makeData[i].is_business_address == "yes" && makeData[i].status == "active"){
             
              timeobject.push({sequence:makeData[i].sequence,index:i,time:makeData[i].end_business_time,address:makeData[i].address,status:makeData[i].status,lat:makeData[i].latitude,lng:makeData[i].longitude});
            }
          
           count ++
        }
      } 


     var waypoints = [];

      if(timeobject.length > 0 && checkdelivernext == 0){

        var sort = timeobject.sort(function (a, b) {
            return a.time - b.time
        })

       var business_stop = sort[0].sequence;
       var stopcount = business_stop-currentStop;
       // console.log(business_stop,currentStop,stopcount);
        for (let i = 0; i < makeData.length; i++) {
          if(makeData[i].sequence <= business_stop && makeData[i].sequence >= currentStop){
              routeString += 'waypoint'+count2+'='+makeData[i].latitude+','+makeData[i].longitude+'&';
              count2++;
            }
        } 

        var routeString2 = 'https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=hoeC8KKbZAQv2dVprjVcaN0LrXnojTkNThDzV9iG2kM&mode=fastest;car&waypoint0='+currentlat+','+currentlon+'&waypoint1='+sort[0].lat+','+sort[0].lng;

        await fetch(routeString2,{
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            }       
          }) 
          .then((respons) => respons.json())
          .then((res) => {
            if( typeof  res.response != "undefined"){
              
              var businessStopSec = res.response.route[0].summary.travelTime;

              var businessStopminutes = Math.floor(businessStopSec / 60);
              
               if(res.response.route[0].summary.distance < AVGKM){
                     fetch(routeString,{
                      method: 'GET',
                      headers: {
                        'Accept': 'application/json',
                        }       
                      })  
                      .then((respons) => respons.json())
                      .then((res) => {
                        if( typeof  res.response != "undefined"){
                          
                          var sec = res.response.route[0].summary.travelTime;

                          var minutes = Math.floor(sec / 60);
                          if(stopcount > 0){
                            var extraminutes = stopcount*3;
                            minutes = minutes+extraminutes;
                          }
                          var endtime = sort[0].time+':00 PM';
                          
                          var closingtime = this.getbusinessStops(endtime);
                          console.log(businessStopminutes,closingtime,minutes);
                          if(businessStopminutes < closingtime){
                              if(closingtime < minutes){ 
                              var newdata = this.array_move(data,sort[0].sequence, currentStop);

                               for (const key of newdata) {
                                 waypoints.push({latitude: key.latitude, longitude:key.longitude});
                               }
                               console.log('in routes');
                              this.fetchAndRenderRoute(this.state.origin,this.state.destination,waypoints,waypoints);
                            }
                            else{
                              
                              return waypoints;
                            }
                          }
                          else{
                            return waypoints;
                          }
                          
                        }
                        else{
                          return waypoints;
                        }
                     })
                    }
                  }
              })
      

       }
       else{
         return waypoints;
       }
 }else{
  return false
 }

}

 getbusinessStops(time){
  // this.setState({modalVisible:true})

    let date_ob = new Date();

   let date = ("0" + date_ob.getDate()).slice(-2);

   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  let year = date_ob.getFullYear();

  let hours = date_ob.getHours();

  let minutes = date_ob.getMinutes();

  let seconds = date_ob.getSeconds();

  let htime = [];

  var currentDate = year + "-" + month + "-" + date;
  var currentDate2 = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

  var addresstime = this.formatAMPM(time);
  var date1 = currentDate+" "+addresstime+":00";
  var date2 = currentDate2;
  var bhours = Math.abs(new Date(date1.replace(/-/g,'/'))-new Date(date2.replace(/-/g,'/')));
  return this.msToTime(bhours);
}
formatAMPM(timeampm) {

  var time = timeampm.trim();
  var hours = Number(time.match(/^(\d+)/)[1]);
  var minutes = Number(time.match(/:(\d+)/)[1]);
  var AMPM = time.match(/\s(.*)$/)[1];
  if(AMPM == "PM" && hours<12) hours = hours+12;
  if(AMPM == "AM" && hours==12) hours = hours-12;
  var sHours = hours.toString();
  var sMinutes = minutes.toString();
  if(hours<10) sHours = "0" + sHours;
  if(minutes<10) sMinutes = "0" + sMinutes;
  return sHours + ":" + sMinutes;

}
msToTime(duration) {
  var milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  var time =  (hours*60) + minutes;

  return Math.floor(time);
}
async updateWaypoints(){
 
   this.setState({isloading:true}); 
   await _retrieveData('last_point_after_deleivery').then((lpoint) => {
    safezone_warehouse_list().then((list) => {
    if(list.type == 1){
    var listdata = list.data.safezone_warehouses;
      // console.log(list.data.safezone_warehouses);
      for (const key of list.data.safezone_warehouses) {
          if(key.Warehouse_name == "TRANS8 YARD"){
            var yard = {latitude:key.warehouse_latitude,longitude:key.warehouse_longitude};
            var yard2 = {barcode:key.warehouse_id,stop_id:'',address:key.Warehouse_address,lat: key.warehouse_latitude, lng:key.warehouse_longitude,status:'',sequence:0,rescue:'no',nearby:'',nearbytitle:'',yard:'yes',customer_name:''}
         
            this.setState({yardStop:yard}); 
            this.setState({yardStopToFulladdress:yard2}); 
          }
      }
      this.setState({safeZonStops:list.data.safezone_warehouses});

  
   getUpdatedPoints().then((res) => {
     console.log(res.data);
    if(res.type == 1){

      this.setState({modalDefault:true});
      if(res.data.is_custom_route_allow == 'no' || res.data.is_route_complete == 'yes'){
          this.setState({routecheck:false});
          this.setState({modalDefault:false})
      }
      _storeData('updatedwaypoints',res.data.lat_long).then();
      _storeData('updatedwaypoints2',res.data.lat_long).then();
      const fullAddress = [];
      const waypointData = [];
      const startobj = []; 
      for (const key of res.data.lat_long) {
          // console.log(res.data);
          fullAddress.push({barcode:key.barcode,stop_id:key.stop_id,address:key.address,lat: key.latitude, lng:key.longitude,status:key.status,sequence:key.sequence,rescue:key.is_rescue,nearby:key.nearby,nearbytitle:key.nearbytitle,yard:key.is_yard,customer_name:key.customer_name,is_skip_stop:key.is_skip_stop});

          startobj.push({barcode:key.barcode,stop_id:key.stop_id,address:key.address,lat: key.latitude, lng:key.longitude,status:key.status,sequence:key.sequence,rescue:key.is_rescue,nearby:key.nearby,nearbytitle:key.nearbytitle,yard:key.is_yard,customer_name:key.customer_name,is_skip_stop:key.is_skip_stop});

      }   

      var normaltimeHour = res.data.route_time.substring(0, 2);

      var lasttime = res.data.route_time.charAt(7)+res.data.route_time.charAt(8);

      var minfirst = normaltimeHour*60;

      var finalmin = minfirst+parseFloat(lasttime);

      var minusMinuts = res.data.lat_long.length*3;

      var finalminutes = finalmin-minusMinuts;

      var convertFinalTime = this.timeConvert2(finalminutes) ;

      this.setState({CustomRoutePoints:startobj,totalDistance: res.data.route_distance,totalDuration:res.data.actual_route_time, totalDurationtime:res.data.route_time});


      for (const key of res.data.lat_long) {
      
          waypointData.push({latitude: key.latitude, longitude:key.longitude});

      }
 
        if(res.data.is_custom_route == 'yes'){
          
          fullAddress.push({barcode:'',stop_id:'',address:'',lat: res.data.CustomRouteEnd_latitude, lng:res.data.CustomRouteEnd_longitude,status:'',sequence:0,rescue:'no',nearby:'',nearbytitle:'',yard:'yes',customer_name:'',is_skip_stop:'no'});
          waypointData.push({latitude: res.data.CustomRouteEnd_latitude, longitude:res.data.CustomRouteEnd_longitude});

          _storeData('is_custom_route','yes').then();
            
        } 

        else{
           _storeData('is_custom_route','no').then();
          if(res.data.is_delivery_completed == 'yes'){

            if(lpoint != null)
            {
            // for (const key of list.data.safezone_warehouses) { 
            //     if(key.warehouse_id == res.data.last_point_id){
                  
            //       var add1 = {latitude:key.warehouse_latitude,longitude:key.warehouse_longitude};
            //       var add2 = {barcode:key.warehouse_id,stop_id:'',address:key.Warehouse_address,lat: key.warehouse_latitude, lng:key.warehouse_longitude,status:'',sequence:0,rescue:'no',nearby:'',nearbytitle:'',yard:'yes',customer_name:'',is_skip_stop:'no'}
                    
            //         fullAddress.push(add2);
            //         waypointData.push(add1); 
            //     }
            //   }
             
            }
           else{
              this.setState({deliveryModal:false});
           } 
          
        }
          else{


              // fullAddress.push(this.state.yardStopToFulladdress);
              // waypointData.push(this.state.yardStop);
          }

            

        }

        // console.log(fullAddress);
      _storeData('updatedwaypoints',fullAddress).then();
   
      this.setState({FlatListItems:fullAddress});

      this.setState({fulladdress:res.data.lat_long});

      var newpoints =  waypointData; 
      // console.log(newpoints);
      var total = newpoints.length;
      this.setState({origin:{"latitude": newpoints[0].latitude, "longitude": newpoints[0].longitude}});
      this.setState({destination:{"latitude":newpoints[total-1].latitude, "longitude": newpoints[total-1].longitude}});
      this.setState({maplatitude:newpoints[0].latitude});
      this.setState({maplongitude:newpoints[0].longitude});

      this.setState({points:waypointData});
      this.setState({isloading:false});

      this.setState({rescueorigin:{"latitude": this.state.startlatitude, "longitude": this.state.startlongitude}});
      this.setState({rescuedestination:{"latitude":res.data.pickup_location_lat, "longitude": res.data.pickup_location_long}});

      this.setState({rescuelatitude:res.data.pickup_location_lat,rescuelongitude:res.data.pickup_location_long})
      if(res.data.pickup_location_lat != ""){
        this.fetchAndRenderRoute2(this.state.rescueorigin,this.state.rescuedestination,[],[]);
      }

      this.fetchAndRenderRoute(this.state.origin,this.state.destination,waypointData,waypointData);
      
      var checkbusiness = this.getNextFiveBusiness(res.data.lat_long);
      // console.log(checkbusiness);
      if(checkbusiness.length > 0){
        this.setState({points:checkbusiness});
        this.fetchAndRenderRoute(this.state.origin,this.state.destination,checkbusiness,checkbusiness);
      }
      else{
        this.setState({points:waypointData});
        this.fetchAndRenderRoute(this.state.origin,this.state.destination,waypointData,waypointData);
      }

      this.setState({isloading:false});

     }
     else{
        _showErrorMessage(res.message);
        this.setState({isloading:false});
     }   
  })

   }
    else{
      _showErrorMessage(res.message);
    }
  })
  })
}

timeConvert(n) {
var num = n;
var hours = (num / 60);
var rhours = Math.floor(hours);
var minutes = (hours - rhours) * 60;
var rminutes = Math.round(minutes);
return rhours + " HRS " + rminutes + " MIN";
}

showFuelStations(coordinate,index){
  return(
          <View><Image source={require('../../../assets/images/fuel.png')}  />
                </View>
        )
}

showMarkers(coordinate,index){

var sequence = coordinate.sequence;
 
if(coordinate.nearby != ''){
  sequence = coordinate.nearbytitle;
}

if(sequence == 0){ 
  // console.log(coordinate.lat,);

  if(coordinate.yard == 'yes'){
   return(
          <View><Image source={require('../../../assets/images/lastflag.png')}  />
                </View>
        )
  }
  else{
      return(
          <View><Image source={require('../../../assets/images/startflag.png')}  />
                </View>
        )
  }
}
else{

 if(this.state.rescuelist == 'yes'){ 
        if(coordinate.status == 'active'){

          if(coordinate.nearby != ''){
            return(
                <View>
                <ImageBackground source={require('../../../assets/images/newstop.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
              )
          }
          else{
             return(
                <View>
                <ImageBackground source={require('../../../assets/images/pending.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
              )
             }
         
    }
    else if(coordinate.status == 'delivered'){
      
        return(
            <View>
                <ImageBackground source={require('../../../assets/images/complete.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
          )
    }
    else{

        return(
            <View>
                <ImageBackground source={require('../../../assets/images/cancelmap.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
       )
      }
 }
 else{
  // console.log(coordinate.rescue);
  if(coordinate.rescue == 'yes'){ 
    
        return(
        <View>
                <ImageBackground source={require('../../../assets/images/gray.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
      )
  }
  else{

    if(coordinate.is_skip_stop == 'yes'){
        return(
                <View>
                <ImageBackground source={require('../../../assets/images/live.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#fff",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
              )
    }
    else{

    if(coordinate.status == 'active'){
      
           if(coordinate.nearby != ''){
            return(
                <View>
                <ImageBackground source={require('../../../assets/images/newstop.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
              )
          }
          else{
             return(
                <View>
                <ImageBackground source={require('../../../assets/images/pending.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
              )
             }
     
    }
    else if(coordinate.status == 'delivered'){

        

        return(
            <View>
                <ImageBackground source={require('../../../assets/images/complete.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
          )
    }
    else{

        return(
            <View>
                <ImageBackground source={require('../../../assets/images/cancelmap.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{sequence}</Text>
                  </ImageBackground>
                </View>
          )
    }
  }

   }
 }
}

} 
informationPopup(lat,lon){

  const address = this.getaddress(lat);

  this.setState({popupfornewStop:true,currentAddress:address});

}

checkDuplicateMarker(coordinate,index){
  var count = 1
   for (const key of this.state.fulladdress) {
        if(key.latitude == coordinate.lat){
          
          count++
        }

     }

    if(count == 3){
      return(
          <View style={{marginTop:20}}>
              <Image source={require('../../../assets/images/pending.png')}  />
              <Text style={{textAlign: 'center',color:"#000",position:'absolute',right:15,top:6,fontWeight:'bold'}}>{index+1}</Text>
            </View>
        )
    }
}
toggleSubview() {    
    this.setState({
      iconName: !this.state.ishidden ? "caret-up" : "caret-down"
    });

    var toValue = 560;

    if(this.state.ishidden) {
      toValue = 100;
    }

    Animated.spring(
      this.state.bounceValue,
      {
        toValue: toValue,
        velocity: 3,
        tension: 2,
        friction: 8,
        useNativeDriver: true
      }
    ).start();

    this.state.ishidden = !this.state.ishidden;
  }



  decode(t) {
    let points = [];
    for (let step of t) {
      let encoded = step.polyline.points;
      let index = 0, len = encoded.length;
      let lat = 0, lng = 0;
      while (index < len) {
        let b, shift = 0, result = 0;
        do {
          b = encoded.charAt(index++).charCodeAt(0) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);

        let dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
          b = encoded.charAt(index++).charCodeAt(0) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });
      }
    }
    return points;
  }

  fetchAndRenderRoute = (origin,destination,waypoints,initialWaypoints) => {

    // let {
    //   origin: initialOrigin,
    //   destination: initialDestination,
    //   waypoints: initialWaypoints = [],
    //   apikey,
    //   onStart,
    //   onReady,
    //   onError,
    //   mode = 'DRIVING',
    //   language = 'en',
    //   optimizeWaypoints,
    //   splitWaypoints,
    //   directionsServiceBaseUrl = 'https://maps.googleapis.com/maps/api/directions/json',
    //   region,
    //   precision = 'low',
    //   timePrecision = 'none',
    //   channel,
    // } = props;
    var initialOrigin = origin;
    var initialDestination = destination;
    var directionsServiceBaseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
    var mode = 'DRIVING';
    var language = 'en';
    var precision = 'low';
    var timePrecision = 'none';
    var language = 'en';
    var splitWaypoints = true;
    var optimizeWaypoints = false;

    var region;
    var apikey = GOOGLE_MAPS_APIKEY;
    var channel;
    
     
      

    if (!apikey) {
      console.warn(`MapViewDirections Error: Missing API Key`); // eslint-disable-line no-console
      return;
    }

    if (!initialOrigin || !initialDestination) {
      return;
    }

    const timePrecisionString = timePrecision==='none' ? '' : timePrecision;
    
    // Routes array which we'll be filling.
    // We'll perform a Directions API Request for reach route
    const routes = [];

    // We need to split the waypoints in chunks, in order to not exceede the max waypoint limit
    // ~> Chunk up the waypoints, yielding multiple routes
    if (splitWaypoints && initialWaypoints && initialWaypoints.length > WAYPOINT_LIMIT) {
      // Split up waypoints in chunks with chunksize WAYPOINT_LIMIT
      const chunckedWaypoints = initialWaypoints.reduce((accumulator, waypoint, index) => {
        const numChunk = Math.floor(index / WAYPOINT_LIMIT); 
        accumulator[numChunk] = [].concat((accumulator[numChunk] || []), waypoint); 
        return accumulator;
      }, []);

      // Create routes for each chunk, using:
      // - Endpoints of previous chunks as startpoints for the route (except for the first chunk, which uses initialOrigin)
      // - Startpoints of next chunks as endpoints for the route (except for the last chunk, which uses initialDestination)
      for (let i = 0; i < chunckedWaypoints.length; i++) {
        routes.push({
          waypoints: chunckedWaypoints[i],
          origin: (i === 0) ? initialOrigin : chunckedWaypoints[i-1][chunckedWaypoints[i-1].length - 1],
          destination: (i === chunckedWaypoints.length - 1) ? initialDestination : chunckedWaypoints[i+1][0],
        });
      }
    }
    
    // No splitting of the waypoints is requested/needed.
    // ~> Use one single route
    else {
      routes.push({
        waypoints: initialWaypoints,
        origin: initialOrigin,
        destination: initialDestination,
      });
    }

    // Perform a Directions API Request for each route
    Promise.all(routes.map((route, index) => {
      let {
        origin,
        destination,
        waypoints,
      } = route;

      if (origin.latitude && origin.longitude) {
        origin = `${origin.latitude},${origin.longitude}`;
      }

      if (destination.latitude && destination.longitude) {
        destination = `${destination.latitude},${destination.longitude}`;
      }

      waypoints = waypoints
        .map(waypoint => (waypoint.latitude && waypoint.longitude) ? `${waypoint.latitude},${waypoint.longitude}` : waypoint)
        .join('|');

      if (optimizeWaypoints) {
        waypoints = `optimize:true|${waypoints}`;
      }

      // if (index === 0) {
      //   onStart && onStart({
      //     origin,
      //     destination,
      //     waypoints: initialWaypoints,
      //   });
      // }

      return (
        this.fetchRoute(directionsServiceBaseUrl, origin, waypoints, destination, apikey, mode, language, region, precision, timePrecisionString, channel)
          .then(result => {
            return result;
          })
          .catch(errorMessage => {
            return Promise.reject(errorMessage);
          })
      );
    })).then(results => {
      // Combine all Directions API Request results into one
      const result = results.reduce((acc, { distance, duration, coordinates, fare, waypointOrder }) => {
        acc.coordinates = [
          ...acc.coordinates,
          ...coordinates,
        ];
        acc.distance += distance;
        acc.duration += duration;
        acc.fares = [
          ...acc.fares,
          fare,
        ];
        acc.waypointOrder = [
          ...acc.waypointOrder,
          waypointOrder,
        ];

        return acc;
      }, {
        coordinates: [],
        distance: 0,
        duration: 0,
        fares: [],
        waypointOrder: [],
      });
      // console.log(result.coordinates);
      // Plot it out and call the onReady callback
      this.setState({
        polyCoordinates: result.coordinates,
      }, function() {
        // if (onReady) {
        //   onReady(result);
        // }
      });
    })
      .catch(errorMessage => {
        this.resetState();
        console.warn(`MapViewDirections Error: ${errorMessage}`); // eslint-disable-line no-console
        // onError && onError(errorMessage);
      });
  }
    fetchAndRenderRoute2 = (origin,destination,waypoints,initialWaypoints) => {
    // console.log(origin,destination,waypoints,initialWaypoints);
    var initialOrigin = origin;
    var initialDestination = destination;
    var directionsServiceBaseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
    var mode = 'DRIVING';
    var language = 'en';
    var precision = 'low';
    var timePrecision = 'none';
    var language = 'en';
    var splitWaypoints = false;
    var optimizeWaypoints = false;

    var region;
    var apikey = GOOGLE_MAPS_APIKEY;
    var channel;

    if (!apikey) {
      console.warn(`MapViewDirections Error: Missing API Key`); // eslint-disable-line no-console
      return;
    }

    if (!initialOrigin || !initialDestination) {
      return;
    }

    const timePrecisionString = timePrecision==='none' ? '' : timePrecision;
    const routes = [];
    if (splitWaypoints && initialWaypoints && initialWaypoints.length > WAYPOINT_LIMIT) {
      // Split up waypoints in chunks with chunksize WAYPOINT_LIMIT
      const chunckedWaypoints = initialWaypoints.reduce((accumulator, waypoint, index) => {
        const numChunk = Math.floor(index / WAYPOINT_LIMIT); 
        accumulator[numChunk] = [].concat((accumulator[numChunk] || []), waypoint); 
        return accumulator;
      }, []);

      for (let i = 0; i < chunckedWaypoints.length; i++) {
        routes.push({
          waypoints: chunckedWaypoints[i],
          origin: (i === 0) ? initialOrigin : chunckedWaypoints[i-1][chunckedWaypoints[i-1].length - 1],
          destination: (i === chunckedWaypoints.length - 1) ? initialDestination : chunckedWaypoints[i+1][0],
        });
      }
    }

    else {
      routes.push({
        waypoints: initialWaypoints,
        origin: initialOrigin,
        destination: initialDestination,
      });
    }
    Promise.all(routes.map((route, index) => {
      let {
        origin,
        destination,
        waypoints,
      } = route;

      if (origin.latitude && origin.longitude) {
        origin = `${origin.latitude},${origin.longitude}`;
      }

      if (destination.latitude && destination.longitude) {
        destination = `${destination.latitude},${destination.longitude}`;
      }

      waypoints = waypoints
        .map(waypoint => (waypoint.latitude && waypoint.longitude) ? `${waypoint.latitude},${waypoint.longitude}` : waypoint)
        .join('|');

      if (optimizeWaypoints) {
        waypoints = `optimize:true|${waypoints}`;
      }

      return (
        this.fetchRoute(directionsServiceBaseUrl, origin, waypoints, destination, apikey, mode, language, region, precision, timePrecisionString, channel)
          .then(result => {
            return result;
          })
          .catch(errorMessage => {
            return Promise.reject(errorMessage);
          })
      );
    })).then(results => {

      const result = results.reduce((acc, { distance, duration, coordinates, fare, waypointOrder }) => {
        acc.coordinates = [
          ...acc.coordinates,
          ...coordinates,
        ];
        acc.distance += distance;
        acc.duration += duration;
        acc.fares = [
          ...acc.fares,
          fare,
        ];
        acc.waypointOrder = [
          ...acc.waypointOrder,
          waypointOrder,
        ];

        return acc;
      }, {
        coordinates: [],
        distance: 0,
        duration: 0,
        fares: [],
        waypointOrder: [],
      });
      
      this.setState({
        polyCoordinatesRescue: result.coordinates,
      }, function() {
        
      });

      // console.log(result.coordinates);
    })
      .catch(errorMessage => {
        this.resetState();
        console.warn(`MapViewDirections Error: ${errorMessage}`); // eslint-disable-line no-console
        // onError && onError(errorMessage);
      });
  }
  fetchRoute(directionsServiceBaseUrl, origin, waypoints, destination, apikey, mode, language, region, precision, timePrecision, channel) {

    // Define the URL to call. Only add default parameters to the URL if it's a string.
    let url = directionsServiceBaseUrl;
    if (typeof (directionsServiceBaseUrl) === 'string') {
      url += `?origin=${origin}&waypoints=${waypoints}&destination=${destination}&key=${apikey}&mode=${mode.toLowerCase()}&language=${language}&region=${region}`;
      if(timePrecision){
        url+=`&departure_time=${timePrecision}`;
      }
      if(channel){
        url+=`&channel=${channel}`;
      }
    }

    return fetch(url)
      .then(response => response.json())
      .then(json => {

        if (json.status !== 'OK') {
          const errorMessage = json.error_message || json.status || 'Unknown error';
          return Promise.reject(errorMessage);
        }

        if (json.routes.length) {

          const route = json.routes[0];

          return Promise.resolve({
            distance: route.legs.reduce((carry, curr) => {
              return carry + curr.distance.value;
            }, 0) / 1000,
            duration: route.legs.reduce((carry, curr) => {
              return carry + (curr.duration_in_traffic ? curr.duration_in_traffic.value : curr.duration.value);
            }, 0) / 60,
            coordinates: (
              (precision === 'low') ?
                this.decode([{polyline: route.overview_polyline}]) :
                route.legs.reduce((carry, curr) => {
                  return [
                    ...carry,
                    ...this.decode(curr.steps),
                  ];
                }, [])
            ),
            fare: route.fare,
            waypointOrder: route.waypoint_order,
          });

        } else {
          return Promise.reject();
        }
      })
      .catch(err => {
        return Promise.reject(`Error on GMAPS route request: ${err}`);
      });
  }

canceldefaultRoute(){
  this.setState({modalDefault:false})
}

showcustomroutemodal(){
  this.setState({modalDefault:false})
  this.setState({CustomRouteModal:true})
}

render() {
    // alert();
    return (
    <View style={styles.container}>
      
      <View style={{ width: '100%',height:'100%', flexDirection:'row'}}>
      {this.state.maplatitude && this.state.maplongitude ? (
        <MapView 
            
            ref={(ref) => { this.map = ref }} 
            initialRegion={{
              latitude: this.state.maplatitude,
              longitude: this.state.maplongitude,
              latitudeDelta: 0.000001,
              longitudeDelta: this.state.LONGITUDE_DELTA,
            }}
            mapPadding={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20
                    }}
                    
            loadingEnabled={false}
            userLocationPriority={'high'}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsTraffic={false}
            zoomEnabled={true}
            zoomTapEnabled={true}
            zoomControlEnabled={true}
            rotateEnabled={true}
            scrollEnabled={true}
            toolbarEnabled={true}
            showsCompass={false}
            userInterfaceStyle={'dark'}
             
          style={{
            marginBottom: this.state.bottomMargin,            
            ...StyleSheet.absoluteFillObject,
          }}
         
          mapType={Platform.OS == "android" ? "standard" : "standard"}
          onLayout = { (some) => {

          }}
          onMapReady={() => this.setState({ bottomMargin: 1 })}
            >
           
        {this.state.FlatListItems.map((coordinate, index) =>


          <MapView.Marker key={`coordinate_${index}`} pinColor="green" coordinate={{latitude:coordinate.lat,longitude:coordinate.lng}} onPress={() => this.ShowMangeStopPupup(coordinate)}>
          
          {

            this.showMarkers(coordinate,index)
          }

          </MapView.Marker>
         
        )}
        
          {this.state.fuelstations.map((coordinate, index) => 

            <MapView.Marker key={`coordinate_${index}`} pinColor="green" coordinate={{latitude:coordinate.latitude,longitude:coordinate.longitude}} onPress={() => this.ShowFuelStationPupup(coordinate)}>
            
            {

              this.showFuelStations(coordinate,index)
            }

            </MapView.Marker>
           
          )}
        

        {this.state.rescuelatitude !='' &&
          <MapView.Marker key={3} pinColor="green" coordinate={{latitude:this.state.rescuelatitude,longitude:this.state.rescuelongitude}}>

                  <View>
                  <ImageBackground source={require('../../../assets/images/newstop.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>R</Text>
                  </ImageBackground>
                </View>

                </MapView.Marker>
         }  

        <Polyline
          coordinates={this.state.polyCoordinates}
          strokeColor="#d66100" // fallback for when `strokeColors` is not supported by the map-provider
          strokeColors={[
            '#7F0000',
            '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
            '#B24112',
            '#E5845C',
            '#238C23',
            '#7F0000'
          ]}
          strokeWidth={6}
        />

        <Polyline
          coordinates={this.state.polyCoordinatesRescue}
          strokeColor="#211bbe" // fallback for when `strokeColors` is not supported by the map-provider
          strokeColors={[
            '#7F0000',
            '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
            '#B24112',
            '#E5845C',
            '#238C23',
            '#7F0000'
          ]}
          strokeWidth={6}
        />
    

      </MapView>) :( 

      <Text> Loading
        </Text>)
        }
        
      </View>
       <View style={{flexDirection:'row',height:'10%',alignSelf:'center'}}>
       <TouchableOpacity  onPress={()=> {this.toggleSubview()}}>
          <Ionicons name={this.state.iconName} size={35} color="#00c2f3" />
        </TouchableOpacity>
      </View>
      <View>
      { this.state.routecheck ?
        <View style={{position: "absolute",bottom: 0,left: 0,right: 0,backgroundColor: "#FFFFFF",height:100,marginBottom:15}}>
          <View style={{flexDirection:'row',width:'100%'}}>
            <View style={{alignItems:'center', width:'50%', paddingTop:20}}>
              <Button style={{marginTop:20}} title="Create Custom Route" onPress={() => this.setState({CustomRouteModal:true})} />
            </View>
            { this.state.is_marking ?
            <View style={{alignItems:'center',width:'50%',paddingTop:20}}>
              <Button style={{marginTop:20}} title="Use Default Route" onPress={() => this.routecheck()}/>
            </View>
            :<View style={{alignItems:'center',width:'50%',paddingTop:20}}>
              <Button style={{marginTop:20}} title="Go To Numbering" onPress={() => this.numberingtopackage()}/>
            </View>
          }
          </View>  
        </View>
      :<Animated.View
            style={[styles.subView,
              {transform: [{translateY: this.state.bounceValue}]}]}
          >
          <TouchableOpacity style={{flexDirection:'row',alignSelf:'center'}} onPress={()=> {this.toggleSubview()}}>
            <Ionicons name={this.state.iconName} size={35} color="#00c2f3" />
          </TouchableOpacity>
          <View style={styles.driverheader}>
            <View style={styles.item}>
            <View style={styles.section}>
              <View style={styles.profileimg}>
              <Image source={require('../../../assets/images/driver.png')}  />
              </View>
               <View style={{width:"70%",paddingLeft:10}}>
                  <Text style={{fontSize:16,fontWeight:'bold'}}>Driver Name:</Text>
                  <Text style={{fontSize:14,fontWeight:'bold'}}>Date:</Text>
               </View>
               </View>
            </View> 
            <View style={styles.section}>
              <View style={styles.item}>
                <Text style={{fontSize:14,fontWeight:'bold'}}>{this.state.drivername}</Text>
                <Text style={{fontSize:12,fontWeight:'bold'}}>{this.state.date}</Text>
              </View>
            </View>  
          </View>
          <View style={styles.DistanceHead}>
                <View style={styles.item}>

                  <Text style={{fontSize:13,fontWeight:'bold'}}>Travel Dist: {this.state.totalDistance} </Text>
                  <Text style={{fontSize:13,fontWeight:'bold',marginTop:5}}>Travel Time: {this.state.totalDuration}</Text>
                  
               </View>
              <View style={styles.item}>
                <Text style={{fontSize:13,fontWeight:'bold',width:'100%'}}>Start Time: {this.state.currenttime} </Text>

                <Text style={{fontSize:13,fontWeight:'bold',width:'100%',marginTop:5}}>Total Time: {this.state.totalDurationtime} </Text>
              </View>  

          </View>

          <View style={styles.indication}>

            <View style={styles.item2}>
              <View style={styles.section}>
                <View style={styles.profileimg2}>
                <Image source={require('../../../assets/images/blue.png')}  />
                </View>
                 <View style={{width:"70%",paddingLeft:0}}>
                    <Text style={{fontSize:13,fontWeight:'bold',paddingTop:6}}>Delivered</Text>
                 </View>
              </View>
            </View>

            <View style={styles.item2}>
              <View style={styles.section}>
                <View style={styles.profileimg2}>
                <Image source={require('../../../assets/images/red.png')}  />
                </View>
                 <View style={{width:"70%",paddingLeft:0}}>
                    <Text style={{fontSize:13,fontWeight:'bold',paddingTop:6}}> Not Delivered</Text>
                 </View>
              </View>
            </View>

            <View style={styles.item2}>
              <View style={styles.section}>
                <View style={styles.profileimg2}>
                <Image source={require('../../../assets/images/yellow.png')}  />
                </View>
                 <View style={{width:"70%",paddingLeft:0}}>
                    <Text style={{fontSize:13,fontWeight:'bold',paddingTop:6}}> Pending</Text>
                 </View>
              </View>
            </View>
              
          </View>
         

        { this.state.rescuelist == 'yes' ?

        <View style={{ width: '100%',height:"35%", backgroundColor:"#fff",padding:5 }}>
          <ScrollView>
            <View> 

             <View style={{flexDirection:'row',padding:10,backgroundColor:'#cbf2fc',borderRadius:15,marginBottom:2}}>
                    <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                      <Image style={{paddingTop:15}} source={require('../../../assets/images/startpoint.png')}  />
                      </View>
                    <View style={{width:"85%",paddingLeft:10}}>
                      <Text style={{fontSize:18,fontWeight:'bold',paddingTop:0,color:"#000"}}>Start Point</Text>
                      <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#000"}}>
                     {this.state.rescue_strtingAddress}</Text>
                    </View>
            </View> 

         {

          this.state.FlatListItems.map((item, index) => {

                  if(item.sequence !=0){ 

                  if (item.status == 'active'){

                  return (
                   <View style={{flexDirection:'row',padding:10,backgroundColor:'#f3aa00',borderRadius:15,marginBottom:2}}>
                      <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                      <Text style={{color:'#f3aa00',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                      </View>
                      <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                      <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                        <TouchableOpacity onPress={()=> this.handleGetDirectionsFromList(item.lat,item.lng,item.address)}>
                        <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                        </TouchableOpacity>
                       </View>
                       <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10,paddingRight:25,flexDirection:"row"}}> 
                          <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}} onPress={()=> this.handleGetDirectionsFromList(item.lat,item.lng)}>
                          {item.address}
                         </Text>
                       </View>
                      </View>

                    </View> 
                    )
                   }

                 }

               })


             }

              {this.state.FlatListItems.map((item, index2) => {

                  if(item.sequence !=0){

                 
                  if (item.status == 'delivered'){

                  return (
                   <View style={{flexDirection:'row',padding:10,backgroundColor:'#00c2f3',borderRadius:15,marginBottom:2}}>
                      <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                      <Text style={{color:'#00c2f3',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                      </View>
                      <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                      <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                        <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                       </View>
                       <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}> 
                          <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                          {item.address}
                         </Text>
                       </View>
                      </View>

                    </View> 
                    )
                   }
                   
                 }
                })}


              {this.state.FlatListItems.map((item, index3) => {

                  if(item.sequence !=0){

                 
                   if(item.status ==  'not-delivered' || item.status == 'return'){

                    return (
                   <View style={{flexDirection:'row',padding:10,backgroundColor:'#f32525',borderRadius:15,marginBottom:2}}>
                      <View style={{width:'15%',backgroundColor:'#fff',padding:20,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                      <Text style={{color:'#f32525',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                      </View>
                      <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                      <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                        <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                       </View>
                       <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}> 
                          <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                          {item.address}
                         </Text>
                       </View>
                      </View>

                    </View> 
                    )

                   }
                 }
               })}

          </View>
          </ScrollView>
        </View>

        :<View style={{ width: '100%',height:"35%", backgroundColor:"#fff",padding:5 }}>
          <ScrollView>
            <View>  

             <View style={{flexDirection:'row',padding:10,backgroundColor:'#cbf2fc',borderRadius:15,marginBottom:2}}>
                    <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                      <Image style={{paddingTop:15}} source={require('../../../assets/images/startpoint.png')}  />
                      </View>
                    <View style={{width:"85%",paddingLeft:10}}>
                      <Text style={{fontSize:16,fontWeight:'bold',paddingTop:0,color:"#000"}}>Start Point</Text>
                      <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#000"}}>
                     {this.getaddress(this.state.maplatitude)}</Text>
                    </View>
            </View> 

         {

          this.state.FlatListItems.map((item, index) => {

                  if(item.sequence !=0){ 

                  if (item.status == 'active' && item.rescue == 'no'){

                    if(item.is_skip_stop == 'yes')  {

                      return (
                       <View style={{flexDirection:'row',padding:10,backgroundColor:'#000',borderRadius:15,marginBottom:2}}>
                          <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                          {item.nearby != '' ?
                          <Text style={{color:'#f3aa00',fontWeight:'bold',fontSize:13}}>{item.nearbytitle}</Text>
                          :<Text style={{color:'#f3aa00',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                        }
                          </View>
                          <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>

                            <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10,width:'10%'}}>
                            <TouchableOpacity onPress={()=> this.handleGetDirectionsFromList(item.lat,item.lng,item.address)}>
                            <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                            </TouchableOpacity>
                            </View>
                            <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10,paddingRight:25,flexDirection:"row",width:'80%'}}> 
                              <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}} onPress={()=> this.handleGetDirectionsFromList(item.lat,item.lng)}>
                              {item.address}
                            
                             </Text>
                            </View>
                            <View style="{{justifyContent: 'center',alignItems: 'center',width:'10%'}}">
                            
                            </View>

                          </View>

                        </View> 
                        )
                      }
                      else{
                          return (
                           <View style={{flexDirection:'row',padding:10,backgroundColor:'#f3aa00',borderRadius:15,marginBottom:2}}>
                              <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                               {item.nearby != '' ?
                          <Text style={{color:'#f3aa00',fontWeight:'bold',fontSize:13}}>{item.nearbytitle}</Text>
                          :<Text style={{color:'#f3aa00',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                        }
                              </View>
                              <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>

                                <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10,width:'10%'}}>
                                <TouchableOpacity onPress={()=> this.handleGetDirectionsFromList(item.lat,item.lng,item.address)}>
                                <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                                </TouchableOpacity>
                                </View>
                                <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10,paddingRight:25,flexDirection:"row",width:'80%'}}> 
                                  <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}} onPress={()=> this.handleGetDirectionsFromList(item.lat,item.lng)}>
                                  {item.address}
                                
                                 </Text>
                                </View>
                                <View style="{{justifyContent: 'center',alignItems: 'center',width:'10%'}}">
                                
                                </View>

                              </View>

                            </View> 
                        )
                      }

                   }

                 }

               })


             }

              {this.state.FlatListItems.map((item, index2) => {

                  if(item.sequence !=0){

                 
                  if (item.status == 'delivered' && item.rescue == 'no'){
                  if(item.is_skip_stop == 'yes')  {
                  return (
                   <View style={{flexDirection:'row',padding:10,backgroundColor:'#000',borderRadius:15,marginBottom:2}}>
                      <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                       {item.nearby != '' ?
                          <Text style={{color:'#000',fontWeight:'bold',fontSize:13}}>{item.nearbytitle}</Text>
                          :<Text style={{color:'#000',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                        } 
                      </View>
                      <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                      <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                        <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                       </View>
                       <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}> 
                          <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                          {item.address}
                         </Text>
                       </View>
                      </View>

                    </View> 
                    )
                  }
                  else{
                    return (
                   <View style={{flexDirection:'row',padding:10,backgroundColor:'#00c2f3',borderRadius:15,marginBottom:2}}>
                      <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                       {item.nearby != '' ?
                          <Text style={{color:'#00c2f3',fontWeight:'bold',fontSize:13}}>{item.nearbytitle}</Text>
                          :<Text style={{color:'#00c2f3',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                        } 
                      </View>
                      <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                      <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                        <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                       </View>
                       <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}> 
                          <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                          {item.address}
                         </Text>
                       </View>
                      </View>

                    </View> 
                    )
                  }

                }
                   
                 }
                })}


              {this.state.FlatListItems.map((item, index3) => {

                  if(item.sequence !=0){

                 
                   if(item.status ==  'not-delivered' || item.status == 'return' && item.rescue == 'no'){

                    if(item.is_skip_stop == 'yes')  {

                      return (
                       <View style={{flexDirection:'row',padding:10,backgroundColor:'#000',borderRadius:15,marginBottom:2}}>
                        <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                         {item.nearby != '' ?
                            <Text style={{color:'#000',fontWeight:'bold',fontSize:13}}>{item.nearbytitle}</Text>
                            :<Text style={{color:'#000',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                          }
                        </View>
                        <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                        <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                          <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                         </View>
                         <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}> 
                            <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                            {item.address}
                           </Text>
                         </View>
                        </View>

                        </View>  
                        )
                      }
                      else{

                    return (
                   <View style={{flexDirection:'row',padding:10,backgroundColor:'#f32525',borderRadius:15,marginBottom:2}}>
                      <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                       {item.nearby != '' ?
                          <Text style={{color:'#f32525',fontWeight:'bold',fontSize:13}}>{item.nearbytitle}</Text>
                          :<Text style={{color:'#f32525',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                        }
                      </View>
                      <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                      <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                        <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                       </View>
                       <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}> 
                          <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                          {item.address}
                         </Text>
                       </View>
                      </View>

                    </View> 
                    )
                  }

                   }
                 }
               })}

              {this.state.FlatListItems.map((item, index4) => {

                  if(item.sequence !=0){

                 
                   if(item.rescue == 'yes'){
                   
                    return (
                   <View style={{flexDirection:'row',padding:10,backgroundColor:'gray',borderRadius:15,marginBottom:2}}>
                      <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                       {item.nearby != '' ?
                          <Text style={{color:'#f3aa00',fontWeight:'bold',fontSize:13}}>{item.nearbytitle}</Text>
                          :<Text style={{color:'#f3aa00',fontWeight:'bold',fontSize:13}}>{this.convertnumber(Number(item.sequence))}</Text>
                        }
                      </View>
                      <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                      <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                        <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                       </View>
                       <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}> 
                          <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                          {item.address}
                         </Text>
                       </View>
                      </View>

                    </View> 
                    )

                   }
                 }
               })}
   
          </View>
          </ScrollView>
        </View>
        }

    </Animated.View> 
   }
    </View>
   

    <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalDefault}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
      > 
      <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{marginBottom:20,textAlign:'center',fontSize:18}}>We have created default Route for you. Do you want to choose last stop?</Text>
            <View style={{marginBottom:10,width:100}}>
              <Button style={{marginTop:20}} title="Yes" onPress={() => this.showcustomroutemodal()}/>
            </View>
            <View style={{marginBottom:10,width:100}}>
            <Button style={{marginTop:20}} title="No" onPress={() => this.canceldefaultRoute()}/>
            </View>
        </View>  
    </View>
    </Modal>

    <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.CustomRouteModal}
        onRequestClose={() => { 
          Alert.alert("Modal has been closed.");
          
        }}
      > 
      <View style={styles.centeredView}>
          <View style={styles.modalView}>
           
                <View style={{ width:'100%'}}>
                  <View style={{ marginBottom:20,width:'100%'}}>
                    <Text style={{fontSize:16,fontWeight:'bold',width:300}}>Start Stop:</Text>
                   <Select
                      selectedValue={this.state.selectedfirst}
                      label="Select Start Point"
                      placeholder={'Select Start Point'}
                      placeholderStyle={{color: '#000'}}
                      style={{ height: 50, width: 300  }}
                      onValueChange={(itemValue, itemIndex) => this.setState({selectedfirst:itemValue})}
                    >
                      <Select.Item label="Select Start Point" value="Select Start Point" />
                      { this.state.CustomRoutePoints.map((item, startpoint) => {
                        var add = item.sequence+'. '+item.address.toString();
                      
                        return(
                      <Select.Item key={startpoint} label={add} value={item.stop_id} />
                      )
                      })}
                    </Select>
                  </View> 
                  <View style={{marginBottom:20,width:'100%'}}> 
                    <Text style={{fontSize:16,fontWeight:'bold',width:300}}>End Stop:</Text>
                   <Select
                      selectedValue={this.state.selectedsecond}
                      label="Select Last Point"
                      placeholder={'Select Last Point'}
                      placeholderStyle={{color: '#000'}}
                      style={{ height: 50, width: 300 }}
                      onValueChange={(itemValue, itemIndex) => this.storeLastpoint(itemValue)}
                    >
                      <Select.Item label="Select Last Point" value="Select Last Point" />
                     { this.state.safeZonStops.map((item, startpoint) => {
                        // console.log(item.address)
                        return(
                      <Select.Item key={startpoint} label={item.Warehouse_address.toString()} value={item.warehouse_id} />
                      )
                      })}
                    </Select>
                  </View>
                  <View style={{marginBottom:10,width:300}}>
                    <Button style={{marginTop:20}} title="Optimize" onPress={() => this.optimizeCustomRoute()}/>
                  </View>
                  <View style={{marginBottom:10,width:300}}>
                  <Button style={{marginTop:20}} title="Cancel" onPress={() => this.canceloptimize()}/>
                  </View>
                </View>
            
        </View>   
    </View>
    </Modal>

        <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.fuelstationpopup}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
      > 
        <View style={styles.centeredView}>
            <View style={styles.modalView}>   
              <View style={{flexDirection:'row',width:'100%',marginTop:0}}>
                <ImageBackground source={require('../../../assets/images/fuel.png')} style={styles.imagemarker}>
                 
                </ImageBackground>
             </View>
             <View style={{flexDirection:'row',width:'100%',marginTop:20}}>
                <Text style={{textAlign:'left',fontWeight:'bold',width:'30%'}}>Address: </Text>
                <Text style={{textAlign:'left',width:'70%'}}>{this.state.fuelstationCoordinate.full_address}</Text>
             </View>
             <View style={{width:'33%',marginTop:10, textAlign:'center'}}>
                  <TouchableOpacity onPress={() => this.closeFuelStationPupup()}>
                    <Ionicons name="close" size={30} color="#02c2f3" style={{textAlign:'center'}} />
                    <Text style={{textAlign:'center'}}>Close</Text>
                  </TouchableOpacity> 
                </View>

              
          </View>  
      </View>
      </Modal>

    <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.popupfornewStop}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
      > 
        <View style={styles.centeredView}>
            <View style={styles.modalView}>   
              <View style={{flexDirection:'row',width:'100%',marginTop:0}}>
                <ImageBackground source={require('../../../assets/images/newstop.png')} style={styles.imagemarker}>
                  {this.state.currentCoordinate.nearby != "" ?
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{this.state.currentCoordinate.nearbytitle}</Text>
                  :<Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{this.state.currentCoordinate.sequence}</Text>
                }
                  </ImageBackground>
             </View>
             <View style={{flexDirection:'row',width:'100%',marginTop:20}}>
                <Text style={{textAlign:'left',fontWeight:'bold',width:'30%'}}>Address: </Text>
                <Text style={{textAlign:'left',width:'70%'}}>{this.state.currentCoordinate.address}</Text>
             </View>
             <View style={{flexDirection:'row',width:'100%',marginTop:20}}>
                <Text style={{textAlign:'left',fontWeight:'bold',width:'30%'}}>Customer: </Text>
                <Text style={{textAlign:'left',width:'70%'}}>{this.state.currentCoordinate.customer_name}</Text>
             </View>
              <View style={{flexDirection:'row',width:'100%',marginTop:20}}>
             
                
                <View style={{width:'33%',textAlign:'center'}}>
                <TouchableOpacity  onPress={()=> this.handleGetDirections(this.state.currentCoordinate)}>
                  <Ionicons name="navigate" size={30} color="#02c2f3" style={{textAlign:'center'}} />
                  <Text style={{textAlign:'center'}}>Navigate</Text>
                </TouchableOpacity>
                </View>
 
                 <View style={{width:'33%',textAlign:'center'}}>
                 <TouchableOpacity onPress={() => this.addStop()}>
                    <Ionicons name="add" size={30} color="#02c2f3" style={{textAlign:'center'}} />
                    <Text style={{textAlign:'center'}}>Add Stop</Text>
                  </TouchableOpacity>
                </View>

                <View style={{width:'33%',textAlign:'center'}}>
                  <TouchableOpacity onPress={() => this.showSkipModal()}>
                    <Ionicons name="arrow-forward" size={30} color="#02c2f3" style={{textAlign:'center'}} />
                    <Text style={{textAlign:'center'}}>Skip</Text>
                  </TouchableOpacity> 
                </View>  
 
                <View style={{width:'33%',textAlign:'center'}}>
                  <TouchableOpacity onPress={() => this.closeStop()}>
                    <Ionicons name="close" size={30} color="#02c2f3" style={{textAlign:'center'}} />
                    <Text style={{textAlign:'center'}}>Close</Text>
                  </TouchableOpacity> 
                </View>

              </View>

              
          </View>  
      </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.skipmodals}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
      > 
      <View style={styles.centeredView}>
          <View style={styles.modalView}>
              <View style={{flexDirection:'row',width:'100%',marginTop:0}}>
                <ImageBackground source={require('../../../assets/images/newstop.png')} style={styles.imagemarker}>
                {this.state.currentCoordinate.nearby != "" ?
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{this.state.currentCoordinate.nearbytitle}</Text>
                  :<Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>{this.state.currentCoordinate.sequence}</Text>
                }
                  </ImageBackground>
             </View>
              <View style={{flexDirection:'row',width:'100%',marginTop:20}}>
                <Text style={{textAlign:'left',fontWeight:'bold',width:'30%'}}>Address: </Text>
                <Text style={{textAlign:'left',width:'70%'}}>{this.state.currentCoordinate.address}</Text>
             </View>
             <View style={{flexDirection:'row',width:'100%',marginBottom:20}}>
                <Text style={{textAlign:'left',fontWeight:'bold',width:'30%'}}>Customer: </Text>
                <Text style={{textAlign:'left',width:'70%'}}>{this.state.currentCoordinate.customer_name}</Text>
             </View>
                <View style={{ width:'100%'}}>
                  
                  <TextInput multiline = {true} numberOfLines = {10} placeholder={'Enter The Skip Reason'} style={{fontSize:16, paddingLeft:10,justifyContent:"flex-start", borderColor: '#00c2f3',backgroundColor:'white', borderWidth: 1,borderRadius: 5,marginBottom:20, height:80,width:300 }} onChangeText={text => this.setState({skipcomment:text})} value={this.state.skipcomment}/>
                  
               </View>
               <View style={{marginBottom:10,width:300}}>
                    <Button style={{marginTop:20}} title="Submit" onPress={() => this.Skiproute()}/>
                  </View>
                <View style={{marginBottom:10,width:300}}>
                <Button style={{marginTop:20}} title="Cancel" onPress={() => this.Skiprouteclose()}/>
                </View>
        </View>   
    </View>
    </Modal>
    <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.deliveryModal}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
      > 
      <View style={styles.centeredView}>
          <View style={styles.modalView}>
           
                <View style={{ width:'100%'}}>
                  
                  <View style={{marginBottom:20,width:'100%'}}> 
                    <Text style={{fontSize:16,fontWeight:'bold',width:300}}>End Stop:</Text>
                   <Select
                      selectedValue={this.state.selectedsecond}
                      label="Select Last Point"
                      placeholder={'Select Last Point'}
                      placeholderStyle={{color: '#000'}}
                      style={{ height: 50, width: 300 }}
                      onValueChange={(itemValue, itemIndex) => this.storeLastpoint(itemValue)}
                    >
                      <Select.Item label="Select Last Point" value="Select Last Point" />
                     { this.state.safeZonStops.map((item, startpoint) => {
                        // console.log(item.address)
                        return(
                      <Select.Item key={startpoint} label={item.Warehouse_address.toString()} value={item.warehouse_id} />
                      )
                      })}
                    </Select>
                  </View>
                  <View style={{marginBottom:10,width:300}}>
                    <Button style={{marginTop:20}} title="Optimize" onPress={() => this.optimizeAfterDeliveryRoute()}/>
                  </View>
                 
                </View>
            
        </View>   
    </View>
    </Modal>


      {this.state.showview == "map" &&
      <View style={{flexDirection:"row"}}>
      <Text style={{paddingTop:20,paddingLeft:10, width:"50%", fontWeight:"bold"}}>Total Distance: {this.state.totalDistance} KM</Text>
      <Text style={{paddingTop:20,paddingLeft:10, width:"50%", fontWeight:"bold"}}>Total Duration: {Math.round(this.state.totalDuration)} MIN</Text>
      </View>
    }
     {this.state.isloading && (
              <Loader />
          )}
    </View>
    );
  }
}

const styles = StyleSheet.create({
   buttonlogout:{
    marginTop:20,
  },
   centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    backgroundColor:"#1c1e2136",

  },
  modalView: {
  margin: 20,
  backgroundColor: "white",
  borderRadius: 20,
  padding: 35,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 5,
    height: 2
  },

},
  container: {
  flex:1,
  width:'100%',
  height:'90%',
  justifyContent: 'center',
  backgroundColor:"#fff",
  alignContent: 'center',
  },
  welcome: {
    fontSize: 20,  
    textAlign: 'left',
    margin: 10,
    paddingTop:40,
    color:"#000"

  },
  list: {
    fontSize: 20,  
    textAlign: 'right',
    margin: 10,
    paddingTop:20,

  },
  picker: {
    width: 100,
  },
  maps: {
    ...StyleSheet.absoluteFillObject

  },
   Active:{
    color: '#247ee8',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth :5,
    borderBottomColor: '#247ee8',
  },
  imgtext:{ 
    flexDirection:'row',
    alignItems:'center',
    width:"95%"
  },
  HeadStyle:{
    color: '#808080',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth :1,
    borderBottomColor: '#808080',
  },
  card:{
  flexDirection: "row",
  padding:20,

},
userImage:{
    height: 25,
    width: 25,
    alignSelf: 'flex-end',  

  },
  name:{
    fontSize:13,
    color:"#fff",
    fontWeight:'700',
    paddingLeft:20,
  },
  followButton: {
    marginTop:0,
    height:35,
    width:35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:80,
    backgroundColor: "#ea1780",
  },

  driverheader: {
    flexDirection: 'row',
    padding:10,
    marginTop:0,
    marginBottom:0,

   }, 
    DistanceHead: {
    flexDirection: 'row',
    padding:10,
    marginTop:0,
    marginBottom:0,

   }, 
  section: {
    flexDirection: 'row',
  },
  item: {
    width: '50%'
  },
  profileimg:{
    width:"30%",
    backgroundColor:"#000",
    padding:5,
    backgroundColor: "#247ee8",
    borderRadius:10
  },
   profileimg2:{
    width:"30%",
  },
  indication:{
    marginBottom:2,
    flexDirection: 'row',
    paddingLeft:10,
    paddingRight:10,
  },
  item2:{
    width: '33.333%'
  },
  subView: { 
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    height:500,
    marginBottom:15
  },
  imagemarker:{
    width:40,
    height:60,
    justifyContent: "center"
  }
}); 

export default Map;