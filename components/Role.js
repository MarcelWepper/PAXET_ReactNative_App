// Role.js

//Role wird verwendet, damit geschaut wird, ob es sich um ein User -> Nach HubNavigator
// Oder um einen Paketboten -> Nach DeliveryNavigator handelt

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
import Spinner from "react-native-loading-spinner-overlay";

import FetchLocation from "./FetchLocation";
import UsersMap from "./UsersMap";

export default class Role extends React.Component {
  state = {
    currentUser: null,
    role: "",
    spinner: true
  };

  componentDidMount() {
    const { currentUser } = firebase.auth();

    // Listener, um die Rolle des Users zu speichern
    // es wird nach der Benutzermail gefiltert
    firebase
      .database()
      .ref("/users")
      .orderByChild("mail")
      .equalTo(currentUser.email)
      .once("child_added", snapshot => {
        this.setState({
          role: snapshot.val().role
        });
      })
      .then(() => {
        if (this.state.role == "delivery") {
          return this.props.navigation.navigate("Delivery");
        } else {
          return this.props.navigation.navigate("Main");
        }
      })
      .catch(error => {
        alert("DidMount: " + error);
      });
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
        <Spinner
          cancelable={true}
          visible={this.state.spinner}
          textContent={"Loading..."}
        />
        <Text>Warten Sie kurz, Sie werden sofort weitergeleitet.</Text>
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
