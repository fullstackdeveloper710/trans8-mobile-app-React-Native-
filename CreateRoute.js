import React, {Component } from 'react';
import { LogBox,View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,TextInput,Dimensions, Platform,Modal,ActivityIndicator,ImageBackground} from 'react-native';
import { Select,Container,FlatlistContent, Header, Content, Form,Textarea, Item, Input, Label,Button, Toast, Icon, Accordion,Box,Stack,FormControl } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_retrieveData,_storeData,_storeNextPoint } from 'assets';
import styles from './styles';
import { getData,getUser,saveRouteInfo,saveLocation,getWarehouseById,markNumberToPackages,getRoutes ,getUpdatedPoints} from 'api';
import CustomHeader from '../../CustomHeader';
import Geolocation from 'react-native-geolocation-service';
import NetInfo from "@react-native-community/netinfo";
import { measureConnectionSpeed } from 'react-native-network-bandwith-speed';
LogBox.ignoreAllLogs(); 
import Modall from '../Modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

class CreateRoute extends Component {
constructor(props) {
  super(props); 
  this.state = {
    isloading: false, 
    tripBlock:false,
    shortBlock:false,
    driveBlock:false,
    avoidBlock:false,  
    route_name: '',
    notes: 'Notes',
    start_point_lat: '',
    start_point_long: '',
    trip_way: 'Round Trip',
    trip_way_type: 'Fastest',
    trip_type: 'Driving',
    trip_avoid: 'toll',
    location:'',
    longitude:null,
    latitude:null,
    user_avtar:'',
    warehouse_id:0,
    warehouses:[],
    show_warehouse:true,
    company_id:null,
    company_name:null,
    is_rescue:'no',
    modalVisible:false,
    is_help:false,
    newhours:'',
    route_distance:'',
    route_time:'',
    actual_route_time:'',
    customdata:{},
    heredata:{},
  };
  }

componentDidMount = () => {
  // this.getNewRoutes();
  this._unsubscribe = this.props.navigation.addListener('focus', () => {
    this.getCurrentPosition();

     _retrieveData('is_rescue').then((res) => {
          if(res == 'yes'){
            this.setState({is_rescue:'yes'})
          }
        });

    getUser().then((res) => {
      this.setState({
        route_name: res.route_name
      });
    }); 

    _retrieveData('user_avtar')
    .then((res) => {
      if(res != null){
        this.setState({user_avtar:res});
      }
    });

    _retrieveData('companyId')
    .then((res) => {
      if(res != null){
        this.setState({company_id:res});
      }
    });

    _retrieveData('companyName')
    .then((res) => {
      if(res != null){
        this.setState({company_name:res})
      }
    });

          getData('delivered_reasons').then((res) => {
            if(res.type == 1) {
            _storeData('delivered_reasons',res.data).then();
            }
          });

          getData('not_delivered_reasons').then((res) => {
            if(res.type == 1) {
            _storeData('not_delivered_reasons',res.data).then();
            }
          });

    _retrieveData('warehouse_id').then((res) => {
      if(res > 0){
        this.setState({
        warehouse_id: res,
        show_warehouse:false
      });
      } else {

        _retrieveData('companyId')
    .then((company_id) => {
      if(company_id != null){
         getWarehouseById(company_id).then((res) => {
          this.setState({warehouses:res.data.Warehouses,show_warehouse:true,warehouse_id: 0});
        });
      }
    });

         
      }
    }); 
  });
  
};

hideHelp = () => {
      this.setState({is_help:false});
    }


componentWillUnmount() {
  this._unsubscribe(); 
}


createRoute = () => {
  this.props.navigation.navigate('CreateRoute');
};


updateState = (_state) => {
  this.setState({[_state]: this.state[_state]});
}

saveData = () => {

    let currentLongitude = this.state.start_point_long;
    let currentLatitude = this.state.start_point_lat;

     if(this.state.start_point_long == '' || this.state.start_point_lat == '') {
      Geolocation.getCurrentPosition((position) => {
          
          currentLongitude = JSON.stringify(position.coords.longitude);
          currentLatitude = JSON.stringify(position.coords.latitude);

          this.setState({
          start_point_long: currentLongitude,
          start_point_lat: currentLatitude
          });
            },
            (error) => {
              this.setLocationStatus(error.message+" Please try again");
            },
            {
        enableHighAccuracy: false,
        timeout: 15000
      });
  } 

  let route_name = this.state.route_name;
  let notes = this.state.notes;
  let start_point_lat = this.state.start_point_lat;
  let start_point_long = this.state.start_point_long;
  let trip_way = this.state.trip_way;
  let trip_way_type = this.state.trip_way_type;
  let trip_type = this.state.trip_type;
  let trip_avoid = this.state.trip_avoid;
  let warehouse_id = this.state.warehouse_id;
  let company_id = this.state.company_id;
  let is_rescue = this.state.is_rescue;

  const _this = this;
  var postdata = { is_rescue_route:is_rescue,route_name:route_name, notes:notes,start_point_lat:start_point_lat,
  start_point_long:start_point_long,trip_way:trip_way,trip_way_type:trip_way_type,trip_type:trip_type, trip_avoid:trip_avoid,warehouse_id:warehouse_id,company_id:company_id};

  if(route_name == ''){
    _showErrorMessage('Route name field is requried');
    return false;
  }

  if(notes == ''){
    _showErrorMessage('Notes field is requried');
    return false;
  }

  if(this.state.warehouse_id == 0){
    _showErrorMessage('Warehouse is requried');
    return false;
  }

  this.checkNetwork();
 
  this.setState({ modalVisible: true });
 
  saveRouteInfo(postdata).then((res) => {
    this.setState({ isloading: false });
      if(res.type == 1) {
          _showSuccessMessage(res.message);
            if(res.data.is_rescue_route == 'no'){
              // this.getNewRoutes();

              let myInterval = setInterval(function () {

                 getData('check_is_sequence_created').then((res2) => {
                    if(res2.type == 1) {
                      if(res2.data == "yes"){
                        clearInterval(myInterval);
                        _this.setState({ modalVisible: false }); 
                        _this.props.navigation.navigate('REMAP');
                      }
                      else{
                        _showErrorMessage('Your Route sequence are in progress. Please wait.');
                      }
                    }

                    else{
                      _showErrorMessage(res2.message);
                    }

                  });

               
              }, 10000);
            }
            else{
                _this.setState({ modalVisible: false }); 
                _this.props.navigation.navigate('StartDayReport');
            }
          } else {
      this.setState({ modalVisible: false });     
      _showErrorMessage(res.message);
    }
}).catch(function (error) {
  
  this.setState({ modalVisible: false });
  _showErrorMessage(error.message); 
            
});
};

