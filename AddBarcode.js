import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,Alert,Modal,Dimensions,TouchableHighlight,TextInput} from 'react-native';
import { Picker,Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon, ListItem, CheckBox, Body,Switch,Box,Stack,FormControl } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_getAll, _storeData,_retrieveUser, _retrieveData,checkNet } from 'assets';
import styles from './styles';
import * as ImagePicker from "react-native-image-picker"
import { saveProductInfo,getData,getUser,searchParcelAddress,postData,getDataTextract,getDataAwsRecog,get_warehouse_by_id } from 'api';
import CustomHeader from '../../CustomHeader';
import geolocation from '@react-native-community/geolocation';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import CheckBox2 from '@react-native-community/checkbox';
import { flashon, flashoff } from '../../../store/actions/index.js';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import { openDatabase } from 'react-native-sqlite-storage'; 
var db = openDatabase({ name: 'UserDatabase.db' }); 

import NetInfo from "@react-native-community/netinfo";
import Modall from '../Modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

class AddBarcode extends Component {  
constructor(props) { 
  
    super(props); 

    this.state = {
      isloading: false,
      isShowScanner:false,
      barcodes:'',
      barcodesdata:[],
      isShowScanner:false,
      address:props?.route?.params?.address,
      stop_id:props?.route?.params?.stop_id
    };

  }


    componentDidMount = () => {
      this.getParcelList();
    };



  componentWillUnmount() {
    // this._unsubscribe();
  }
  
  getParcelList(){
    var postdata = { address:this.state.address };

    postData(postdata,'parcellistbyaddress').then((res) => {
      this.setState({barcodesdata:res.data.barcodes});
      this.setState({isloading:false});
    })
  }

  scanCode() {

     this.setState({
          isShowScanner: true
      });
  }

  goToLoad() {
     this.setState({
            isShowScanner: false
        });
  }


  
async  saveData() {

    this.setState({ isloading: true });
    var postdata = {id:this.state.stop_id,barcode:this.state.barcodes};
      postData(postdata,'scanparceldatanew').then((res) => {
        if(res.type == 1){
          this.setState({isloading: false});
          this.getParcelList();
          _showSuccessMessage(res.message);
        }
        else{
           this.setState({isloading: false});
           _showErrorMessage(res.message);
        }
     })   
  };


