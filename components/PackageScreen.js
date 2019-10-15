// User.js
// Hier können Pakete hinzugefüget
// und als "abgegeben" makiert werden
import React from "react";
import {
  StyleSheet,
  Platform,
  Image,
  Text,
  View,
  ListView,
  TouchableOpacity,
  AsyncStorage,
  Dimensions,
  Alert
} from "react-native";
import {
  Container,
  Content,
  Header,
  Form,
  Input,
  Right,
  Left,
  Body,
  Item,
  Button,
  Label,
  List,
  ListItem,
  Fab,
  H2
} from "native-base";
import firebase from "react-native-firebase";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/FontAwesome5";
import ImagePicker from "react-native-image-picker";
import { connect } from "react-redux";
import Spinner from "react-native-loading-spinner-overlay";

import uuid from "uuid/v4";

// Array, welcher die Metainformationen des Pakethinzufügens speichert
var data = [];

class PackageScreen extends React.Component {
  constructor(props) {
    super(props);

    //States für die Liste der Pakete
    this.state = {
      // enthält die Informationen aller Pakete
      spinner: true,
      listViewData: data,
      listViewPackage: [],
      comment: "",
      delivery: "",
      bildpfad: "",
      date: "",
      packagekey: "",
      stateurlProfile: "",
      currentUser: null,
      database: firebase.database(),
      imgSource: "",
      ViewPackageInfos: [],
      //Userinformationen
      firstName: "",
      lastName: "",
      adress: "",
      accepted: "",
      delivered: "",
      coupons: "",
      key: "",
      pricetag: "",
      credit: ""
    };
  }

  //States für die Bilder
  state = {
    imgSource: "",
    resizedImageUri: "",
    uploading: false,
    progress: 0,
    images: [],
    isInformationVisible: false,
    isAddPackageVisible: false
  };

  componentDidMount() {
    // Authentification
    const { currentUser } = firebase.auth();
    this.setState({ currentUser });

    // Um die Anzahl der Abgegeben Pakete zu erhöhen
    firebase
      .database()
      .ref("/users")
      .orderByChild("mail")
      .equalTo(currentUser.email)
      .once("child_added", snapshot => {
        this.setState({
          delivered: snapshot.val().delivered,
          pricetag: snapshot.val().pricetag
        });
      });

    //Funktion, welche den Credit lädt
    firebase
      .database()
      .ref("/credit/")
      .orderByChild("key")
      .equalTo(this.props.user.key)
      .on("child_added", snapshot => {
        this.setState({
          credit: snapshot.val().credit
        });
      });

    this.showRow();

    setInterval(() => {
      this.setState({
        spinner: false
      });
    }, 1500);
  }

  showRow() {
    var that = this;
    firebase
      .database()
      .ref("pakete/" + `${this.props.user.key}`)
      .orderByChild("key")
      .equalTo(this.props.user.packagekey)
      .once("child_added", snapshot => {
        this.setState({
          // Werte, die in dem Modal angezeigt werden
          delivery: snapshot.val().delivery,
          comment: snapshot.val().comment,
          bildpfad: snapshot.val().bildpfad,
          status: snapshot.val().status,
          date: snapshot.val().date,
          packagekey: snapshot.val().key
        });
      })
      .then(() => {
        this.showPicture(this.state.bildpfad);
      })
      .catch(error => {
        alert("ShowRow: " + error);
      });
  }

  //load the picture of the package
  async showPicture(bildpfad) {
    firebase
      .storage()
      .ref("bilder/images")
      .child(`${bildpfad}`)
      .getDownloadURL()
      .then(url => {
        this.setState({
          stateurlProfile: url
        });
      });
  }

