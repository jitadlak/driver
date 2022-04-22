import APICaller from './api_callers';
import config from "./../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import OneSignal from 'react-native-onesignal';
import {useState} from 'react';
/**
 * Login user
 * @param {*} email 
 * @param {*} password 
 * @param {*} callback 
 */
async function loginUser(email,password,callback){
  let fm 

  
    const deviceState = await OneSignal.getDeviceState();
    console.log(deviceState.userId);
     fm = deviceState.userId
    // setfm(deviceState.userId
      
    
  
   
  console.log('fm',fm)
    var link='client/auth/gettoken';
    if(config.DRIVER_APP){
      link='driver/auth/gettoken';
    }
    if(config.VENDOR_APP){
      link='vendor/auth/gettoken';
    }
    APICaller.publicAPI('POST',link,{
        email:email,
        password:password,
        fcm_token :fm
       },(response)=>{
        setSettings();
        callback(response)
    },(error)=>{alert(error)});
   }
exports.loginUser=loginUser;

/**
 * Register user / vendor account
 * @param {*} name 
 * @param {*} email 
 * @param {*} password 
 * @param {*} phone 
 * @param {*} callback 
 */
async function registerUser(name,email,password,phone ,callback){
  // const [fm, setfm] = useState("")
  let fm 
  let data
  const getDeviceState=async()=>{
    const deviceState = await OneSignal.getDeviceState();
    console.log(deviceState.userId);
     fm = deviceState.userId
    // setfm(deviceState.userId)
     data = { 
      name: name,
      email:email,
      password:password,
      phone:phone,
      app_secret:config.APP_SECRET,
      fcm_token:fm,
      
    };
  }
    await getDeviceState()
  console.log('fm',fm)
    
  
    var link='client/auth/register';
    if(config.DRIVER_APP){
      link='driver/auth/register';
    }
    if(config.VENDOR_APP){
      link='vendor/auth/register';
      data.vendor_name=name;
    }
    APICaller.publicAPI('POST',link,data,(response)=>{
        setSettings();
        callback(response)
    },(error)=>{alert(error)})
  
}
exports.registerUser=registerUser;

/**
 * Set setting
 */
async function setSettings(){
    APICaller.authAPI('GET','client/settings',{},async (response)=>{
      await AsyncStorage.setItem('settings',JSON.stringify(response));
    },(error)=>{console.log(error)})
}

/**
 * getNotifications
 * @param {*} callback 
 */
exports.getNotifications=async (callback)=>{APICaller.authAPI('GET','client/notifications',{},callback,(error)=>{console.log(error)})}
   

/**
 * Update orders status
 * @param {*} order_id 
 * @param {*} status_slug 
 * @param {*} comment 
 * @param {*} callback 
 */
exports.updateOrderStatus=async (order_id,status_slug,comment,callback)=>{
    var statuses={
        "just_created":"1",
        "accepted_by_admin":"2",
        "accepted_by_restaurant":"3",
        "assigned_to_driver":"4",
        "prepared":"5",
        "picked_up":"6",
        "delivered":"7",
        "rejected_by_admin":"8",
        "rejected_by_restaurant":"9",
        "updated":"10",
        "closed":"11",
        "rejected_by_driver":"12",
        "accepted_by_driver":"13",
        "arrived_at_restaurant": "14",
        "arrived_at_customer": "15,"

    }
    var mode=config.DRIVER_APP?"driver":"vendor";
    APICaller.authAPI('GET',mode+'/orders/updateorderstatus/'+order_id+"/"+statuses[status_slug],{"comment":comment},callback,(error)=>{console.log(error)})
};
