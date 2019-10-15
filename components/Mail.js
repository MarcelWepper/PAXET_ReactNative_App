// Mail.js

// JS, welche bei der erfolgreichen ersten Registrierung eine Mail an den User schickt,
// damit man diese bestätigen muss

// wird jedes mal ausgelöst, solange bis der User die Mail bestätigt hat

import React from "react";
import { StyleSheet, Platform, Image, Text, View } from "react-native";
import {
  Container,
  Content,
  Header,
  Left,
  Right,
  Body,
  Item,
  Button,
  Label
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import firebase from "react-native-firebase";

import FetchLocation from "./FetchLocation";
import UsersMap from "./UsersMap";

export default class Mail extends React.Component {
  state = {
    currentUser: null
  };

  componentDidMount() {
    // Wenn geladen wird, dann wird automatisch neue Mail für Verification gesendet
    // bei erstmaligen Sign-Up
    // oder bei Einloggen ohne Verification
    // wird es ausgelöst
    const { currentUser } = firebase.auth();
    this.setState({ currentUser });
    firebase
      .auth()
      .currentUser.sendEmailVerification()
      .catch(function(error) {});
  }

  render() {
    const logout_button = (
      <Icon.Button
        name="sign-out-alt"
        backgroundColor="#c1c1c1"
        onPress={() => this.props.navigation.navigate("Login")}
      />
    );

    return (
      <View style={styles.container}>
        <Text>Eine Bestätigungsmail wurde an dich gesendet.</Text>
        <Text>Bestätige diese Mail und</Text>
        <Text>Logge dich bitte danach noch einmal ein.</Text>
        {logout_button}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
