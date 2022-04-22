import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import MapView, { Marker } from 'react-native-maps';
import { FancyAlert, LoadingIndicator } from 'react-native-expo-fancy-alerts';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const DriverHome = () => {
    const [location, setLocation] = useState(null);
    const [driverLongitude, setDriverLongitude] = useState(null);
    const [driverLatitude, setDriverLatitude] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
             setDriverLatitude(location.coords.latitude)
             setDriverLongitude(location.coords.longitude)
            console.log('location====>', location)
        })();
    }, []);


    useEffect(() => {
        const interval = setInterval(async () => {
            let location = await Location.getCurrentPositionAsync({});

             console.log('new location-->', location.coords)
            // setLocation(location);
            // setDriverLatitude(location.coords.latitude)
            // setDriverLongitude(location.coords.longitude)
            // console.log('driver long---->', driverLongitude)
            // console.log('driver lat---->', driverLatitude)



        }, 2000);
        return () => clearInterval(interval);
    }, []);


    return (
        <View style={{ flex: 1 }}>
            {
                location ?
                   
                    <MapView

                        region={{
                            latitude: driverLatitude,
                            longitude: driverLongitude,
                            latitudeDelta: 0.006,
                            longitudeDelta: 0.004,
                        }}
                        style={styles.map}
                        showsScale={true}
                        showsBuildings={true}
                    >

                        <Marker
                            key={1}
                            coordinate={{ latitude: driverLatitude, longitude: driverLongitude }}
                            title={"Driver Location"}
                            description={"You are here !!"}

                        >
                            <Image source={require('../assets/imgs/drivermarker.png')} style={{ height: 40, width: 40, }} />
                        </Marker>
                        {/* <View style={{alignItems:'center', justifyContent:'center'}}>
                            <Text style={{fontSize:32}}>hii</Text>
                        </View> */}

                    </MapView>
                    

                    :



                    <FancyAlert
                        visible={true}
                        icon={
                            <View style={{
                                flex: 1,
                                display: 'flex',
                                justify: 'center',
                                alignItems: 'center',
                                backgroundColor: 'red',
                                borderRadius: 39,
                                width: '100%',
                                paddingTop: 8,
                            }}>
                                <Ionicons
                                    name={Platform.select({ ios: 'ios-cash', android: 'md-cash' })}
                                    size={36}
                                    color="#FFFFFF"
                                /></View>
                        }
                        style={{ backgroundColor: 'white' }}
                    >

                        <View style={styles.content}>
                            <Text bold style={styles.contentText}>Required GPS Permission</Text>
                            <Text style={styles.contentText}>App Required To Use Location </Text>

                            <TouchableOpacity style={styles.btn} onPress={() => {
                                console.log('pressed')

                                //this.goToHome();
                            }
                            }
                            >
                                <Text style={styles.btnText}>{Language.ok}</Text>
                            </TouchableOpacity>
                        </View>


                    </FancyAlert>
            }




        </View>
    )
}

export default DriverHome

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        height: 400,
        width: 400,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },

    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -16,
        marginBottom: 16,
    },
    contentText: {
        textAlign: 'center',
    },
    btn: {
        borderRadius: 32,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        alignSelf: 'stretch',
        backgroundColor: '#4CB748',
        marginTop: 16,
        minWidth: '50%',
        paddingHorizontal: 16,
    },
    btnwarning: {
        borderRadius: 32,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        alignSelf: 'stretch',
        backgroundColor: 'red',
        marginTop: 16,
        minWidth: '50%',
        paddingHorizontal: 16,
    },
    btnText: {
        color: '#FFFFFF',
    },


});
