import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { Block, theme, Text } from "galio-framework";
import { Language } from "../constants";
const { width } = Dimensions.get("screen");
import API from "./../services/api";

import config from "./../config";
import { LoadingIndicator } from "react-native-expo-fancy-alerts";
import { Checkbox } from "galio-framework";
import moment from "moment";
import Geolocation from "@react-native-community/geolocation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OneSignal from "react-native-onesignal";
import MapView, { Marker } from "react-native-maps";
function Orders({ navigation }) {
  const { height, width } = useWindowDimensions();

  const [currentLongitude, setCurrentLongitude] = useState("...");
  const [currentLatitude, setCurrentLatitude] = useState("...");
  const [locationStatus, setLocationStatus] = useState("");
  //Location
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [orders, setOrders] = useState([]);
  const [available, setAvailable] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const cardContainer = [styles.card, styles.shadow];

  const [driverLongitude, setDriverLongitude] = useState(75.857727);
  const [driverLatitude, setDriverLatitude] = useState(22.719568);
  const [Usertoken, setUserToken] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderIdData, setOrderIdData] = useState();

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
            setLocationStatus("Permission Denied");
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
        alert("foreground", notification.additionalData.orderId);
        setOrderIdData(notification.additionalData.orderId);
        // Complete with null means don't show a notification.
        notificationReceivedEvent.complete(notification);
      }
    );

    //Method for handling notifications opened
    OneSignal.setNotificationOpenedHandler((notification) => {
      console.log("OneSignal: notification opened:", notification);
      alert(
        "OneSignal: notification opened:",
        notification.notification.additionalData.OrderId
      );
      setOrderIdData(notification.notification.additionalData.OrderId);
    });
  }, []);

  const getOneTimeLocation = () => {
    setLocationStatus("Getting Location ...");
    Geolocation.getCurrentPosition(
      //Will give you the current location
      (position) => {
        setLocationStatus("You are Here");
        setLocation(position)
        //getting the Longitude from the location json
        const currentLongitude = JSON.stringify(position.coords.longitude);

        //getting the Latitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);

        //Setting Longitude state
        setCurrentLongitude(currentLongitude);
        console.log("currentLongitude", currentLongitude);
        //Setting Longitude state
        setCurrentLatitude(currentLatitude);
        console.log("currentLatitude", currentLatitude);
      },
      (error) => {
        setLocationStatus(error.message);
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
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const acceptOrder = async () => {
    await fetch(
      `http://52.45.29.19/api/v2/driver/orders/acceptorder/${orderIdData}?api_token=${Usertoken}`
    )
      .then((response) => response.json())
      .then((json) => {
        console.log("json", json);
        if (json.message == "Order not on this driver") {
          alert("Order Ticket Assigned To Another Driver !!");
          setOrderIdData(null);
        } else {
          navigation.navigate("DriverOrder");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const rejectOrder = async () => {
    await fetch(
      `http://52.45.29.19/api/v2/driver/orders/rejectorder/${orderIdData}?api_token=${Usertoken}`
    )
      .then((response) => response.json())
      .then((json) => {
        if (json.message == "Order not on this driver") {
          alert("Order Ticket Assigned To Another Driver !!");
          setOrderIdData(null);
        } else {
          setOrderIdData(null);
        }
      })

      .catch((error) => {
        console.error(error);
      });
  };
  const TicketAssigned = () => {
    // console.log('ticketnav', nav)
    return (
      <View>
        <Text
          style={{
            fontSize: 20,
            alignSelf: "center",
            padding: 10,
            color: "black",
          }}
        >
          Order Ticket Assigned
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            margin: 10,
          }}
        >
          <Image
            source={require("../assets/imgs/restaurantadd.png")}
            style={{ height: 25, width: 25 }}
          />
          <Text>PICKUP ADD : {orderIdData} </Text>
        </View>
        <View style={styles.view}>
          <Image
            source={require("../assets/imgs/user.png")}
            style={{ height: 25, width: 25 }}
          />
          <Text>DELIVER ADD :{orderIdData} </Text>
        </View>
        <View style={styles.view}>
          <View
            style={{
              height: 40,
              width: "40%",
              backgroundColor: "tomato",
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity onPress={() => rejectOrder()}>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Reject Ticket
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              height: 40,
              width: "40%",
              backgroundColor: "green",
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity onPress={() => acceptOrder()}>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Accept Ticket
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const updateDriverLocation = async (token) => {
    // console.log('dflkjskf',currentLatitude)
    // console.log('dflkjskdgdsgf',currentLongitude)

    await fetch(
      `http://52.45.29.19/api/UpdateDriverLatLng?api_token=${token}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: currentLatitude,
          lng: currentLongitude,
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

  function updateOrderLocation(ordersToUpdate) {
    if (location != null && location.coords) {
      ordersToUpdate.forEach((orderToUpdate) => {
        API.updateDriverOrderLocation(
          orderToUpdate.id,
          location.coords.latitude,
          location.coords.longitude,
          (ordersUpdateResponse) => {},
          (errorOrdersUpdateResponse) => {}
        );
      });
    }
  }

  useEffect(() => {
    if (config.DRIVER_APP) {
      //Driver get orders
      API.getDriverOrders(
        (ordersResponse) => {
          setOrders(ordersResponse);
          updateOrderLocation(
            ordersResponse.filter(function (e) {
              return e.last_status[0].alias == "picked_up";
            })
          );
          setOrdersLoaded(true);
          setRefreshing(false);
        },
        (error) => {
          setOrders([]);
          setRefreshing(false);
          setOrdersLoaded(true);
          alert(error);
        }
      );

      API.getDriverStatus((statusResponse) => {
        // console.log(statusResponse);
        setAvailable(statusResponse.working + "" == "1");
      });
    }
    if (config.VENDOR_APP) {
      //Vendor get orders
      API.getVendorOrders(
        (ordersResponse) => {
          setOrders(ordersResponse);
          setOrdersLoaded(true);
          setRefreshing(false);
        },
        (error) => {
          setOrders([]);
          setRefreshing(false);
          setOrdersLoaded(true);
          alert(error);
        }
      );
    } else {
      //Client get orders
      API.getClientOrders((ordersResponse) => {
        setOrders(ordersResponse);
        setOrdersLoaded(true);
        setRefreshing(false);
      });
    }
  }, [refreshing]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, [refreshing]);

  //Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

  function renderOrderItem(item) {
    // console.log('items------>',item)
    return (
      <Block row={true} card flex style={cardContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("OrderDetails", { order: item });
          }}
        >
          <Block flex space="between" style={styles.cardDescription}>
            <Text bold style={styles.cardTitle}>
              #{item.id} {item.restorant.name}
            </Text>
            <Text muted style={styles.cardTitle}>
              {Language.created + ": "}
              {moment(item.created_at).format(config.dateTimeFormat)}
            </Text>
            <Text muted bold style={styles.cardTitle}>
              {Language.status + ": "}
              {item.status.length - 1 > -1
                ? item.status[item.status.length - 1].name
                : ""}
            </Text>
            <Text bold style={styles.cardTitle}>
              {parseFloat(item.order_price) + parseFloat(item.delivery_price)}
              {config.currencySign}
            </Text>
          </Block>
        </TouchableOpacity>
      </Block>
    );
  }

  function renderNoOrders() {
    if (ordersLoaded && orders.length == 0) {
      return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Text muted style={{ fontWeight: "bold", color: "black" }}>
            YOU DON'T HAVE ANY ORDER TICKET
          </Text>
        </View>
      );
    } else {
      return null;
    }
  }

  return (
    <Block flex center style={styles.home}>
      {renderDriverActionBox(available)}

      <View
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <MapView
          region={{
            latitude: driverLatitude,
            longitude: driverLongitude,
            latitudeDelta: 0.006,
            longitudeDelta: 0.044,
          }}
          style={{ height: "40%", width: width }}
          showsScale={true}
          showsBuildings={true}
        >
          <Marker
            key={1}
            coordinate={{
              latitude: driverLatitude,
              longitude: driverLongitude,
            }}
            title={"Driver Location"}
            description={"You are here !!"}
          >
            <Image
              source={require("../assets/imgs/drivermarker.png")}
              style={{ height: 30, width: 30 }}
            />
          </Marker>

          
        </MapView>
        <View style={{ height: 400, backgroundColor: "white" }}>
          <TouchableOpacity onPress={() => navigation.navigate("DriverOrder")}>
            <Text>Orders</Text>
          </TouchableOpacity>
          {/* {orders.map((item) => {
            return renderOrderItem(item);
          })}
          {renderNoOrders()} */}
          {orderIdData ? TicketAssigned() : renderNoOrders()}
        </View>
      </View>
    </Block>
  );
}

const OrderDetail = () => {
  return (
    <View>
      <Text
        style={{
          alignSelf: "center",
          margin: 10,
          fontWeight: "bold",
          fontSize: 20,
        }}
      >
        Order Details
      </Text>

      <View style={{ padding: 20, flexWrap: "wrap", width: 400 }}>
        <Text style={{ fontSize: 15, width: "100%" }}>Pickup Address : </Text>
        <Text style={{ fontSize: 15, width: "100%" }}>Delivery Address : </Text>
        <Text style={{ fontSize: 15, width: "100%" }}>
          Items : 2x Pizza, 1x Sandiwtch
        </Text>
        <Text style={{ fontSize: 15, width: "100%" }}>
          Call To Restaurant :{" "}
        </Text>
        <Text style={{ fontSize: 15, width: "100%" }}>Call To Customer : </Text>
        <Text style={{ fontSize: 15, width: "100%" }}>Order Type : PAID</Text>
      </View>
      <View
        style={{
          height: 50,
          width: "40%",
          alignSelf: "center",
          backgroundColor: "green",
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Picked Up</Text>
      </View>
    </View>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: 400,
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
    minHeight: 50,
    maxHeight: 50,
    marginHorizontal: 16,
    marginBottom: 16,
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
  view: { flexDirection: "row", justifyContent: "space-around", margin: 5 },
});