 myTimer() {
  const date = new Date();
  document.getElementById("demo").innerHTML = date.toLocaleTimeString();
}
async getNewRoutes(){

this.setState({ modalVisible: true });

await getRoutes().then((res) => {
  // console.log(res.data.lat_long);
  if(res.type == 1){ 
      
      //live
      var url = 'https://wse.ls.hereapi.com/2/findsequence.json?apiKey=wSg9ZNFX0A6AGmgaH7Euid5UQM2yFgtubg1_FfO-iIg&start='+res.data.lat_long[0].latitude+','+res.data.lat_long[0].longitude+'&improveFor=distance&mode=fastest;car;traffic:disabled;&';
      // var url = 'https://wse.ls.hereapi.com/2/findsequence.json?apiKey=X-DD8Iw__H4RqFN03BfC3kBpmITPClOO9kk_xoVFGlc&start='+res.data.lat_long[0].latitude+','+res.data.lat_long[0].longitude+'&improveFor=distance&mode=shortest;car;traffic:disabled;&';
      var count = 0;
      var string = url;
      for (const key of res.data.lat_long) {
          // console.log(count)
          if(count != 0){
          
            string+= 'destination'+count+'='+key.barcode+';'+key.latitude+','+key.longitude+'&'
          }

          count++;
      }
     // console.log(string);

      

      this.sequenceWaypoints(string,res.data.lat_long);

  }
  else{
    _showErrorMessage(res.message);
    this.setState({ modalVisible: false });
  }


})

}

async sequenceWaypoints(url,data){

 await fetch(url,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }       
  })

  .then(response => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
   response.json().then(res => {
  if(res.results != null){

      const markersData = [];

      const _this = this; 
      
      
      var savedata = [];
      
      for (var i = 0; i < res.results[0].waypoints.length; i++) {

        var address = this.getaddress(data,res.results[0].waypoints[i].id);

        
        if(i == 0){
          savedata.push({barcode:res.results[0].waypoints[i].id,lat: res.results[0].waypoints[i].lat, lng:res.results[0].waypoints[i].lng,sequence:res.results[0].waypoints[i].sequence,eta:0,distance:0});
        }
        else{

        savedata.push({barcode:res.results[0].waypoints[i].id,lat: res.results[0].waypoints[i].lat, lng:res.results[0].waypoints[i].lng,sequence:res.results[0].waypoints[i].sequence,eta:res.results[0].interconnections[i-1].time,distance:res.results[0].interconnections[i-1].distance});
        }
      }

      this.setState({heredata:{data:savedata,distance:res.results[0].distance,time:res.results[0].time}})
  
  }
  else 
  {
     this.setState({heredata:{data:[],distance:0,time:0}})
    
  }
 
  })

  } else {
     response.text().then(text => {
      this.setState({heredata:{data:[],distance:0,time:0}})
    });
  }
});

  
  await this.createCustomSequence(data);
    const formdata = new FormData();
    const _this = this;
   if(this.state.heredata.data.length > 0){
    
      if(this.state.heredata.distance < this.state.customdata.distance && this.state.heredata.distance != 0){
            var route_distance = parseFloat(this.state.heredata.distance/1000).toFixed(2)+' KM';
            var additional = this.state.heredata.data.length*3;
            var combaine = this.state.heredata  .time/60;

            var time = parseFloat(additional+combaine).toFixed(2);
            
            var route_time = this.timeConvert(time);
            var actual_route_time = this.timeConvert(combaine); 

              formdata.append('number_packages', JSON.stringify(this.state.heredata.data));
              formdata.append('route_distance',  route_distance);
              formdata.append('route_time',  route_time);
              formdata.append('actual_route_time',  actual_route_time);
              formdata.append('is_custom_route',  'no');
              formdata.append('is_custom_sequence',  'no');
              // console.log("here");
            this.setState({route_distance:route_distance,route_time:route_time,actual_route_time:actual_route_time});
      }
      else{

          var route_distance = parseFloat(this.state.customdata.distance/1000).toFixed(2)+' KM';
          var additional = this.state.customdata.length*3;
          var combaine = this.state.customdata  .time/60;

          var time = parseFloat(additional+combaine).toFixed(2);
          var route_time = this.timeConvert(time);
          var actual_route_time = this.timeConvert(combaine); 

            formdata.append('number_packages', JSON.stringify(this.state.customdata.data));
            formdata.append('route_distance',  route_distance);
            formdata.append('route_time',  route_time);
            formdata.append('actual_route_time',  actual_route_time);
            formdata.append('is_custom_route',  'no');
            formdata.append('is_custom_sequence',  'yes');
          this.setState({route_distance:route_distance,route_time:route_time,actual_route_time:actual_route_time});
      }

  }
  else{
          var route_distance = parseFloat(this.state.customdata.distance/1000).toFixed(2)+' KM';
          var additional = this.state.customdata.length*3;
          var combaine = this.state.customdata  .time/60;

          var time = parseFloat(additional+combaine).toFixed(2);
          var route_time = this.timeConvert(time);
          var actual_route_time = this.timeConvert(combaine); 

          formdata.append('number_packages', JSON.stringify(this.state.customdata.data));
          formdata.append('route_distance',  route_distance);
          formdata.append('route_time',  route_time);
          formdata.append('actual_route_time',  actual_route_time);
          formdata.append('is_custom_route',  'no');
          formdata.append('is_custom_sequence',  'yes');
          this.setState({route_distance:route_distance,route_time:route_time,actual_route_time:actual_route_time});
  }


    markNumberToPackages(formdata).then((res) => {

      if(res.type == 1){
           _showSuccessMessage(res.message);
          this.setState({ modalVisible: false });
          _storeNextPoint(null); 
          setTimeout(function(){
          // _this.props.navigation.navigate('PackageNumbering');
          _this.setState({ modalVisible: false });
          _this.props.navigation.navigate('REMAP')

        }, 30);
      }
      else
      {
         _showErrorMessage(res.message);  
        this.setState({ modalVisible: false });
       }


    }) 

  
}
createCustomSequence =  async(data) => {

    const _this = this; 

    var sequenceWaypoint = [{lat:data[0].latitude,lng:data[0].longitude,barcode:data[0].barcode,distance:0}];

    var checkarray = [data[0].barcode];
    var data2 = data;
    var startlat = data[0].latitude;
    var startlon = data[0].longitude;

    for (var key in data) {
 
      var distarray = []

        for (var i = 0; i < data2.length; i++) {
          if(!checkarray.includes(data[i].barcode)){
              
              var dist = this.distance(startlat,startlon,data2[i].latitude,data2[i].longitude,'K');

              distarray.push({lat:data2[i].latitude,lng:data2[i].longitude,barcode:data2[i].barcode,distance:dist})
            
          }
         
        }
        
        var sortData = distarray.sort(function(a, b) { 
          return a.distance - b.distance;
        });
        if (typeof sortData[0] !== 'undefined') {
           startlat = sortData[0].lat;
           startlon = sortData[0].lng;
           checkarray.push(sortData[0].barcode)
           sequenceWaypoint.push(sortData[0]) 
         }

         
    }

    await this.addtimeanddistance(sequenceWaypoint);
   // console.log(this.state.customdata); 
} 

