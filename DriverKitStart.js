import React, { Component } from 'react';
import { StyleSheet,View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView,Alert, Dimensions, Platform,Modal,TextInput,Linking} from 'react-native';
import { Picker,Container, Header, Box, Form, Item, Input, Label,Button, Toast, Icon,Switch,Card,CardItem,Body,FormControl,Stack } from 'native-base';
import { image, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_retrieveData,_retrieveUser,_storeData } from 'assets';
import { saveLocation ,getUser,getData,postData,postDataWithPic,getDataAwsRecog} from 'api';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../CustomHeader';
import Geolocation from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';
import { checkVersion } from "react-native-check-version";
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });
import { RNCamera } from 'react-native-camera';
import styless from './styles';
import * as ImagePicker from "react-native-image-picker"
import CheckBox from '@react-native-community/checkbox'; 
import QRCodeScanner from 'react-native-qrcode-scanner';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Modall from '../Modal';
import { flashon, flashoff } from '../../../store/actions/index.js';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


class DriverKitStart extends React.Component { 

constructor(props) {
    super(props);
      db.transaction(function (txn) {
      txn.executeSql( 
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_stops'",
        [],
        function (tx, res) {
            txn.executeSql('DROP TABLE IF EXISTS table_stops', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_stops(id INTEGER PRIMARY KEY AUTOINCREMENT, barcode VARCHAR(20), stop_id INT(10), address VARCHAR(255), customer_name VARCHAR(255),company_id VARCHAR(255),street_address VARCHAR(255),city VARCHAR(255),province VARCHAR(255),postal_code VARCHAR(255),email_address VARCHAR(255),phone_number VARCHAR(255),sync_status VARCHAR(10),is_exception_case VARCHAR(10),exception_case_pics VARCHAR(255),customer_address VARCHAR(255),delivery_status VARCHAR(15),reason_id INT(10),notes VARCHAR(255),gps_long VARCHAR(255),gps_lat VARCHAR(255),place_img VARCHAR(255),signature_img TEXT,sign_by VARCHAR(255),door_knocker_pic VARCHAR(255),door_knocker_barcode VARCHAR(255),apt_number VARCHAR(100),building_img VARCHAR(255),process_status VARCHAR(10),pod_photo_3 VARCHAR(255),pod_photo_4 VARCHAR(255),pod_photo_5 VARCHAR(255),,shipper_number VARCHAR(255),person_name VARCHAR(100))',
              []
            );
        }
      );
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_retaildrop');
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_rtw');
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_settlement');
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_inspection');
    });

    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_pickups');
    });
    this.state = {
      location:'',
      longitude:null,
      latitude:null,
      user_avtar:'',
      showPage: true,
      cid: 0,
      versionModal:false,
      KitQuestionList:[],
      qr_code:'',
      answer:[],
      questionIds:[],
      totalQuestionIds:[],
      placePic:null,
      isloading:false,
      battery_level: '',
      app_version:null,
      vehicle_plate:null,
      allFunc:true,
      notes:'',
      kit_alert_msg:'',
      fuel_card_number:null,
      is_block_profile:false,
      header_title:null,
      locationAttempt:0,
      imageScanAttempt:0,
      gps_long:'',
      gps_lat:'',
      is_help:false,
      kitAlert:false,
      rtwAlert2:false,
      rtwAlert:false,
      driverCodeScan:false,
      driver_rtw_parcel:false,
      rtwList:[],
      rtw_message:'Please return these packages to warehouse.',
      rtw_warehouse:'',
      rtw_date:'FEB 07, 2022',
      rtw_company:'HDS',
      vehicle_plate_number:'',
      vehicle_number:'',
      is_help:false,
      is_verify:false,
      full_name:null,
      user_image:null,
      driver_b_qr:'',
      driver_b_id:null,
      total_packages:0,
      total_stops:0,
      scanParcel:0,
      VerifyPackageCount:0,
      scanedRtwParcels:[],
      isSubmit:false,
      rtw_package_id:null,
      packages_photo:null,
      system_name:null,
      rtw_vehicle_check:false,
      is_redeliver:''
    };
    

  }

  checkRtwParcel () {
    this.setState({isloading:true});
   getData('rtw_safezone_parcel')
        .then((res) => {
         console.log(res,'gfhfhgf');
          if(res.type == 1){
            this.setState({
              rtwAlert:true,
              rtwList:res.data.packages_list,
              rtw_company:res.data.company_name,
              vehicle_plate_number:res.data.vehicle_plate_number,
              rtw_warehouse:res.data.rtw_warehouse,
              rtw_date:res.data.rtw_date,
              rtw_message:res.data.rtw_message,
              vehicle_number:res.data.vehicle_number,
              is_redeliver:res.data.is_redeliver_packages_found,
              isloading:false
            });
            setTimeout(function(){
                 Alert.alert(
                'RTW INFO',
                'If you will going '+res.data.rtw_warehouse+' warehouse then click on "RETURN TO WAREHOUSE" otherwise select "GIVE TO DRIVER" button and give parcel any driver who will go same warehouse.',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
                }, 2000);
           
          } else {
            this.setState({rtwAlert:false});
             this.setState({isloading:false});
          }
        });
  }

_isRtwAction(type) {
     Alert.alert(
                "Continue",
                "Are you sure with this 'RETURN TO WAREHOUSE' Option",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log(),
                    style: "cancel"
                  },
                  { text: "Yes", onPress: () => {
                       var postdata = {handover_to:type};
         console.log(postdata);
          postData(postdata,'rtw_package_handoverto').then((res) => {
          console.log(res);
                if(res.type == 1) {
                      this.setState({isloading: false,rtwAlert:false});
                    _showSuccessMessage(res.message);
                } else {
                   this.setState({isloading: false,rtwAlert:false});
                  _showErrorMessage(res.message);
                }
              });
         } 
                  }
                ],
                { cancelable: false }
      );
  }


