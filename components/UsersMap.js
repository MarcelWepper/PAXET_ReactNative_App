import React from "react";
import { View, StyleSheet, Image } from "react-native";
import MapView from "react-native-maps";
import FetchLocation from "./FetchLocation";
import Icon from "./pictures/Icon.png";

const usersMap = props => {
  let userLocationMarker = null;

  if (props.userLocation) {
    userLocationMarker = (
      <MapView.Marker coordinate={props.userLocation} image={Icon} />
    );
  }
  const usersMarkers = props.usersPlaces.map(userPlace => (
    <MapView.Marker coordinate={userPlace} key={userPlace.id}>
      <Image source={Icon} style={{ width: 13, height: 13 }} />
    </MapView.Marker>
  ));
  return (
    <View style={styles.mapContainer}>
      <MapView
        initialRegion={{
          latitude: 50.633481,
          longitude: 10.018343,
          latitudeDelta: 8.0622,
          longitudeDelta: 8.0421
        }}
        region={props.userLocation}
        style={styles.map}
      >
        {userLocationMarker}
        {usersMarkers}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: "100%",
    marginTop: 0
  },
  map: {
    width: "100%",
    height: "100%"
  }
});

export default usersMap;
