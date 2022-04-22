import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  useWindowDimensions,
  Linking,
} from "react-native";

import { Block, theme, Text } from "galio-framework";
import { Language } from "../constants";
const { width } = Dimensions.get("screen");
import API from "./../services/api";

import config from "./../config";
import FancyMessageModal from "../components/FancyMessageModal";
import { Checkbox } from "galio-framework";

import Geolocation from "@react-native-community/geolocation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OneSignal from "react-native-onesignal";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { LoadingIndicator } from "react-native-expo-fancy-alerts";
import { ScrollView } from "react-native-gesture-handler";

function Orders2({ navigation, route }) {
  // console.log(navigation.route.params.orderlat)
  const { height, width } = useWindowDimensions();

  const [currentLongitude, setCurrentLongitude] = useState(0);
  const [currentLatitude, setCurrentLatitude] = useState(0);
  const [order, setOrder] = useState();

  
  //Location
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [modalShown, setModalShown] = useState(false);
  const [available, setAvailable] = useState(false);
  const [modalMessage, setModalMessage] = useState(false);
  const cardContainer = [styles.card, styles.shadow];
  const [apiMessage, setApiMessage] = useState();
  const [loading, setLoading] = useState(false);

  const [Usertoken, setUserToken] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === "ios") {
        getOneTimeLocation();
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Access Required",
              message: "This App needs to Access your location",
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //To Check, If Permission is granted
            getOneTimeLocation();
          } else {
            console.log("Permission Denied");
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestLocationPermission();

    OneSignal.setNotificationWillShowInForegroundHandler(
      (notificationReceivedEvent) => {
        console.log(
          "OneSignal: notification will show in foreground:",
          notificationReceivedEvent
        );
        let notification = notificationReceivedEvent.getNotification();
        console.log("notification: ", notification);

        console.log("additionalData: ", notification.additionalData);
        // alert("foreground", notification.additionalData.orderId);
        let order = notification.additionalData;
        setOrder(order);
        console.log("order---->", order);

        // Complete with null means don't show a notification.
        notificationReceivedEvent.complete(notification);
      }
    );

    //Method for handling notifications opened
    OneSignal.setNotificationOpenedHandler((notification) => {
      console.log(
        "OneSignal: notification opened:",
        notification.notification.additionalData
      );
      let order = notification.notification.additionalData;
      setOrder(order);
      console.log("order---->", order);
    });

    if (config.DRIVER_APP) {
      //Driver get orders

      API.getDriverStatus((statusResponse) => {
        console.log(statusResponse);
        setAvailable(statusResponse.working + "" == "1");
      });
    }
  }, []);

  let curLatitude;
  let curLongitude;

  const getOneTimeLocation = async () => {
    Geolocation.getCurrentPosition(
      //Will give you the current location
      (position) => {
        setLocation(position);
        //getting the Longitude from the location json
        curLongitude = JSON.stringify(position.coords.longitude);

        //getting the Latitude from the location json
        curLatitude = JSON.stringify(position.coords.latitude);

        //Setting Longitude state
        setCurrentLongitude(curLongitude);
        console.log("currentLongitude", curLongitude);
        //Setting Longitude state
        setCurrentLatitude(curLatitude);
        console.log("currentLatitude", curLatitude);
      },
      (error) => {
        alert(error.message);
      }
    );
  };

  //getting driver location on every 3 sec
  useEffect(() => {
    const interval = setInterval(async () => {
      getOneTimeLocation();
      var token = await AsyncStorage.getItem("token", "");
      setUserToken(token);

      await updateDriverLocation(token);
      console.log(token);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const acceptOrder = async () => {
    setLoading(true);
    await fetch(
      `http://52.45.29.19/api/v2/driver/orders/acceptorder/${order.orderId}?api_token=${Usertoken}`
    )
      .then((response) => response.json())

      .then((json) => {
        console.log("json", json);

        if (json.message == "Order not on this driver") {
          setLoading(false);
          setApiMessage(json.message);
          setModalMessage(true);
         
          setOrder(null);
          setModalShown(false);
        } else {
          setLoading(false);
          setModalShown(false);
          setOrder(null);
          navigation.navigate("DriverOrder");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const rejectOrder = async () => {
    // console.log(orderIdData);
    console.log("hii");
    // console.log(Usertoken);
    setLoading(true);
    await fetch(
      `http://52.45.29.19/api/v2/driver/orders/rejectorder/${order.orderId}?api_token=${Usertoken}`
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(json.message);
        if (json.message == "Order not on this driver") {
          setLoading(false);
          setApiMessage(json.message);
          setModalMessage(true);
          setOrder(null);
          setModalShown(false);
        } else {
          setLoading(false);
          setOrder(null);
          setModalShown(false);
        }
      })

      .catch((error) => {
        console.error(error);
      });
  };

  const updateDriverLocation = async (token) => {
    await fetch(
      `http://52.45.29.19/api/UpdateDriverLatLng?api_token=${token}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: curLatitude,
          lng: curLongitude,
        }),
      }
    )
      .then((response) => response.json())
      .then((json) => {
        console.log("json", json);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  function setActiveStatus(status) {
    API.setActiveStatus(status, (statusResponse) => {
      // console.log("Changed to ->"+statusResponse);
      setAvailable(statusResponse);
    });
  }

  function renderDriverActionBox(initValue) {
    if (config.DRIVER_APP) {
      if (initValue) {
        return (
          <Block row={true} card flex style={styles.actioncard}>
            <TouchableOpacity
              style={{ alignSelf: "center", margin: "3%" }}
              onPress={() => {
                navigation.openDrawer();
              }}
            >
              <Image
                style={{ height: 35, width: 25 }}
                source={require("../assets/imgs/menu.png")}
              />
            </TouchableOpacity>
            <Block
              style={{ some: available }}
              flex
              space="between"
              justifyContent="center"
              paddingHorizontal={10}
            >
              <Checkbox
                key={"true"}
                onChange={setActiveStatus}
                initialValue={true}
                color="success"
                labelStyle={{ color: "white" }}
                color="success"
                checkboxStyle={{ margin: 10 }}
                label={Language.driverWorkingStatus}
              />
            </Block>
          </Block>
        );
      } else {
        return (
          <Block row={true} card flex style={styles.actioncard}>
            <TouchableOpacity
              style={{ alignSelf: "center", margin: "3%" }}
              onPress={() => {
                navigation.openDrawer();
              }}
            >
              <Image
                style={{ height: 35, width: 25 }}
                source={require("../assets/imgs/menu.png")}
              />
            </TouchableOpacity>
            <Block
              style={{ some: available }}
              flex
              space="between"
              justifyContent="center"
              paddingHorizontal={10}
            >
              <Checkbox
                key={"false"}
                onChange={setActiveStatus}
                initialValue={false}
                color="success"
                labelStyle={{ color: "white" }}
                color="success"
                checkboxStyle={{ margin: 10 }}
                label={Language.driverWorkingStatus}
              />
            </Block>
          </Block>
        );
      }
    } else {
      return null;
    }
  }

  function Modal() {
    return (
      <View
        style={styles.modalView}
      >
        <Text
          style={{
            color: "black",
            fontWeight: "bold",
            alignSelf: "center",
            fontSize: 17,
          }}
        >
          Order Ticket Assigned
        </Text>
        <ScrollView style={{ margin: 10 }}>
          <Text style={{ color: "black", marginTop: 5, marginBottom: 5 }}>
            Ticket Id : {order.orderId}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Image
              style={{ height: 35, width: 35 }}
              source={require("../assets/imgs/restaurant.png")}
            />
            <Text style={{ color: "black", marginLeft: 10 }}>
              {order.RestaurantAdd}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <TouchableOpacity
              onPress={() => openPhoneApp(order.restPhone)}
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                backgroundColor: "teal",
                justifyContent: "center",
                justifyContent: "center",
                margin: 5,
                alignSelf: "center",
              }}
            >
              <Image
                style={styles.iconBtn}
                source={require("../assets/imgs/phone-call.png")}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setOrder(null)}
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
            style={styles.iconBtn}
            source={require("../assets/imgs/close.png")}
          />
            </TouchableOpacity>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <TouchableOpacity
              style={{
                height: 30,
                width: "40%",
                backgroundColor: "green",
                borderRadius: 20,
              }}
              onPress={() => acceptOrder()}
            >
              <Text
                style={styles.btnText}
              >
                Accept
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 30,
                width: "40%",
                backgroundColor: "red",
                borderRadius: 20,
              }}
              onPress={() => rejectOrder()}
            >
              <Text
                style={styles.btnText}
              >
                Reject
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  function openPhoneApp(phoneNumber) {
    console.log(phoneNumber);
    var number = "tel:" + phoneNumber;
    Linking.canOpenURL(number).then((supported) => {
      if (supported) {
        Linking.openURL(number);
      } else {
      }
    });
  }
  function MessageModal() {
    return (
      <FancyMessageModal
        visible={modalMessage}
        icon_ios={"ios-thumbs-down-outline"}
        icon_android="md-thumbs-down"
        subtitle={apiMessage}
        button={Language.ok}
        closeAction={() => {
          setModalMessage(false);
        }}
      ></FancyMessageModal>
    );
  }

  return (
    <>
      {renderDriverActionBox(available)}
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          region={{
            latitude: Number(currentLatitude),
            longitude: Number(currentLongitude),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            key={2}
            coordinate={{
              latitude: Number(currentLatitude),
              longitude: Number(currentLongitude),
            }}
            title={"You are here !! "}
          >
            <Image
              source={require("../assets/imgs/drivermark.png")}
              style={{ height: 30, width: 30 }}
            />
          </Marker>
          {order ? (
            <Marker
              key={2}
              coordinate={{
                latitude: Number(order.custLat),
                longitude: Number(order.custLan),
              }}
              title={"Customer Location"}
              pinColor="green"
            ></Marker>
          ) : null}
          {order ? (
            <Marker
              key={3}
              coordinate={{
                latitude: Number(order.restLat),
                longitude: Number(order.restLan),
              }}
              title={"Restaurant Location"}
              pinColor="tomato"
            ></Marker>
          ) : null}
          
        </MapView>

        {order ? Modal() : null}
        {MessageModal()}

        <LoadingIndicator visible={loading} />
      </View>
    </>
  );
}

export default Orders2;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  cartCheckout: {
    backgroundColor: "white",
  },
  listStyle: {
    padding: theme.SIZES.BASE,
  },
  home: {
    width: width,
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  actionButtons: {
    //width: 100,
    backgroundColor: "#DCDCDC",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 9.5,
    borderRadius: 3,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 16,
  },
  actioncard: {
    backgroundColor: theme.COLORS.DARK_SUCCESS,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 40,
    maxHeight: 40,
    marginHorizontal: 10,
    marginBottom: 5,
    alignContent: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6,
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2,
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: "hidden",
    resizeMode: "cover",
  },
  image: {
    // borderRadius: 3,
  },
  horizontalImage: {
    height: 122,
    width: "auto",
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  fullImage: {
    height: 200,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  view: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 5,
  },
  text: {
    marginTop: 3,
    marginLeft: 5,
    marginRight: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  texthead: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    lineHeight: 40,
  },
  viewCard: {
    height: "30%",
    borderColor: "gray",
    borderWidth: 0,
    borderRadius: 20,
  },
  btnText:{
    color: "white",
    fontWeight: "bold",
    alignSelf: "center",
    justifyContent: "center",
  },
  iconBtn:{ height: 25, width: 25, alignSelf: "center" },
  modalView:{
          backgroundColor: "white",
          height: "35%",
          width: "90%",
          padding: 5,
          borderRadius: 20,
          alignSelf:'center',
          justifyContent:'center'
        }
  
});