_isRtwAction2(type) {
     Alert.alert(
                "Continue",
                "Are you sure with this 'RETURN TO WAREHOUSE' Option 1",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log(),
                    style: "cancel"
                  },
                  { text: "Yes", onPress: () => {
                       var postdata = {handover_to:type,kit_barcode:this.state.qr_code,vehicle_pkg_check:'yes'};
              console.log(postdata);
              postData(postdata,'vehicle_rtw_package_handoverto').then((res) => {
              console.log(res);
                if(res.type == 1) {
                      this.setState({isloading: false,rtwAlert2:false});
                    _showSuccessMessage(res.message);
                } else {
                   this.setState({isloading: false,rtwAlert2:false});
                  _showErrorMessage(res.message);
                }
              });
         } 
                  }
                ],
                { cancelable: false }
      );
  }


     _giveTodriver2() {

    Alert.alert(
                "Continue",
                "Are you sure with this 'GIVE TO DRIVER' Option 1",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log(),
                    style: "cancel"
                  },
                  { text: "Yes", onPress: () => {
                                var postdata = {handover_to:'driver',kit_barcode:qr_code,vehicle_pkg_check:'yes'};
                      console.log(postdata);
                      postData(postdata,'vehicle_rtw_package_handoverto').then((res) => {
                        if(res.type == 1) {
                              this.setState({isloading: false,rtwAlert2:false,driverCodeScan:true});
                              _showSuccessMessage(res.message);
                        } else {
                           this.setState({isloading: false,rtwAlert2:false});
                          _showErrorMessage(res.message);
                        }
                      });

                      } 
                  }
                ],
                { cancelable: false }
              );
    
  }

  _redeliver_package(){
    Alert.alert(
                "Continue",
                "Are you sure with this 'REDELIVER'",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log(),
                    style: "cancel"
                  },
                  { text: "Yes", onPress: () => {
                                var postdata = {handover_to:'redeliver'};
                     
                      postData(postdata,'rtw_package_redeliver').then((res) => {
                        if(res.type == 1) {
                               this.setState({isloading: false,rtwAlert:false});
                              _showSuccessMessage(res.message);
                        } else {
                           this.setState({isloading: false,rtwAlert2:false,rtwAlert:false});
                          _showErrorMessage(res.message);
                        }
                      });

                      } 
                  }
                ],
                { cancelable: false }
              );
    
  }

   _giveTodriver() {

    Alert.alert(
                "Continue",
                "Are you sure with this 'GIVE TO DRIVER' Option",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log(),
                    style: "cancel"
                  },
                  { text: "Yes", onPress: () => {
                       var postdata = {handover_to:'driver'};
          postData(postdata,'rtw_package_handoverto').then((res) => {
          console.log(res);
                if(res.type == 1) {
                      this.setState({isloading: false,rtwAlert:false,driverCodeScan:true});
                      _showSuccessMessage(res.message);
                } else {
                   this.setState({isloading: false,rtwAlert:false});
                  _showErrorMessage(res.message);
                }
              });

                      } 
                  }
                ],
                { cancelable: false }
              );
    
  }

  _isRtwSubmit = () => {

  const formdata = new FormData();
    let uri = this.state.packages_photo;
  if(uri) {
    let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
    let image = {
      uri:  uri,
      name: filename,
      type: "image/png",
    };
  formdata.append('packages_photo', image);
  } else {
    _showErrorMessage('Parcels Photo is required');
    return false;
  }

  formdata.append('driver', 1);
  formdata.append('rtw_package_id', this.state.rtw_package_id);
  formdata.append('handover_to', 'driver');
    console.log(formdata);
    postDataWithPic(formdata,'rtw_confirm_submit').then((res) => {
    if(res.type == 1) {
        this.setState({isloading: false,driver_rtw_parcel:false});
        _showSuccessMessage(res.message);

        Alert.alert(
                'ALERT',
                'Please tell driver scan your qr (QR CODE is available in SETTINGS tab) code first . after verify the code scan all the parcels',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );


      } else {
          this.setState({isloading: false});  
         _showErrorMessage(res.message);
      }
    });
}

checkDriverBCode = () => {
  var postdata = { 'driver_security_code':this.state.driver_b_qr};
    postData(postdata,'driver_by_security_code').then((res) => {
    console.log(res);
    if(res.type == 1) {
          this.setState({isloading: false,is_verify:true,driver_b_id: res.data.driver_id, user_image:res.data.profile_photo,full_name:res.data.driver_name});
        _showSuccessMessage(res.message);
    } else {
       this.setState({ is_verify:false,isloading: false});
      _showErrorMessage(res.message);
    }
  });
}

_scanRtwPackage1 = (rtw_parcel_code) => {
  this.setState({isloading: true});
    const {gps_long,gps_lat,driver_b_id,driver_b_qr} = this.state;
  var postdata = {gps_long:gps_long,gps_lat:gps_lat,'handover_to':'driver','assign_driver_security_code':driver_b_qr, 'barcode':rtw_parcel_code,assign_driver_id:driver_b_id};
         
  console.log(postdata);


          postData(postdata,'driver_first_rtw_scan_package').then((res) => {
        
          this.setState({isloading: false});
                if(res.type == 1) {
                      this.setState({rtw_package_id:res.data.rtw_package_id});
                      //this.setState({isloading: false,is_verify:true,driver_b_id: res.data.driver_id, user_image:res.data.profile_photo,full_name:res.data.driver_name});
                  this.setState({scanedRtwParcels:res.data.scan_parcels});
                    _showSuccessMessage(res.message);
                } else {
                  this.setState({isloading: false});
                   //this.setState({ is_verify:false,isloading: false});
                  _showErrorMessage(res.message);
                }
              });
}


_scanRtwPackage = () => {
  this.setState({isloading: true});
    const {gps_long,gps_lat,driver_b_id,rtw_parcel_code,driver_b_qr} = this.state;
  var postdata = {gps_long:gps_long,gps_lat:gps_lat,'handover_to':'driver','assign_driver_security_code':driver_b_qr, 'barcode':rtw_parcel_code,assign_driver_id:driver_b_id};
         
  console.log(postdata);


          postData(postdata,'driver_first_rtw_scan_package').then((res) => {
          
          this.setState({isloading: false});
                if(res.type == 1) {
                      this.setState({rtw_package_id:res.data.rtw_package_id});
                      //this.setState({isloading: false,is_verify:true,driver_b_id: res.data.driver_id, user_image:res.data.profile_photo,full_name:res.data.driver_name});
                  this.setState({scanedRtwParcels:res.data.scan_parcels});
                    _showSuccessMessage(res.message);
                } else {
                  this.setState({isloading: false});
                   //this.setState({ is_verify:false,isloading: false});
                  _showErrorMessage(res.message);
                }
              });
}

takePackagesPhoto = () => {
  const options = {
    title: 'PARCELS PHOTO',
    mediaType: 'photo',
    maxWidth:500,
    maxHeight:500
  };
  ImagePicker.launchCamera(options, response => {
    if (response.didCancel != true) {
      this.setState({ packages_photo: response.assets[0].uri});
    }
  });
}





  componentDidMount = () => {
    if(this.props?.route?.params?.showDriverPop == 1) {
      this.setState({driverCodeScan:true});
    }
    this.findQrCode2();
    this.setState({system_name:DeviceInfo.getSystemName()})
     this.checkRtwParcel();
    _storeData('store_distance_time',null);
    _storeData('last_point_after_deleivery',null);

    DeviceInfo.getBatteryLevel().then((batteryLevel) => {
         this.setState({battery_level:batteryLevel});
      });
    this.getCurrentPosition();
    this.checkUpdateNeeded();
      _storeData('startday',0).then();
        const _this = this;
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            
      _retrieveData('user_avtar')
        .then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
        });


        getData('block_driver_profile').then((res) => {
          if(res.type == 1 && res.data.is_profile_block == 'yes') {
            this.setState({date:res.data.date,header_title:res.data.header_title,is_block_profile:true})
          } else {
            this.setState({is_block_profile:false});

          }
        });


        getData('kit_questions_list').then((res) => {
         
          if(res.type == 1){
            this.setState({KitQuestionList:res.data.KitQuestionList});
            res.data.KitQuestionList.map((ress, i) => {
              console.log(ress.question_for);
            if(ress.question_for == 'both' || ress.question_for == 'start') {
              console.log("eeeeeee");
              if(!this.state.totalQuestionIds.includes(ress.id)){
                  this.setState({ totalQuestionIds: [...this.state.totalQuestionIds, ress.id] });
               }
            }
            });
          }
        })
