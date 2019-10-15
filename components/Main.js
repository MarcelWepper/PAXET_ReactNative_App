// Main.js

//npm install react-native-vector-icons muss in Android eingebunden werden
//GPS von Maps muss in Android eingebunden werden

import React from "react";
import {
  StyleSheet,
  Platform,
  Image,
  Text,
  View,
  Alert,
  Linking
} from "react-native";
import {
  Container,
  Content,
  Header,
  Left,
  Right,
  Body,
  Item,
  Button,
  Label,
  Switch,
  Grid,
  Row,
  Col,
  H3,
  Form,
  StatusBar
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import firebase from "react-native-firebase";
import { addUserFName } from "./PAXET";
import Spinner from "react-native-loading-spinner-overlay";

import FetchLocation from "./FetchLocation";
import UsersMap from "./UsersMap";
import { connect } from "react-redux";

class Main extends React.Component {
  state = {
    spinner: true,
    currentUser: null,
    userLocation: null,
    usersPlaces: [],
    firstName: "",
    verwendungszweck: "",
    credit: "",
    present: "",
    accepted: false,
    isModalVisible: false,
    intervalID: 0,
    role: ""
  };

  componentDidMount() {
    const { currentUser } = firebase.auth();
    this.setState({ currentUser });

    // SPinner zum laden
    setInterval(() => {
      this.setState({
        spinner: false
      });
    }, 2000);

    // Wenn der User die Mail noch nicht angenommen hat
    // wird er automatisch auf Mail.js umgeleitet
    if (firebase.auth().currentUser.emailVerified == false) {
      return this.props.navigation.navigate("Mail");
    }

    // Listener, um die Informationen des Users zu speichern
    // es wird nach der Benutzermail gefiltert
    firebase
      .database()
      .ref("/users")
      .orderByChild("mail")
      .equalTo(currentUser.email)
      .once("child_added", snapshot => {
        this.setState({
          firstName: snapshot.val().firstName,
          lastName: snapshot.val().lastName,
          adress: snapshot.val().adress,
          accepted: snapshot.val().accepted,
          delivered: snapshot.val().delivered,
          coupons: snapshot.val().coupons,
          key: snapshot.val().key,
          pricetag: snapshot.val().pricetag,
          role: snapshot.val().role
        });
      })
      .then(() => {
        this.datasecurity();
      })

      .then(() => {
        this.credit();
      })
      .then(() => {
        this.dispatch();
      })
      .catch(error => {
        alert("DidMount: " + error);
      });

    //Automatisches anzeigen der Positionen der User
    fetch("https://paxet-app.firebaseio.com/places.json")
      .then(res => res.json())
      .then(parsedRes => {
        const placesArray = [];
        for (const key in parsedRes) {
          placesArray.push({
            latitude: parsedRes[key].latitude,
            longitude: parsedRes[key].longitude,
            id: key
          });
        }
        this.setState({
          usersPlaces: placesArray
        });
      })
      .catch(err => console.log(err));
  }

  // Hier werden alle Informationen des Users in den REDUX gespeichert

  credit = () => {
    //Funktion, welche den Credit zu laden
    firebase
      .database()
      .ref("/credit/")
      .orderByChild("key")
      .equalTo(this.state.key)
      .on("child_added", snapshot => {
        this.setState({
          verwendungszweck: snapshot.val().verwendungszweck,
          credit: snapshot.val().credit
        });
      });
  };

  dispatch = () => {
    setInterval(() => {
      this.props.dispatch({
        type: "ADD_USERFNAME",
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        key: this.state.key,
        accepted: this.state.accepted,
        pricetag: this.state.pricetag,
        email: this.state.currentUser.email,
        adress: this.state.adress,
        delivered: this.state.delivered,
        credit: this.state.credit,
        verwendungszweck: this.state.verwendungszweck,
        role: this.state.role
      });
    }, 1000);
  };

  // Function, welche Voraussetzt, dass der User die Datenschutzrichtlinien akzeptiert
  datasecurity = () => {
    firebase
      .database()
      .ref("/datasecurity")
      .orderByChild("user")
      .equalTo(this.state.key)
      .once("value", snapshot => {
        if (snapshot.exists()) {
        } else {
          // SPinner zum laden
          this.state.intervalID = setInterval(() => {
            clearInterval(this.state.intervalID);
            Alert.alert(
              "Neue Datenschutzrichtlinien",
              "Die Datenschutzrichtlinien wurden aktualisiert. Um die Anwendung weiter verwenden zu können, akzeptiere diese, indem du auf den entsprechenden Knopf drückst.",
              [
                {
                  text: "Datenschutzrichtlinien lesen",
                  onPress: () => {
                    this.datasecurity();
                    Linking.openURL(
                      "https://paxet.de/datenschutzerklaerung-paxet-app/"
                    );
                  }
                },
                {
                  text:
                    "Ja, ich akzeptiere die Datenschutzrichtlinien hiermit.",
                  onPress: () => {
                    // Code, damit die Datenschutzrichtlinien akzeptiert werden
                    firebase
                      .database()
                      .ref(`${"/datasecurity/" + this.props.user.key}`)
                      .set({
                        user: this.props.user.key,
                        accepted: "accepted"
                      });
                  }
                },

                {
                  text:
                    "Nein, ich akzeptiere die Datenschutzrichtlinien nicht.",
                  onPress: () => firebase.auth().signOut()
                }
              ],
              { cancelable: false }
            );
          }, 500);
        }
      })
      .catch(err => alert("Datasecurity: " + err));
  };

  //Hinzufügen des Standortes der Person
  getUserLocationHandler = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          userLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0622,
            longitudeDelta: 0.0421
          }
        });
        fetch("https://paxet-app.firebaseio.com/places.json", {
          method: "POST",
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            user: this.state.currentUser.email
          })
        })
          .then(res => console.log(res))
          .catch(err => console.log(err));
      },
      err => alert("Bitte aktiviere dein GPS manuell.")
    );
  };

  // Sliderfunktion, um anwesend / abwesend anzuzeigen

  AnwesendheitsSlider = () => {
    firebase
      .database()
      .ref(`/delivery/${this.state.key}`)
      .update({
        present: !this.state.present
      })
      .catch(error => {
        alert("PickerError: " + error);
      });

    if (!this.state.present) {
      alert("Du bist jetzt anwesend.");
    } else {
      alert("Du bist jetzt abwesend.");
    }

    this.setState({
      present: !this.state.present
    });
  };

  render() {
    const { currentUser } = this.state;

    const menu_button = (
      <Icon.Button
        name="bars"
        backgroundColor="#5d0018"
        onPress={() => this.props.navigation.toggleDrawer()}
        style={{
          marginRight: -7.5
        }}
      />
    );

    const logout_button = (
      <Icon.Button
        name="sign-out-alt"
        backgroundColor="#5d0018"
        onPress={() => firebase.auth().signOut()}
        style={{ marginRight: 0, textAlign: "center" }}
      />
    );

    return (
      <Container style={styles.container}>
        <Spinner
          cancelable={true}
          visible={this.state.spinner}
          textContent={"Loading..."}
        />
        <Header style={{ height: 75, backgroundColor: "#9b0029" }}>
          <Left style={{ flex: 0 }}>{menu_button}</Left>
          <Body>
            <Text
              style={{
                paddingTop: 10,
                flex: 3,
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                alignSelf: "center",
                justifyContent: "center"
              }}
            >
              Die PAXET-Karte,{"\n"}
              {this.props.user.firstName}
            </Text>
          </Body>
          <Right style={{ flex: 0 }}>{logout_button}</Right>
        </Header>

        <UsersMap
          userLocation={this.state.userLocation}
          usersPlaces={this.state.usersPlaces}
        />
        {/* Switch, welche anwesend und abwesend hat -
          Funktion fehlt für Hinweis über Statusbar

        <View
          style={{
            position: "absolute", //use absolute position to show button on top of the map
            top: 125, //for center align
            alignSelf: "center",
            justifyContent: "center",
            paddingTop: 25,
            paddingBottom: 25,
            paddingLeft: 50,
            paddingRight: 50,
            borderRadius: 20,
            backgroundColor: "#9b0029"
          }}
        >
          <Text
            style={{ fontWeight: "bold", color: "black", paddingBottom: 12 }}
          >
            Anwesenheit:
          </Text>
          <View style={{ alignSelf: "center", justifyContent: "center" }}>
            <Switch
              onValueChange={this.AnwesendheitsSlider}
              value={this.state.present}
            />
          </View>
        </View>

        */}

        <View
          style={{
            position: "absolute", //use absolute position to show button on top of the map
            top: "90%", //for center align
            alignSelf: "center",
            justifyContent: "center"
          }}
        >
          <FetchLocation onGetLocation={this.getUserLocationHandler} />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const mapStateToProps = state => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps)(Main);