async addtimeanddistance(sequenceWaypoint){
    var savedata = [];

    var totaldistance = [];
    var totalduration = [];
    var stlat = sequenceWaypoint[0].lat;
    var stlng = sequenceWaypoint[0].lng;

    // console.log(stlat);

    for (var i = 0; i < sequenceWaypoint.length; i++) {
      // console.log("here");
       var lslat = sequenceWaypoint[i].lat;
       var lslng = sequenceWaypoint[i].lng;
       var url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins="+stlat+","+stlng+"&destinations="+lslat+","+lslng+"&key=AIzaSyD77xQgaxmXZuBCzVkgTEA0sJytAyYVU2k";
        await fetch(url,{
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }       
      })
      .then((response) => response.json())
      .then((res) => {
            if (res.status !== 'OK') {

              savedata.push({barcode:sequenceWaypoint[i].barcode,lat: sequenceWaypoint[i].lat, lng:sequenceWaypoint[i].lng,sequence:i,eta:0,distance:0}) 
              totaldistance.push(0);
              totalduration.push(0);
            }
            else{
                savedata.push({barcode:sequenceWaypoint[i].barcode,lat: sequenceWaypoint[i].lat, lng:sequenceWaypoint[i].lng,sequence:i,eta:res.rows[0].elements[0].duration.value,distance:res.rows[0].elements[0].distance.value})
                totaldistance.push(res.rows[0].elements[0].distance.value);
                totalduration.push(res.rows[0].elements[0].duration.value);
            }
          })

          stlat = sequenceWaypoint[i].lat;
          stlng = sequenceWaypoint[i].lng;
        }

      totaldistance = totaldistance.reduce((a, b) => a + b, 0);
      totalduration = totalduration.reduce((a, b) => a + b, 0);
     this.setState({customdata:{data:savedata,distance:totaldistance,time:totalduration}})   

}


