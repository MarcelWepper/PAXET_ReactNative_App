import React from "react";
import { Button, Text } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

const fetchLocation = props => {
  return (
    <Icon.Button
      backgroundColor="#9b0029"
      name="globe-europe"
      onPress={props.onGetLocation}
    >
      <Text style={{ color: "white", fontWeight: "bold" }}>
        Standort auf Karte markieren
      </Text>
    </Icon.Button>
  );
};

export default fetchLocation;
