import {
    StyleSheet,
    Dimensions,
    ScrollView,
    RefreshControl,
    View,
    Image,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
    useWindowDimensions,
    Linking,
    Text
  } from "react-native";
import React, {useEffect} from 'react'
import API from "./../services/api";
const OrderModal = () => {
    useEffect(()=>{
     
     
        
          //Driver get orders
          API.getDriverOrder("1285",(ordersResponse)=>{
            ordersResponse.restorant=order.restorant;
            ordersResponse.client=order.client;
            ordersResponse.address=order.address;
            ordersResponse.items=order.items;
            console.log(ordersResponse)
            
          },(error)=>{console.log(error)})
       
      },[])
    
   
    return(
      <View
      style={{
        backgroundColor: "white",
        height: "40%",
        width: "90%",
        padding: 5,
        borderRadius: 20,
      }}
      >
      <Text
      style={{
        color: "black",
        fontWeight: "bold",
        alignSelf: "center",
        fontSize: 17,
      }}
      >Order Details</Text>
      <ScrollView>
      <View style={{ margin: 10 }}>
      <Text style={{ color: "black", marginTop: 5, marginBottom: 5 }}>
        Ticket Id : 
      </Text>
      <View style={{ flexDirection: "row", marginTop:5 }}>
        <Image
          style={{ height: 35, width: 35 }}
          source={require("../assets/imgs/restaurant.png")}
        />
        <Text style={{ color: "black", marginLeft: 10 }}>
         
        </Text>
      </View>
      <View style={{ flexDirection: "row", marginTop:5 }}>
        <Image
          style={{ height: 35, width: 35 }}
          source={require("../assets/imgs/location.png")}
        />
        <Text style={{ color: "black", marginLeft: 10 }}>
         
        </Text>
      </View>
      <View style={{flexDirection:'row', justifyContent:'center'}}>
      <TouchableOpacity
    //   onPress={()=> openPhoneApp(order.restPhone)}
        style={{
          height: 40,
          width: 40,
          borderRadius: 20,
          backgroundColor: "tomato",
          justifyContent: "center",
          justifyContent: "center",
          margin: 5,
          alignSelf: "center",
        }}
      >

        <Image
          style={{ height: 25, width: 25, alignSelf: "center" }}
          source={require("../assets/imgs/phone-call.png")}
        />
      </TouchableOpacity>
      
      </View>

      <TouchableOpacity
    //   onPress={()=> openPhoneApp(order.restPhone)}
        style={{
          height: 40,
          width: '80%',
          borderRadius: 20,
          backgroundColor: "tomato",
          justifyContent: "center",
          justifyContent: "center",
          margin: 5,
          alignSelf: "center",
        }}
      ></TouchableOpacity>
      <View
       
      >
        <Text>hjhjhh</Text>
        <Text>hjhjhh</Text>
        <Text>hjhjhh</Text>
        <Text>hjhjhh</Text>

       
      </View>
      
    </View>
      </ScrollView>
      </View>
  )
}

export default OrderModal

const styles = StyleSheet.create({})