timeConvert(n) {

var minutes = n;
var hours = (minutes / 60);
var rminutes = Math.floor(minutes);
var rhours = Math.floor(hours);
var minutes2 = (hours - rhours) * 60;


return rhours + " HRS " + Math.floor(minutes2) + " MIN";
}
getaddress(data,barcode){
 
   for (const key of data) {
        if(key.barcode == barcode){
          return key.address;
        }

     }
}
distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
}

updateValue = (cname,_state) => {
  this.setState({[_state]: cname});
};

setCurrentLongitude(longitude){
  let longitude_ = parseFloat(longitude).toFixed(4);
  this.setState({
    start_point_long: longitude_,
  });
} 

setCurrentLatitude(latitude){
  let latitude_ = parseFloat(latitude).toFixed(4);
  this.setState({
    start_point_lat: latitude_,
  });
}

setLocationStatus(error){
  _showErrorMessage(error);
}

setTripWapType = () => {
  this.setState({shortBlock: !this.state.shortBlock,trip_way_type: this.state.trip_way_type == 'Fastest'?'Shortest':'Fastest'});
}

setTripWap = () => {
  this.setState({tripBlock: !this.state.tripBlock,trip_way:this.state.trip_way == 'Round Trip'?'One Way':'Round Trip'});
}