.catch(function(err) {
    // Error: response error, request timeout or runtime error
    _showErrorMessage(err.message);
    console.log('promise error oppppp! ', err.message);
});

          this.setState({app_version:DeviceInfo.getVersion()});
          });
      this.getLocationPermissions();
  };

  hideHelp = () => {
  this.setState({is_help:false});
}

  getLocationPermissions = async (): Promise<void> => {
  try {
    const granted = await request(
    Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    }),
  );
  return granted === RESULTS.GRANTED;
    } catch (err) {
      console.log(err);  
    }
  }

  checkDriverProfile () {
              this.setState({isloading:true});
       getData('block_driver_profile').then((res) => {
          if(res.type == 1 && res.data.is_profile_block == 'yes') {
              this.setState({isloading:false,date:res.data.date,header_title:res.data.header_title,is_block_profile:true})
          } else {
            this.setState({isloading:false,is_block_profile:false})
          }

        });
  }

  checkUpdateNeeded = async () => {
    const version = await checkVersion();
    console.log("Got version info:", version.version);
    console.log("Old version info:", DeviceInfo.getVersion());
    if (version.version > DeviceInfo.getVersion()) {
      this.setState({versionModal:true});
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

getCurrentPosition2() {
  console.log("enter in location 2");
Geolocation.getCurrentPosition(
        (position) => {
          console.log(position);
          this.setState({
          gps_long: position.coords.longitude,
          gps_lat: position.coords.latitude
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

  getCurrentPosition() {
  Geolocation.getCurrentPosition(
    //Will give you the current location
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
      // saveLocation(postdata)
      //   .then((res) => {
      //     console.log(res);
      //   });
    },
    (error) => {
      this.getCurrentPosition2();
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 7000 }
  );
}


setCurrentLongitude(longitude){
  let longitude_ = parseFloat(longitude).toFixed(4);
  this.setState({
    gps_long: longitude_,
  });
} 

setCurrentLatitude(latitude){
  let latitude_ = parseFloat(latitude).toFixed(4);
  this.setState({
    gps_lat: latitude_,
  });
}

setLocationStatus(error){
  _showErrorMessage(error);
}


onScannerSuccess2 = e => {
    const _this = this;
    const { data } = e;
      this.setState({
          barcode: '',
          isloading: true
        }, () => {
            if (data) {
              var postdata = { barcode: String(data) };
              var barcode = String(data);
              if(barcode.includes('*')){
                    this.setState({ isloading: false });
                     _showErrorMessage('Oops wrong barcode. Please scan barcode that start without  *');
              } else {
               _this.setState({isloading: false});
               _this.setState({driver_b_qr:String(data)});
                setTimeout(function(){
                _this.checkDriverBCode();
                }, 1000);
                
                

              }
            } else {
                this.setState({ isloading: false });
                  Alert.alert(
                'Invalid Bar Code',
                'This Bar code is not Parcel code.',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
            }
        })
  }

onScannerSuccess1 = e => {
    const _this = this;
    const { data } = e;
      this.setState({
          barcode: '',
          isloading: true
        }, () => {
            if (data) {
              var postdata = { barcode: String(data) };
              var barcode = String(data);
              if(barcode.includes('*')){
                    this.setState({ isloading: false });
                     _showErrorMessage('Oops wrong barcode. Please scan barcode that start without  *');
              } else {
              this.setState({isloading: false});
                _this._scanRtwPackage1(String(data));

              }
            } else {
                this.setState({ isloading: false });
                  Alert.alert(
                'Invalid Bar Code',
                'This Bar code is not Parcel code.',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
            }
        })
  }

      onScannerSuccess = e => {
    const _this = this;
    const { data } = e;
      this.setState({
          barcode: '',
          isloading: true
        }, () => {
            if (data) {
              var barcode = String(data);
              if(barcode.includes('*')){
                    this.setState({ isloading: false });
                     _showErrorMessage('Oops wrong barcode. Please scan barcode that start without  *');
              } else {
              this.setState({ qr_code: barcode,isShowScanner: false,isloading: false });
                setTimeout(function(){
                _this.findQrCode2();
                }, 1000);

              }
            } else {
                this.setState({ isloading: false });
                  Alert.alert(
                'Invalid Bar Code',
                'This Bar code is not Parcel code.',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
            }
        })
  }

  findQrCode () {
    this.setState({ isloading: true });
    var postdata = { qr_code:this.state.qr_code,is_day:'start'};
     postData(postdata,'scan_kit_qr_code').then((res) => {
      if(res.type == 1) {

        
          this.setState({isloading: false,allFunc:false });
          _showSuccessMessage(res.message);
      } else if(res.type == 5) {
          _showSuccessMessage(res.message);
          this.props.navigation.navigate('HomeMain');
      } else {
        this.setState({ qr_code: '',isloading: false,allFunc:true });
        _showErrorMessage(res.message);
      }
    });
  } 

  findQrCode2 () {
    // this.setState({ isloading: true });
    var postdata = { kit_qr_code:this.state.qr_code};
    console.log(postdata);
     postData(postdata,'check_vehicle_start_day_driver_kit').then((res) => {
      console.log(res);
       if(res.type == 2){
            this.setState({
              rtw_vehicle_check:true,
              rtwAlert2:true,
              rtwList:res.data.packages_list,
              rtw_company:res.data.company_name,
              vehicle_plate_number:res.data.vehicle_plate_number,
              rtw_warehouse:res.data.rtw_warehouse,
              rtw_date:res.data.rtw_date,
              rtw_message:res.data.rtw_message,
              vehicle_number:res.data.vehicle_number,
              isloading:false
            });
          } else {
            this.findQrCode();
          }
    });
  }


  addAns (id,val) {
     this.setState({
      answer: {
     ...this.state.answer,
         [id]: val
      },
  });

     if(!this.state.questionIds.includes(id)){
        this.setState({ questionIds: [...this.state.questionIds, id] });
     }
  }

  takePhoto = () => {
    
  const options = {
    title: 'PLACE PHOTO',
    mediaType: 'photo',
    maxWidth:500,
    maxHeight:500
  };
  //ImagePicker.launchImageLibrary(options, response => {
  ImagePicker.launchCamera(options, response => {
    // console.log(response);
    if (response.didCancel != true) {
      console.log(response);
      this.setState({isloading:true});
      getData('listing_app_setting').then(res=>{
        this.setState({isloading:false});
        if(res.data.AppSettingList[1].allow_aws_recognition == "yes"){
          this.getDataAwsRecogApi(response.didCancel != true);
        }
        else{
          this.setState({ placePic: response.assets[0].uri,isloading:false});
        }
     }); 
    }
  });
}


     getDataAwsRecogApi = (uri) => {
    const _this = this;
    const formdata = new FormData();
        formdata.append('pic_type', 'kit');
          if(uri) {
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
          formdata.append('pic', image);
          } else {
              _showErrorMessage('Photo is required');
              this.setState({ isloading: false });
              return false;
          }

      this.setState({isloading: true});
     getDataAwsRecog(formdata).then((res) => {
      console.log(res);
      if(res.type == 1) {
        this.setState({ placePic: uri,isloading:false});
        _showSuccessMessage(res.message);
      } else {
        this.setState({ placePic: null,isloading:false});
        _showErrorMessage(res.message);
      }
         }).catch(error => {
          if(error.message == 'timeout' && this.state.imageScanAttempt == 0) {
          this.setState({imageScanAttempt:1,isloading:false});
          _showErrorMessage('Request timeout please try again');
          return false;
        } else if(error.message == 'timeout' && this.state.imageScanAttempt == 1) {
          this.setState({ placePic: uri,isloading:false});
        } else {
          this.setState({isloading:false});
          console.log(error);
          _showErrorMessage(error.message);
        }
      
    });

  };

removePlaceImage() {
  this.setState({ placePic: null});
}

saveData = () => {
  if(this.state.qr_code == '') {
    _showErrorMessage('Please scan qr code first');
    return false;
  }

  if(this.state.questionIds.length < this.state.totalQuestionIds.length) {
    _showErrorMessage('Please answer all the questions');
    return false;
  }

  if(this.state.notes != '' && this.state.notes.length < 25){
    _showErrorMessage('Minimum 25 characters required in notes field. Please enter valid notes');
    return false;
  }
    
  let currentLongitude = this.state.gps_long;
    let currentLatitude = this.state.gps_lat;

     if(this.state.gps_long == '' || this.state.gps_lat == '') {
      Geolocation.getCurrentPosition((position) => {
          
          currentLongitude = JSON.stringify(position.coords.longitude);
          currentLatitude = JSON.stringify(position.coords.latitude);

          this.setState({
          gps_long: currentLongitude,
          gps_lat: currentLatitude
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


      if(currentLongitude == '' || currentLongitude == null) {
        if(this.state.locationAttempt == 0) {
          this.setState({locationAttempt:1});
          _showErrorMessage('Location not Found please try again');
          return false;
        }
      }
  const formdata = new FormData();
  const _this = this;

  if(this.state.answer[7] == 'no') {
    _storeData('door_knocker_pad','no').then();
  }

  formdata.append('gps_long', currentLongitude);
  formdata.append('gps_lat', currentLatitude);
  formdata.append('question_answer', JSON.stringify(this.state.answer));
  formdata.append('kit_qr_code', this.state.qr_code);
  formdata.append('battery_level', this.state.battery_level);
  formdata.append('app_version', this.state.app_version);
  formdata.append('system_name', this.state.system_name);
  formdata.append('notes', this.state.notes);
  formdata.append('fuel_card_number', this.state.fuel_card_number);
  
    let uri = this.state.placePic;
    if(uri) {
      let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
      let image = {
        uri:  uri,
        name: filename,
        type: "image/png",
      };
    formdata.append('kit_photo', image);
    } else {
     _showErrorMessage('Kit Photo is required');
      return false;
    }

    if(this.state.fuel_card_number == null || this.state.fuel_card_number == ''){
    _showErrorMessage('Fuel card number is required');
    return false;
  }

  if(this.state.fuel_card_number.length < 5){
    _showErrorMessage('Please enter last 5 digit');
    return false;
  }

    console.log(formdata);
    
    this.setState({isloading: true});
    postDataWithPic(formdata,'start_day_driver_kit').then((res) => {
      console.log(res);
    this.setState({isloading: false});
    if(res.type == 1) {
       _showSuccessMessage(res.message);
       this.props.navigation.navigate('HomeMain');
    } else if(res.type == 5) {
          _showSuccessMessage(res.message);
          this.props.navigation.navigate('HomeMain');
      }
    else if(res.type == 2) {
       _showSuccessMessage(res.message);
       this.setState({kit_alert_msg:res.message,date:res.data.date,vehicle_plate:res.data.vehicle_plate,kitAlert:true});
    } else {
      _showErrorMessage(res.message);
    }
     
  }).catch(error => {
    // console.log(error);
      _showErrorMessage(error.message);  
    });
        
   
 
};
updateAppnow(){

  if(Platform.OS == 'ios'){
      const link = 'itms-apps://apps.apple.com/us/app/trans-8/id1546081402?l=id';
      Linking.canOpenURL(link).then(supported => {
        supported && Linking.openURL(link);
      }, (err) => console.log(err));
  }
  else{
     const GOOGLE_PACKAGE_NAME = 'com.trans8';

    Linking.openURL(`market://details?id=${GOOGLE_PACKAGE_NAME}`);
  }

}
  rtwPackagesList() {
    return (
    <View>
            {this.state.rtwList.map((res, i) => {
            return (
            <Card key={i+'_a'}>
              <CardItem key={i+'_b'} style={{backgroundColor:'red'}}>
                <Body key={i+'_c'}>
                  <View key={i+'_d'} style={{flexDirection:'row',justifyBox:'space-between'}}>
                   <Text key={i+'_g'} style={{fontWeight:'bold', width:'50%',paddingLeft:5,color:"#fff"}}>
                    {res.customer_name}
                    </Text>
                    <Text key={i+'_m'} style={{fontWeight:'bold', width:'50%',alignSelf:'flex-end',color:"#fff",right:-10,textAlign:'right'}}>
                    {res.barcode}
                    </Text>
                  </View>
                  <View key={i+'_h'} style={{paddingLeft:5}}>
                    <Text key={i+'_i'} style={{fontWeight:'bold',color:"#fff"}}>
                    {res.customer_address}
                    </Text>
                  </View>
                </Body>
              </CardItem>
            </Card>
            );
          })
        }
        </View>
    )    
  } 


  blockReasonList() {
    var que = 1;
    return (
      <View>
            {this.state.blockReason.map((res, i) => {
            return (
                <Text style={{color: 'red', fontSize: 16,fontWeight:'bold',marginLeft:15}}>{que++}. {res.reason_msg}</Text>
            );
          })
        }
        </View>
    )    
  }

 refreshPage() {
    this.props.navigation.push('DriverKitStart');
  }

  hideKitAlert() {
    this.setState({kitAlert: false});
    this.props.navigation.push('DriverKitStart')
  }

 

  onChangedLitter(text){
  let newText = '';
    let numbers = '0123456789.';
    let truetext = false;
    for (var i=0; i < text.length; i++) {
        if(numbers.indexOf(text[i]) > -1 ) {
            newText = newText + text[i]
            truetext = true;
        }
        else {
            truetext = false;
            if(newText != '.'){
              this.setState({ fuel_card_number: '' });
             _showErrorMessage('Please enter number only');
            }
        }
    }

    if(truetext || text === '' ){
      this.setState({ fuel_card_number: newText });
    }
}



  render() {
    const { rtw_vehicle_check,isSubmit,is_verify,full_name,user_image,total_packages,total_stops,driver_rtw_parcel,VerifyPackageCount,scanedRtwParcels } = this.state;
    var que = 1;
    const {
      container,
      headerLogo,
      headerView,
      backButton,
      backSection,
      backIcon,
      nextIcon,
      backText,
      mainContainer,
      itemLabel,
      itemValue,
      itemValueIn,
      itemSection,
      checkbox,
      checkboxIn,
      nextSection,
      blockSection,
      blockText,
      itemMain,
      spaceDivider,
      nextText,
      nextButton,
      itemMainSub
    } = styless;
    return (
     
      <SafeAreaView>
      <View style={{height:Dimensions.get('window').height,paddingBottom: 70}}>
      <ScrollView>
      {this.state.is_help?<Modall screen={'kit_start'} hideHelp={this.hideHelp} />:null}

      <Modal animationType="slide" transparent={true} visible={this.state.driver_rtw_parcel}>
         <View style={styles.centeredView}>

          <View style={styles.modalView}>
          <View style={{alignSelf:'center'}}>
            <Text style={{fontSize:18, fontWeight:'bold'}}>RETURN TO WAREHOUSE</Text>
            </View>
          <ScrollView style={{paddingLeft:10,paddingRight:10}}>
        <View style={{height:80}}>
          <QRCodeScanner
            cameraStyle={{ height: 80, marginTop: 10, width: 300, alignSelf: 'center', justifyBox: 'center', overflow: 'hidden' }}
            onRead={ (e) => this.onScannerSuccess1(e) }
                reactivate={true}
                flashMode={this.props.flashstatus == 'torch'?RNCamera.Constants.FlashMode.torch:RNCamera.Constants.FlashMode.off}
                showMarker={true}
                reactivateTimeout={7000}
            />
          </View>

          {/*<Form>
                  <Item stackedLabel>
                    <Label error={true} style={{ fontWeight: 'bold' }}>Enter Parcel Code Here</Label>
                  <Item>
                        <Input placeholder="Enter Parcel Code" value={this.state.rtw_parcel_code} onChangeText={(rtw_parcel_code) => this.setState({ rtw_parcel_code: rtw_parcel_code })}/>
                        <TouchableOpacity onPress={() => this._scanRtwPackage()}>
                    <Text style={{ textAlign: 'center', color:'#054b8b', fontSize: 14}}>VERIFY</Text>
                  </TouchableOpacity>
                  </Item>

                 
                </Item>
              </Form>*/}

            <Box alignItems="center">
                <Box w="100%" maxWidth="300px">
                  <FormControl isRequired>

                    <Stack mt="20" mb="5">
                      <Text bold fontSize="xxl" mb="4" style={{fontSize:18,fontWeight:"bold",color:"#333"}}>
                          Enter Parcel Code Here<Text style={{color:"red"}}>*</Text>
                      </Text>
                      
                       <Input w={{
                        base: "100%",
                        md: "25%",
                      }}  placeholder="Enter Parcel Code" value={this.state.rtw_parcel_code} onChangeText={(rtw_parcel_code) => this.setState({ rtw_parcel_code: rtw_parcel_code })} size="2xl" variant="underlined"/>
                       <TouchableOpacity onPress={() => this._scanRtwPackage()}>
                      <Text style={{ textAlign: 'center', color:'#054b8b', fontSize: 14}}>VERIFY</Text>
                      </TouchableOpacity>
                       </Stack>
                       
                    </FormControl>
                  </Box>    
              </Box>      


          <View>
          
          

          <View style={{backgroundColor:'#e5f8fd', alignItems: 'center',justifyBox:'space-between',width:'99%',flexDirection:'row'}}>
            <Text style={{fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center',marginLeft:2,paddingTop:8,paddingBottom:8}}>S.NO</Text>
            <Text style={{fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center',marginRight:10,paddingTop:8,paddingBottom:8}}>BARCODE</Text>
            <Text style={{fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center',marginRight:10,paddingTop:8,paddingBottom:8}}>STATUS</Text>
          </View>
          <View style={{borderWidth:1,borderColor:'#cedfe4'}}>
          </View>
           
          {this.state.scanedRtwParcels.map((res, i) => {
            return (
              <View>
          <View style={{alignItems: 'center',backgroundColor: '#e5f8fd',width:'99%',flexDirection:'row'}}>
            <Text style={{fontWeight:'bold', fontSize: 14,marginLeft:1,paddingTop:8,paddingBottom:8,width:'20%'}}># {que++}</Text>
            <Text style={{fontWeight:'bold', fontSize: 14,textAlign:'center',paddingTop:8,paddingBottom:8,width:'60%',alignSelf:'flex-start'}}>{res.barcode}</Text>
            <Icon as="FontAwesome" name='check-circle' style={{ color: 'green',marginLeft:20}}/>
          </View>
          <View style={{borderWidth:1,borderColor:'#cedfe4'}}>
          </View>
          </View>
          ) 
          }) }

           

              <View style={{ borderRadius: 15,alignItems: 'center',justifyBox:'center',marginTop:15}}>
              <Button  onPress={() => this.takePackagesPhoto()}  style={{backgroundColor: '#00c2f3',width:'99%',alignSelf:'center',alignItems:'center',justifyBox:'center'}}>
              <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>TAKE PHOTO </Text>
              <Icon as={Ionicons} name='camera' />
              </Button>
            </View>
            {this.state.packages_photo ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyBox: 'flex-start',marginTop: 10 }}>
              <View style={{ flexBasis: '100%', height: 170, marginBottom: 5 }}>
                {this.state.packages_photo ? (<Image style={{ height: 170,borderRadius:6 }} source={{ uri: this.state.packages_photo }}/>):null}
                {this.state.packages_photo ? (<TouchableOpacity onPress={() => this.removePlaceImage()}
                                  style={{ position: 'absolute', top: 2, right: 5, zIndex: 9 }}>
                                 
                  <Icon as="FontAwesome" name='times'  style={{ color: 'red'}}/>
                </TouchableOpacity>):null}
              </View>
            </View>):null}


          </View>
             <View style={{ flexDirection: 'row',alignSelf:'center'}}>
              <Button style={{ height: 35, width:'95%',marginTop: 10,marginBottom:10, backgroundColor: isSubmit?'#81a4c4':'#054b8b', justifyBox: 'center',borderRadius:5}}
                    onPress={() => this._isRtwSubmit()} >
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>COMPLETE SCAN</Text>
              </Button>
          </View>
             
        </ScrollView>
         
           
         
          </View>

        </View>
        {this.state.isloading && (
              <Loader />
          )}
      </Modal>
      <Modal animationType="slide" transparent={true} visible={false}>
         <View style={{justifyBox: "center",alignItems: "center",marginTop: 30}}>
          <View style={styles.modalView}>
            <View style={{alignSelf:'center',padding:5}}>
            <Text style={{fontSize:18, fontWeight:'bold',textAlign:'center',color:'red'}}>BLOCKED PROFILE</Text>
            <Text style={{fontSize: 15,textAlign:'center',alignSelf:'center',fontWeight:'bold'}}>{this.state.header_title}</Text>
            </View>
            
            
            <View style={{ flexDirection: 'row',alignItems:'center'}}>
              <Text style={{fontStyle:'italic',fontSize: 12,fontWeight:'bold',marginTop:4,flexWrap: 'wrap',flex: 1,alignSelf:'center',textAlign:'center' }}>{this.state.rtw_warehouse}</Text>
            </View>
             <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'center',marginTop:15}}>
              <Button 
                style={{ height: 50, width:'35%',alignSelf:'center', backgroundColor: 'red', justifyBox: 'center', borderRadius: 5}}
                onPress={() => this.checkDriverProfile()}>
                <Icon style={{color:'#fff',fontSize: 40,fontWeight:'bold',textAlign: 'center'}} name='sync' />
              </Button>
              </View>
              {this.state.isloading && (
              <Loader />
          )}
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" transparent={true} visible={this.state.versionModal}>
        <View style={{flex: 1,alignItems: "center",marginTop: 70,padding: 10, height:500}}>
          <View style={{backgroundColor: "white",borderRadius: 20,shadowColor: "#000",borderColor: '#F9CCBE',
          borderWidth: 1,shadowOffset: {width: 0,height: 2},shadowOpacity: 0.25,shadowRadius: 3.84,elevation: 5}}>
            <View style={{alignSelf:'center',padding:10,height:80}}>
            <Text style={{fontSize:30, fontWeight:'bold', paddingTop:25}}>UPDATE APP</Text>
            </View>
            <View style={{ flexDirection: 'row',alignSelf:'center', padding:10,height:100}}>
              <Text style={{fontSize:22,color: 'red',alignSelf:'center', textAlign:'center'}}>ALERT: UPDATE TO THE LATEST VERSION OF THE APP TO CONTINUE.</Text>
            </View> 
            <View style={{ flexDirection: 'row',alignSelf:'center', padding:10,height:20}}>
            </View>
             <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'center',marginTop:15}}>
              <Button 
                style={{ height: 50, width:'45%',alignSelf:'center', backgroundColor: '#054b8b', justifyBox: 'center',marginBottom:10, borderRadius: 5}}
                onPress={() => this.updateAppnow()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>UPDATE NOW</Text>
              </Button>
              </View>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" transparent={true} visible={this.state.kitAlert}>
         <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{alignSelf:'center',padding:5}}>
            <Text style={{fontSize:18, fontWeight:'bold',textAlign:'center',color:'red'}}>KIT BLOCKED</Text>
            <Text style={{fontSize: 12,textAlign:'center',alignSelf:'center',fontWeight:'bold'}}>{this.state.kit_alert_msg}</Text>
            </View>
            <View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Vehicle Number #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.vehicle_plate}</Text>
            </View>
          <View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Date #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.date}</Text>
            </View>
            <View style={{ flexDirection: 'row',alignItems:'center'}}>
              <Text style={{fontStyle:'italic',fontSize: 12,fontWeight:'bold',marginTop:4,flexWrap: 'wrap',flex: 1,alignSelf:'center',textAlign:'center' }}>{this.state.rtw_warehouse}</Text>
            </View>
             <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'center',marginTop:15}}>
              <Button 
                style={{ height: 50, width:'45%',alignSelf:'center', backgroundColor: 'red', justifyBox: 'center', borderRadius: 5}}
                onPress={() => this.hideKitAlert()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>OK</Text>
              </Button>
              </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={this.state.rtwAlert2}>
         <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{alignSelf:'center',padding:5}}>
            <Text style={{fontSize:18, fontWeight:'bold',textAlign:'center',color:'red'}}>RTW PARCEL ALERT-2</Text>
            <Text style={{fontSize: 12,textAlign:'center',alignSelf:'center',fontWeight:'bold'}}>{this.state.rtw_message}</Text>
            </View>
            <View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Date:</Text>
              <Text style={{fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.rtw_date}</Text>
            </View>
            
            {this.state.vehicle_plate_number != '' ? (<View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>License Plate #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.vehicle_plate_number}</Text>
            </View>):null}
            {this.state.vehicle_number != '' ? (<View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Vehicle #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.vehicle_number}</Text>
            </View>):null}
            
            <View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Company:</Text>
              <Text style={{fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.rtw_company}</Text>
            </View>
            <View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Total Packages:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.rtwList.length}</Text>
            </View>
            <View style={{ flexDirection: 'row',alignItems:'center'}}>
              <Text style={{fontStyle:'italic',fontSize: 12,fontWeight:'bold',marginTop:4,flexWrap: 'wrap',flex: 1,alignSelf:'center',textAlign:'center' }}>{this.state.rtw_warehouse}</Text>
            </View>
            <ScrollView style={{height:290}}>
            {this.rtwPackagesList()}
            </ScrollView>
            {this.state.is_redeliver == "no" &&
            <View>
             <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'center',marginTop:15}}>
              <Button 
                style={{ height: 35, width:'85%',alignSelf:'center', backgroundColor: 'red', justifyBox: 'center', borderRadius: 5}}
                onPress={() => this._isRtwAction2('warehouse')}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>RETURN TO WAREHOUSE</Text>
              </Button>
              </View>

              <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'center',marginTop:5}}>
              <Button 
                style={{ height: 35, width:'85%',alignSelf:'center', backgroundColor: 'red', justifyBox: 'center', borderRadius: 5}}
                onPress={() => this._giveTodriver2()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>GIVE TO DRIVER</Text>
              </Button>
              </View>
              </View>
              }
              <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'center',marginTop:5}}>
                <Button 
                  style={{ height: 35, width:'85%',alignSelf:'center', backgroundColor: 'red', justifyBox: 'center', borderRadius: 5}}
                  onPress={() => this._redeliver_package()}>
                  <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>REDELIVER</Text>
                </Button>
              </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={this.state.rtwAlert}>
         <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{alignSelf:'center',padding:5}}>
            <Text style={{fontSize:18, fontWeight:'bold',textAlign:'center',color:'red'}}>RTW PARCEL ALERT</Text>
            <Text style={{fontSize: 12,textAlign:'center',alignSelf:'center',fontWeight:'bold'}}>{this.state.rtw_message}</Text>
            </View>
            <View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Date:</Text>
              <Text style={{fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.rtw_date}</Text>
            </View>
            
            {this.state.vehicle_plate_number != '' ? (<View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>License Plate #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.vehicle_plate_number}</Text>
            </View>):null}
            {this.state.vehicle_number != '' ? (<View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Vehicle #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.vehicle_number}</Text>
            </View>):null}
            
            <View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Company:</Text>
              <Text style={{fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.rtw_company}</Text>
            </View>
            <View style={{ flexDirection: 'row',justifyBox:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Total Packages:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.rtwList.length}</Text>
            </View>
            <View style={{ flexDirection: 'row',alignItems:'center'}}>
              <Text style={{fontStyle:'italic',fontSize: 12,fontWeight:'bold',marginTop:4,flexWrap: 'wrap',flex: 1,alignSelf:'center',textAlign:'center' }}>{this.state.rtw_warehouse}</Text>
            </View>
            <ScrollView style={{height:290}}>
            {this.rtwPackagesList()}
            </ScrollView>
            {this.state.is_redeliver == "no" &&
            <View>
             <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'center',marginTop:15}}>
              <Button 
                style={{ height: 35, width:'85%',alignSelf:'center', backgroundColor: 'red', justifyBox: 'center', borderRadius: 5}}
                onPress={() => this._isRtwAction2('warehouse')}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>RETURN TO WAREHOUSE</Text>
              </Button>
              </View>

              <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'center',marginTop:5}}>
              <Button 
                style={{ height: 35, width:'85%',alignSelf:'center', backgroundColor: 'red', justifyBox: 'center', borderRadius: 5}}
                onPress={() => this._giveTodriver2()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>GIVE TO DRIVER</Text>
              </Button>
              </View>
              </View>
              }
              <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'center',marginTop:5}}>
                <Button 
                  style={{ height: 35, width:'85%',alignSelf:'center', backgroundColor: 'red', justifyBox: 'center', borderRadius: 5}}
                  onPress={() => this._redeliver_package()}>
                  <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>REDELIVER</Text>
                </Button>
              </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={this.state.driverCodeScan}>
         <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{paddingLeft:10,paddingRight:10}}>
            <View style={{alignSelf:'center'}}>
            <Text style={{fontSize:18, fontWeight:'bold', alignSelf:'center',color:'#054b8b'}}>RTW PACKAGE ASSIGN</Text>
            <Text style={{fontSize:14, fontWeight:'bold'}}>Scan qr code of any driver who will go {this.state.rtw_warehouse} warehouse. Qr Code is available in settings tab.</Text>
            </View>
              <View style={{height:130}}>
                <QRCodeScanner
            cameraStyle={{ height: 120, marginTop: 10, width: 300, alignSelf: 'center', justifyBox: 'center', overflow: 'hidden' }}
            onRead={ (e) => this.onScannerSuccess2(e) }
                reactivate={true}
                flashMode={this.props.flashstatus == 'torch'?RNCamera.Constants.FlashMode.torch:RNCamera.Constants.FlashMode.off}
                showMarker={true}
                reactivateTimeout={7000}
            />
          </View>
              <View style={{ marginTop: 3, alignItems:'center'}}>
                 <Text style={{ textAlign: 'center', fontSize: 14}}>OR</Text>
              </View>
              {/*    
              <Form>
                  <Item stackedLabel>
                    <Label error={true} style={{ fontWeight: 'bold' }}>Enter 6 Digit Driver Code</Label>
                  <Item>
                        <Input disabled={is_verify?true:false} placeholder="Enter 6 Digit Driver Code" value={this.state.driver_b_qr} onChangeText={(driver_b_qr) => this.setState({ driver_b_qr: driver_b_qr })}/>
                        
                    {is_verify?(<Icon as="FontAwesome" name='check' style={{ color: 'green'}} />):<TouchableOpacity onPress={() => this.checkDriverBCode()}><Text style={{ textAlign: 'center', color:'#054b8b', fontSize: 14}}>VERIFY</Text></TouchableOpacity>}
                  
                  </Item>
                </Item>
              </Form>

            */}

            <Box alignItems="center">
                <Box w="100%" maxWidth="300px">
                  <FormControl isRequired>

                    <Stack mt="20" mb="5">
                      <Text bold fontSize="xxl" mb="4" style={{fontSize:18,fontWeight:"bold",color:"#333"}}>
                          Enter 6 Digit Driver Code<Text style={{color:"red"}}>*</Text>
                      </Text>
                      
                       <Input w={{
                        base: "100%",
                        md: "25%",
                      }}  placeholder="Enter 6 Digit Driver Code" value={this.state.driver_b_qr} onChangeText={(driver_b_qr) => this.setState({ driver_b_qr: driver_b_qr })} size="2xl" variant="underlined" InputRightElement={is_verify?(<MaterialIcons name="person" size={6} mr="2" color="green" />):<TouchableOpacity onPress={() => this.checkDriverBCode()}><Text style={{ textAlign: 'center', color:'#054b8b', fontSize: 14}}>VERIFY</Text></TouchableOpacity>}/>
                       

                       </Stack>
                       
                    </FormControl>
                  </Box>    
              </Box>  

              {is_verify?(<View>
                <Text style={{fontWeight:'bold',fontSize:18,alignSelf:'center',justifyBox:'center',marginTop:5}}>SCANED DRIVER DETAILS</Text>
                <View style={{alignItems:'center',justifyBox:'center',alignSelf:'center'}}>
                <Image
        style={{ marginTop:10,height: 70,width: 70,borderRadius: 40,borderColor:'grey',borderWidth:1}}
        source={{ uri: user_image }}
      />  
              <Text style={{alignSelf:'center',marginTop:10,fontSize:18,fontWeight:'bold'}}>{full_name}</Text>
              <View>
              <Text style={{fontSize:14, fontWeight:'bold'}}>If scand driver detail wrong then click on SCAN CODE AGAIN button, If driver detail right then click on NEXT button</Text>
              </View>
               <View style={{ flexDirection: 'row',alignItems: 'center',justifyBox:'space-between',marginTop:5}}>
              <Button 
                style={{ height: 25, width:'45%',alignSelf:'center', backgroundColor: '#00c2f3', justifyBox: 'center', borderRadius: 5}}
                onPress={() => this.setState({is_verify:false})}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 15 }}>SCAN CODE AGAIN</Text>
              </Button>

              <Button 
                style={{ height: 25, width:'45%',marginLeft:10,alignSelf:'center', backgroundColor: '#00c2f3', justifyBox: 'center', borderRadius: 5}}
                onPress={() => this.setState({driverCodeScan:false,driver_rtw_parcel:true})}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 15 }}>NEXT</Text>
              </Button>
              </View>
      </View>
     
      
              
              </View>):null}
          </View>
          </View>
        </View>
      </Modal>
     
      { (this.state.isShowScanner) ?
      (<Box padder>
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={{ height: 40, borderColor: '#00c2f3', borderWidth: 1, backgroundColor: '#00c2f3',marginTop: 30,marginBottom:25, marginLeft: 20, marginRight: 20, justifyBox: 'center'}}>
              <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? -4 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>SCAN DRIVER KIT</Text>
            </View>
            <View style={{flexDirection:'row', justifyBox:'space-between',marginLeft: 20, marginRight: 20}}>
              <Text style={{color:'black',fontSize:18,marginRight:20}}>Flash Light</Text>
              <Switch style={{alignSelf:'flex-end'}} onValueChange={ (value) => {value == true?this.props.flashon():this.props.flashoff()}} 
                value={this.props.flashstatus == 'torch'?true:false} /> 
            </View> 
          <View style={{flexDirection:'row',paddingTop:15}}>
          <QRCodeScanner
            cameraStyle={{ height: 280, marginTop: 10, width: 300, alignSelf: 'center', justifyBox: 'center', overflow: 'hidden' }}
            onRead={ (e) => this.onScannerSuccess(e) }
                reactivate={true}
                flashMode={this.props.flashstatus == 'torch'?RNCamera.Constants.FlashMode.torch:RNCamera.Constants.FlashMode.off}
                showMarker={true}
                reactivateTimeout={7000}
            />
            </View>
      </Box>
      ):null
      }
       { (!this.state.isShowScanner) ?
      ( <Box style={{flex:1}}>
          <CustomHeader {...this.props} url={this.state.user_avtar} />
            <View style={backSection}>
            <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 1 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>START DAY DRIVER KIT</Text>
            <TouchableOpacity onPress={() => this.setState({is_help:true})}>
            <MaterialIcons name="help" size={35} color="#fff"/>
            {/* <Ionicons name={'help-circle'} size={35} color="#fff" />*/}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:8,fontWeight:200}} name='sync' />
          </TouchableOpacity>
        </View>
            <View style={{paddingLeft:10,paddingRight:10}}>
           {this.state.qr_code != '' ?
           (<View style={{ borderRadius: 15,alignItems: 'center',justifyBox:'center',marginTop:15}}>
            <Button onPress={() => this.setState({isShowScanner: true})} style={{backgroundColor: '#00c2f3',width:200,alignSelf:'center',alignItems:'center',justifyBox:'center'}}>
            <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>KIT SCANNED</Text>
             
          </Button>
            <Text style={{fontSize: 12,textAlign:'center',alignSelf:'center'}}>Please scan driver kit first</Text>
           </View>):
           (<View style={{ borderRadius: 15,alignItems: 'center',justifyBox:'center',marginTop:15}}>
            
            <Button onPress={() => this.setState({isShowScanner: true})} style={{ width:'50%',marginLeft:10,alignSelf:'center', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5,padding:15,marginTop:15}}>
            <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center', paddingRight:5}}>SCAN KIT <Icon as={Ionicons} name='camera' color="#fff"/></Text>
             
          </Button>
            <Text style={{fontSize: 12,textAlign:'center',alignSelf:'center'}}>Please scan driver kit first</Text>
           </View>)}
            <View style={{borderWidth:1,color:'grey',width:150,alignSelf:'center'}}>
            </View>
            {!this.state.allFunc?(<View>
              <View style={{flexDirection: 'row',marginTop:10}}>
              <Text style={{color:'#054b8b',fontWeight:'bold',fontSize:16,fontStyle:'italic'}}>Please give answers of questions for kit and take photo of kit also:-</Text>
              </View>
              <View style={{height:10}}></View>

              {this.state.KitQuestionList.map((res, i) => {

                console.log(res,i);

                return (
                  res.question_for == 'both' || res.question_for == 'start'?
                  (<View style={{flexDirection: 'row'}}>
                    <Text style={[itemLabel,{marginTop:0,fontSize:15,fontWeight:'bold',paddingLeft:1,width:'65%'}]}>{que++}.{res.question}</Text>
                    <View style={{flexDirection: 'row', width:'15%',marginTop:0}}>
                      <CheckBox disabled={this.state.allFunc} value={this.state.answer[res.id] === 'yes'?true:false} onValueChange={() => this.addAns(res.id,'yes')} style={checkbox} />
                      <Text style={itemValue}>{res.answer[0] || Yes}</Text>
                      <View style={{marginLeft: 8}}></View>
                      <CheckBox disabled={this.state.allFunc} value={this.state.answer[res.id] === 'no'?true:false} onValueChange={() => this.addAns(res.id,'no')} style={checkbox} />
                      <Text style={itemValue}>{res.answer[1] || No}</Text>
                    </View>  
                    <View style={{height:12}}></View>
                  </View>):null
                );
                })
              }
            
            <View style={{height:10}}></View>
            <View>
            <TextInput editable={!this.state.allFunc} multiline = {true} numberOfLines = {3} placeholder="Notes"  style={{fontSize:14, paddingTop:5,justifyBox:"flex-start",backgroundColor:'white', borderWidth: 1,borderRadius: 5, height: 60,borderColor:'#00c2f3' }} onChangeText={text => this.setState({notes:text})} value={this.state.notes}/>
            </View>

            <View style={{ borderRadius: 15,alignItems: 'center',justifyBox:'center',marginTop:15,marginBottom:15}}>
              <Button onPress={() => this.takePhoto()} disabled={this.state.allFunc} style={{backgroundColor: '#00c2f3',width:200,alignSelf:'center',alignItems:'center',justifyBox:'center'}}>
              <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>TAKE KIT PHOTO <MaterialIcons name="camera" /></Text>
              
              </Button>
           </View>
           
         
           {this.state.placePic ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyBox: 'flex-start',marginTop: 20 }}>
              <View style={{ flexBasis: '100%', height: 170, marginBottom: 5 }}>
                {this.state.placePic ? (<Image style={{ height: 170,borderRadius:6 }} source={{ uri: this.state.placePic }}/>):null}
                {this.state.placePic ? (<TouchableOpacity onPress={() => this.removePlaceImage()}
                                  style={{ position: 'absolute', top: 2, right: 5, zIndex: 9 }}>

                   <Icon as={Ionicons} name='close' style={{color:"red"}} size="12"/>
                </TouchableOpacity>):null}
              </View>
            </View>):null}

            <Stack mx="0">
                      <Text bold fontSize="xxl" mb="4" style={{fontSize:18,fontWeight:"bold",color:"#333"}}>
                          Fuel Card Number<Text style={{color:"red"}}>*</Text>
                      </Text>
                      
                       <Input w={{
                        base: "100%",
                        md: "25%",
                      }} InputLeftElement={<Icon as={<MaterialIcons name="credit-card" />} size={6} mr="2" color="#00C2F3" />} minLength={5} maxLength={5} placeholder="Fuel Card Last 5 Digit" keyboardType = 'numeric' value={this.state.fuel_card_number} onChangeText={(text)=> this.onChangedLitter(text)} size="2xl" variant="underlined"/>
            </Stack>          

        
           <View style={{ borderRadius: 15,alignItems: 'center',justifyBox:'center'}}>
              <Button style={{height: 45,marginTop: 20, backgroundColor: '#00c2f3', alignSelf:'center',alignItems:'center',justifyBox:'center'}}
                    onPress={() => this.saveData()}>
                    <Text style={{ textAlign: 'center',width:200, color: '#fff', fontSize: 22,fontWeight:'bold' }}>SUBMIT</Text>
              </Button>
          </View>
          <View style={spaceDivider}></View>
          </View>):null}
          </View>
            </Box>
            ):null
      }
      
      </ScrollView>    
      </View>
      {this.state.isloading && (
              <Loader />
          )}
      </SafeAreaView>
   
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    justifyBox: "center",
    alignItems: "center",
    marginTop: 5
  },
  modalView: {
    width:'98%',
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth:2,
    borderColor:'red'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
    backSection: {
    flexDirection: 'row',
    justifyBox: 'space-between',
    alignItems:'center',
    borderColor: '#00c2f3',
    borderWidth: 1,
    backgroundColor: '#00c2f3',
    marginTop: '4%'
  },
  backButton: {
    flexDirection: 'row',
    alignItems:'center',
    justifyBox:'center'
  }
});

function mapStateToProps(state){
  return{
    flashstatus : state.flashstatus
  };
}
function matchDispatchToProps(dispatch){
  return bindActionCreators({flashon: flashon, flashoff: flashoff}, dispatch)
}
export default connect(mapStateToProps,matchDispatchToProps)(DriverKitStart);

// export default DriverKitStart;