    onScannerSuccess = e => {
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

               this.setState({ isloading: true });
               var postdata = {id:this.state.stop_id,barcode:String(data)};
                postData(postdata,'scanparceldatanew').then((res) => {
                  if(res.type == 1){
                    this.setState({isloading: false});
                    this.getParcelList();
                    _showSuccessMessage(res.message);

                  }
                  else{
                    this.setState({isloading: false});
                    _showErrorMessage(res.message);  
                  }
               })  

              this.setState({isShowScanner: false,isloading: false});

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

  addparcelBarcode(){
    // var array = this.state.barcodesdata;
    // if (array.includes(this.state.barcodes) === false) {
    //   this.state.barcodesdata.push(String(this.state.barcodes));
    //   this.setState({barcodesdata:this.state.barcodesdata});
    // }

   var postdata = {id:this.state.stop_id,barcode:String(data)};
                postData(postdata,'scanparceldatanew').then((res) => {
                  if(res.type == 1){
                    this.setState({isloading: false});
                    this.getParcelList();
                    _showSuccessMessage(res.message);

                  }
                  else{
                    this.setState({isloading: false});
                    _showErrorMessage(res.message);  
                  }
               })   
      
  }
  removeBarcode(barcode){


    let items = [];
    items.push(barcode);

    console.log(items);

    var postdata = { barcode: barcode };

    this.setState({ isloading: true });

    postData(postdata,'deletbarcodenew').then((res) => {

      if(res.type == 1) {
          this.getParcelList();
           this.setState({ isloading: false });
         _showSuccessMessage(res.message);
      } else {
        _showErrorMessage(res.message);
         this.setState({ isloading: false });
      }

    })

  }
checkIfDuplicateExists(arr) {
    return new Set(arr).size !== arr.length
}
 refreshPage() {
    this.props.navigation.push('AddBarcode');
  }


  render() {
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
      itemValue1,
      itemSection,
      checkbox,
      checkbox1,
      nextSection,
      blockSection,
      blockText,
      itemMain,
      spaceDivider,
      nextText,
      nextButton,
      itemMainSub
    } = styles;

    const {
      checked,
      setChecked,
      garbage,
      cleaning,
      accessories,
      fuel_tank,
      oil_change,tire_pressure,brakes,
      no_evidence_flood_damage,
      body_panel_inspection,bumper_fascia_inspection,
      doors_hood_roof_inspection,
      doors_hood_alignment,
      power_sliding_door_operation,
      windshield_side_rear_window_glass_inspection,
      wiper_blade_inspection,
      exterior_lights_back_side_front,showShipperNo} = this.state;
     
    return (
      <SafeAreaView>
      <ScrollView>
      {this.state.is_help?<Modall screen={'scan_parcel'} hideHelp={this.hideHelp} />:null}
       { (this.state.isShowScanner) ?
      (<Box>
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={{ height: 40, borderColor: '#00c2f3', borderWidth: 1, backgroundColor: '#00c2f3',marginTop: 30,marginBottom:25, marginLeft: 20, marginRight: 20, justifyContent: 'center'}}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems:'center'}} onPress={() => this.props.navigation.navigate('ScanParcel')}>
                <Icon as={FontAwesome} size={10} name='angle-left' style={{ color: '#fff',marginLeft: 20,fontWeight: 100}}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? -4 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>SCAN PARCEL CODE</Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection:'row', justifyContent:'space-between',marginLeft: 20, marginRight: 20}}>
              <Text style={{color:'black',fontSize:18,}}>Flash Light</Text>
              <Switch onValueChange={ (value) => {value == true?this.props.flashon():this.props.flashoff()}} 
                value={this.props.flashstatus == 'torch'?true:false} /> 
            </View> 
          <View style={{flexDirection:'row',paddingTop:15}}>
          <QRCodeScanner
            markerStyle={{height: 120,width: 290}}
            cameraStyle={{ height: 220, marginTop: 10, width: 300, alignSelf: 'center', justifyContent: 'center', overflow: 'hidden' }}
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
      (<Box>
          <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={backSection}>
         
          <Icon as={FontAwesome} size={10} name='angle-left' style={{ color: '#fff',marginLeft: 20,fontWeight: 100}} onPress={() => this.props.navigation.navigate('ScanParcel')}/>
            <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 1 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>{this.state.company_name || 'Add Barcode'}</Text>
           
               <TouchableOpacity onPress={() => this.setState({is_help:true})}>
            <Ionicons name={'help-circle'} size={35} color="#fff" />
          </TouchableOpacity>
            <TouchableOpacity onPress={() => this.refreshPage()}>
            {/* <Icon as={Ionicons} style={{color:'#fff',right:8,fontWeight:400}} size={8} name='sync' /> */}
          </TouchableOpacity>
        </View>
          <View style={{paddingLeft:10,paddingRight:10}}>
          <View style={{flexDirection:'row',paddingTop:15}}>
          <View style={{flexDirection:'row',width:'90%'}}>
            <Text style={{fontSize:18,fontWeight:'bold'}}>Address:</Text>
            <Text style={{paddingLeft:10,fontSize:14,flex:1}}>{this.state.address}</Text>
          </View>        
          </View>
          <View style={{borderColor: '#00c2f3',borderWidth: 1, marginTop:12}}>
          </View>
            <View style={mainContainer}>
            <View>
              <View style={{ borderRadius: 15,marginTop:15}}>
                <Button  onPress={() => this.scanCode()}  style={{backgroundColor: '#00c2f3',width:'99%',paddingTop:20}}>
                <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>SCAN PARCEL</Text>
                <Icon name='scan' />
                </Button>
               </View>
              <View style={{ marginTop: 3, alignItems:'center'}}>
                 <Text style={{ textAlign: 'center', fontSize: 14}}>OR</Text>
              </View>    
              <Box alignItems="center">
                <Box w="100%" maxWidth="300px">
                  <FormControl isRequired>
                    <Stack mt="5" mb="5">
                      <Text bold fontSize="xxl" mb="4" style={{fontSize:18,fontWeight:"bold",color:"#333"}}>
                          Enter Parcel Code Here
                      </Text>
                       <Input w={{
                        base: "100%",
                        md: "25%",
                      }}  placeholder="Enter Parcel Code" value={this.state.barcodes} onChangeText={(barcodes) => this.setState({ barcodes: barcodes })} size="2xl" variant="underlined" InputRightElement={<Icon as={<Icon as={FontAwesome} name={"plus"} />} size={6} mr="2" color="muted.400" style={{color:"#00c2f3"}} onPress={() => this.saveData()} />} />
                       </Stack>
                    </FormControl>
                  </Box>    
              </Box>   
          </View>
          <View style={{borderColor: '#00c2f3',borderWidth: 1, marginTop:12}}>
          </View>
             </View>
          </View>
          <View style={spaceDivider}></View>
        {this.state.barcodesdata.map((res, i) => {
            return (
            <View key={i} style={{padding:3}}>
              <View key={i} style={{padding:7,flexDirection:'row',backgroundColor:'#AEACAB',borderRadius: 5, justifyContent: 'space-between',alignItems:'center'}}>
                <Text style={{alignSelf: 'stretch', width:'60%', paddingTop:4}}>{res}</Text>
               
                <Icon as={FontAwesome} name='trash' style={{ color: 'red',fontSize:20}} onPress={() => this.removeBarcode(res)}/>
              </View>
            </View>
            );
          })
        }
        {this.state.barcodesdata.length > 0 &&
          <View style={{flexDirection:'row',flex:1,width:"100%"}}>
            
            <View style={{width:"50%",paddingRight:20,paddingLeft:5}}> 
              <Button 
                style={{ height: 40, width:'100%',backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5,marginTop:10}}
                onPress={() => this.props.navigation.navigate('ScanParcel')}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>Back</Text>
              </Button> 
            </View>  
          </View>         
        } 

          </Box>):null
        }
        
        </ScrollView>
        {this.state.isloading && (
              <Loader />
          )}
        </SafeAreaView>


    );
  }
}


const styles1 = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    borderColor: '#00c2f3',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalView2: {
  margin: 20,
  backgroundColor: "white",
  borderRadius: 20,
  padding: 35,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 5,
    height: 2
  }

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
export default connect(mapStateToProps,matchDispatchToProps)(AddBarcode);