setTripType = () => {
  this.setState({driveBlock: !this.state.driveBlock,trip_type:this.state.trip_type == 'Driving'?'Biking':'Driving'});
}

getCurrentPosition() {
  Geolocation.getCurrentPosition(
    (position) => {
    //setLocationStatus('You are Here');

    //getting the Longitude from the location json
    const currentLongitude = 
      JSON.stringify(position.coords.longitude);

    //getting the Latitude from the location json
    const currentLatitude = 
      JSON.stringify(position.coords.latitude);

    //Setting Longitude state
    this.setCurrentLongitude(currentLongitude);
    
    //Setting Longitude state
    this.setCurrentLatitude(currentLatitude);
    var postdata = { latitude: currentLatitude,longitude:currentLongitude };
    saveLocation(postdata)
      .then((res) => {
        // console.log(res);
      });
  },
  (error) => {
    this.getCurrentPosition2();
  },
  {
    enableHighAccuracy: false,
    timeout: 30000,
    maximumAge: 1000
  },
    );
}


getCurrentPosition2() {
  // console.log("enter in location 2");
Geolocation.getCurrentPosition(
        (position) => {
          // console.log(position);
          this.setState({
          start_point_long: position.coords.longitude,
          start_point_lat: position.coords.latitude
        });
        },
        (error) => {
          // See error code charts below.
          _showErrorMessage(error.message)
          // console.log(error.code, error.message);
        },
        { enableHighAccuracy: false, timeout: 15000 }
    );
}

lapsList = () => {
 return this.state.warehouses.map((data) => {
  return (
    <Select.Item key={data.id} label = {data.Warehouse_name} value = {data.id} />
  )
})
}


updateWarehouses = (warehouse_id) => {
  if(warehouse_id > 0) {
    this.setState({ warehouse_id: warehouse_id });
  }
}

checkNetwork () {
  NetInfo.fetch().then(state => {
    if(state.isConnected == false) {
       this.setState({
        isloading: false,
      });
      _showErrorMessage('Your phone not connect with internet. Please try again');
      return false;
    } else {
     this.getNetworkBandwidth();
    }
  });
}


 getNetworkBandwidth = async (): Promise<void> => {
  try {
    const networkSpeed: NetworkBandwidthTestResults = await measureConnectionSpeed();
    if(networkSpeed.speed < 1){
    _showErrorMessage('Your internet speed is slow, Your net speed is '+networkSpeed.speed.toFixed(1)+' Mbps');
    
    } 
    } catch (err) {
      console.log(err);  
    }
  }

  refreshPage() {
    this.props.navigation.push('CreateRoute');
  }