  render() {
    const { currentUser } = this.state;

    const menu_button = (
      <Icon.Button
        name="arrow-circle-left"
        backgroundColor="#5d0018"
        onPress={() => this.props.navigation.navigate("Pakete")}
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
      />
    );

    return (
      <Container style={styles.container}>
        <Spinner visible={this.state.spinner} textContent={"Loading..."} />
        <Container style={styles.header}>
          {/** Kopfzeile */}
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
                  alignSelf: "center"
                }}
              >
                Dein Paket,{"\n"}
                {this.props.user.firstName}
              </Text>
            </Body>
            <Right style={{ flex: 0 }}>{logout_button}</Right>
          </Header>
          {/** Hauptbereich in der Mitte */}
          <Container style={styles.body}>
            <Content>
              <Text>Unten siehst du alle Informationen deines Paketes:</Text>
              <Text>Der Zusteller war: {this.state.delivery}</Text>
              <Text>Das Datum und die Uhrzeit waren: {this.state.date}</Text>
              <Text>Der Status des Paketes: {this.state.status}</Text>
              {this.state.comment !== "" && (
                <Text>Der Kommentar ist: {this.state.comment}</Text>
              )}
              <Image
                source={{ uri: this.state.stateurlProfile }}
                style={styles.image}
                onLoadEnd={() => {
                  setInterval(() => {
                    this.setState({
                      spinner: false
                    });
                  }, 500);
                }}
              />
            </Content>
          </Container>
        </Container>
        {/** Floating Button down right */}
        {this.state.status === "Angenommen" && (
          <Fab
            active={this.state.active}
            direction="up"
            containerStyle={{}}
            style={{ backgroundColor: "#5d0018" }}
            position="bottomRight"
            onPress={() =>
              // Alert, um die Abgabe zu bestätigen

              Alert.alert(
                "Paket abgegeben",
                "Wurde das Packet an den Besitzer übergeben:",
                [
                  {
                    text: "Ja",
                    onPress: () => {
                      // Code zum updaten der Metadaten : ABgegeben und Abgabedatum
                      firebase
                        .database()
                        .ref(
                          `/pakete/${this.props.user.key}/${
                            this.state.packagekey
                          }`
                        )
                        .update({
                          status: "Abgegeben",
                          datedelivery: new Date()
                        });
                      // Code zum updaten der Metadaten : Paket +1 abgegeben
                      const countDelivered = Number(this.state.delivered); //1234
                      const countCredit = Number(this.state.credit); //1234
                      const countPriceTag = Number(this.state.pricetag); //1234

                      //Funktion, welche den Verwendungszweck in den Picker lädt
                      firebase
                        .database()
                        .ref(`/credit/${this.props.user.key}/`)
                        .update({
                          credit: countCredit + countPriceTag
                        })
                        .catch(error => {
                          alert("CreditSetter: " + error);
                        });

                      this.props.dispatch({
                        type: "ADD_USERFNAME",
                        key: this.props.user.key,
                        firstName: this.props.user.firstName,
                        lastName: this.props.user.lastName,
                        email: this.props.user.email,
                        delivered: countDelivered + 1,
                        accepted: this.props.user.accepted,
                        credit: this.props.user.credit,
                        pricetag: countCredit + countPriceTag
                      });

                      firebase
                        .database()
                        .ref(`${"/users/" + this.props.user.key}`)
                        .update({ delivered: countDelivered + 1 })
                        .then(() => {
                          this.props.navigation.navigate("Pakete");
                        });
                    }
                  },

                  { text: "Nein", onPress: () => console.log("OK Pressed") }
                ],
                { cancelable: false }
              )
            }
          >
            <Icon name="people-carry" />
          </Fab>
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {},
  btnTxt: {
    color: "#fff"
  },
  body: {
    paddingLeft: "2.5%",
    paddingTop: "2.5%",
    paddingRight: "2.5%",
    justifyContent: "center",
    fontSize: 20
  },

  btn: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    backgroundColor: "rgb(3, 154, 229)",
    marginTop: 20,
    alignItems: "center"
  },
  disabledBtn: {
    backgroundColor: "rgba(3,155,229,0.5)"
  },
  image: {
    marginTop: 20,
    minWidth: 200,
    height: 200,
    resizeMode: "contain",
    backgroundColor: "#ccc"
  },
  img: {
    flex: 1,
    height: 100,
    margin: 5,
    resizeMode: "contain",
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#ccc"
  },
  progressBar: {
    backgroundColor: "rgb(3, 154, 229)",
    height: 3,
    shadowColor: "#000"
  },
  inputModular: {
    backgroundColor: "rgb(255, 255, 255)",
    paddingTop: 20,
    flex: 1,
    justifyContent: "center"
  }
});

const mapStateToProps = state => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps)(PackageScreen);