render() {
  const {
    backButton,
    backSection,
    backIcon,
    backText,
    mainContainer1,
    itemLabel,
    itemValue,
    itemSection,
    spaceDivider,
    pickerStyle,
    pickerMain,
    roundIcon
  } = styles;
     
  return (
    <SafeAreaView style={{flex:1}}>
       <Box>
       {this.state.is_help?<Modall screen={'crete_route'} hideHelp={this.hideHelp} />:null}
        <CustomHeader {...this.props} url={this.state.user_avtar} />
        <View style={backSection}>
            <TouchableOpacity style={backButton} onPress={() => this.props.navigation.navigate('Route')}>
              <Icon type={FontAwesome} name='angle-left' style={backIcon}/>
              <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 5 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>CREATE ROUTE</Text>
            </TouchableOpacity>
             <TouchableOpacity onPress={() => this.setState({is_help:true})}>
            <Ionicons name={'help-circle'} size={35} color="#fff" />
          </TouchableOpacity>
            <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:8,fontWeight:200}} name='sync' />
          </TouchableOpacity>
        </View>
        <View style={spaceDivider}></View>
        <View style={{paddingLeft:10,paddingRight:10}}>
        
        <View style={spaceDivider}></View>
         {this.state.show_warehouse?(<View style={{flex:1, backgroundColor:'#00c2f3',borderRadius: 10}}>
              <Text style={{padding:15, fontSize:22,color:"#fff"}}>Choose Your Warehouse</Text>
              <View style={{width:Dimensions.get("window").width*0.85, marginLeft: 15}}>
              <Stack regular style={{ backgroundColor:'#fff', height:30 }} >
              
              <Select 
                style={{ fontWeight:200, fontSize:50, borderRadius:10, borderWidth: 5}}
                mode="dropdown"
                iosIcon={<Icon type={FontAwesome} name="angle-down" style={{ right:30, color: "#000"}} />}
                style={{ width: (Platform.OS == 'ios') ? Dimensions.get("window").width*0.95 :Dimensions.get("window").width*0.75 }}
                placeholder={'Select Comapny'}
                selectedValue = {this.state.warehouse_id}
                placeholderStyle={{color: '#000'}}
                onValueChange={(itemValue) =>  
                      this.updateWarehouses(itemValue)}>
                      <Select.Item  label = {'Select Warehouse'} value = {'0'} />
                {this.lapsList()}
              </Select>
              </Stack>
              </View>
            </View>):null}
        <View style={mainContainer1}>
          <View style={{padding:10}}>
          <Text style={{paddingBottom:10,fontSize:16,color:"#fff"}}>Route Name</Text>
          <TextInput placeholder = 'Enter Route Name' style={{fontSize:16,borderColor: '#00c2f3',backgroundColor:'white', borderWidth: 1, paddingLeft:10,borderRadius: 5, height:50 }}
                      onChangeText={text => this.setState({route_name:text})}
                      value={this.state.route_name}
                    />
         </View>
        <View style={{padding:10}}>
         <TextInput multiline = {true}
numberOfLines = {2} style={{fontSize:16, paddingLeft:10,justifyContent:"flex-start", borderColor: '#00c2f3',backgroundColor:'white', borderWidth: 1,borderRadius: 5, height:50 }} onChangeText={text => this.setState({notes:text})} value={this.state.notes}/>
        </View>
            <View style={itemSection}>
              <Text style={itemLabel}>Start Time:</Text>
              <Text style={itemValue}>TIME OFF OPTIMIZE</Text>
            </View>
             <View style={itemSection}>
              <Text style={itemLabel}>Start point:</Text>
              <Text style={itemValue}>{this.state.start_point_lat}-{this.state.start_point_long}</Text>
            </View>
          </View>
          <View style={spaceDivider}></View>
          <View style={{ flexDirection: 'row'}}>
            <Button 
                  style={{ height: 50, width:'45%', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
                  onPress={() => this.saveData()}>
                  <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>Submit</Text>
                </Button>
                <Button 
                  style={{  height: 50, width:'45%', marginLeft: 35,borderColor: '#00c2f3', borderWidth: 1, backgroundColor: 'white', justifyContent: 'center', borderRadius: 5}}
                  onPress={() => this.props.navigation.navigate('Route')} >
                  <Text style={{ textAlign: 'center', color: 'black', fontSize: 22 }}>Cancel</Text>
                </Button>
            </View>
            <View style={spaceDivider}></View>
            </View>
        </Box>
        
    <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
      > 
      <View style={{flex: 1,justifyContent: "center",alignItems: "center",marginTop: 0,backgroundColor:"#00000075"}}>
          <View style={styles.modalView}>
            
            <View style={{margin: 20,backgroundColor: "white",borderRadius: 20,padding: 35,alignItems: "center",shadowColor: "#000",shadowOffset: {
    width: 5,
    height: 2
  }
 }}> 
 
 <Text style={{alignItems: "center",textAlign:"center"}}>Please Wait. It may take 1 to 2 minutes to create sequence based on the number of stops.</Text>
 <ActivityIndicator color='#fc9f04' size={'large'} />

 </View>  
        </View>  
    </View>
      </Modal>
      {this.state.isloading && (
            <Loader />
        )}
        </SafeAreaView>

  );
  }
}

export default CreateRoute;