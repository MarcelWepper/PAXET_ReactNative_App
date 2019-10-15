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
  Card,
  CardItem
} from "native-base";
import firebase from "react-native-firebase";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/FontAwesome5";
import ImagePicker from "react-native-image-picker";
import { connect } from "react-redux";
import { DrawerActions } from "react-navigation";
import Spinner from "react-native-loading-spinner-overlay";

import uuid from "uuid/v4";

import FetchLocation from "./FetchLocation";

// Optionen für den Image Picker
const options = {
  title: "Select Image",
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.25,
  storageOptions: {
    skipBackup: true,
    path: "images"
  }
};

// Array, welcher die Metainformationen des Pakethinzufügens speichert
var data = [];

class User extends React.Component {
  constructor(props) {
    super(props);

    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    //States für die Liste der Pakete
    this.state = {
      spinner: true,
      // enthält die Informationen aller Pakete
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
      accepted: "",
      delivered: "",
      coupons: "",
      key: "",
      pricetag: "",
      mail: ""
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

    // Ohne that funktioniert es nicht mehr, warum auch immer
    var that = this;

    // Listener, um die bereits eingetragenen Pakete in der Liste anzuzeigen
    // es wird nach der Benutzermail gefiltert
    var paketeref = firebase
      .database()
      .ref(`/pakete/${this.props.user.key}`)
      .orderByChild("/user/")
      .equalTo(currentUser.email)
      .on("child_added", function(data) {
        var newData = [...that.state.listViewData];
        newData.push(data);
        that.setState({ listViewData: newData });
      });

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
          mail: snapshot.val().mail
        });
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

    // Initiale Verbindung mit der Firebase Datenbank, um die Bilder
    // in den Array Images zu speichern

    let images;
    AsyncStorage.getItem("images")
      .then(data => {
        images = JSON.parse(data) || [];
        this.setState({
          images: images
        });
      })
      .catch(error => {
        console.log(error);
      });

    // Timer für den Spinner
    setInterval(() => {
      this.setState({
        spinner: false
      });
    }, this.props.user.accepted * 75);
  }

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

  //dispatch und credit, um die States jedes mal upzudaten
  // Sonst Bug: Bei dem zweiten Eintrag ändert sich nichts

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
        verwendungszweck: this.state.verwendungszweck
      });
    }, 1000);
  };

  // Methode, um Bild vom Handy mit dem Picker auszuwählen
  pickImage = () => {
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log("You cancelled image picker 😟");
      } else if (response.error) {
        alert("And error occured: ", response.error);
      } else {
        const source = { uri: response.uri };
        this.setState({
          imgSource: source,
          imageUri: response.uri
        });
      }
    });
  };

  // Methode, um alle Metadaten des Pakets
  // einschließlich Bild aus dem Picker hochzuladen
  uploadImage(delivery, comment, currentUser) {
    const ext = this.state.imageUri.split(".").pop(); // Extract image extension

    //Filename wird bei dem Anlegen des User mit eingepflegt
    var key = firebase
      .database()
      .ref("/pakete")
      .push().key;

    //Set the date of the package
    var that = this;
    var day = new Date().getDate(); //Current Day
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutess
    min = min > 9 ? min : "0" + min; //make two digets if minute is 0-9

    // Datum, welcher für die Speicehrung des Bildes genutzt wird
    var datePicture =
      "/" + day + "." + month + "." + year + "-" + hours + ":" + min; //Setting the value of the date time

    // Datum, welcher für das Anzeigen des Bilds genutzt wird
    var date = day + "." + month + "." + year + " - " + hours + ":" + min; //Setting the value of the date time

    const filename = `${"/" +
      currentUser +
      "/" +
      datePicture +
      "-" +
      delivery +
      key}.${ext}`; // Generate unique name
    var pfad = filename; //Name in der Storage

    //Metainformationen für den Upload des Paketes
    firebase
      .database()
      .ref(`${"/pakete/" + this.props.user.key}`)
      .child(key)
      .set({
        delivery: delivery,
        comment: comment,
        user: currentUser,
        bildpfad: pfad,
        key: key,
        status: "Angenommen",
        date: date,
        datedelivery: ""
      });

    // Beim User wird die Anzahl der Pakete geupdatet

    firebase
      .database()
      .ref("/users/" + this.state.key)
      .orderByChild("mail")
      .equalTo(currentUser.email)
      .update({ accepted: this.state.accepted + 1 });
    this.setState({
      accepted: this.state.accepted + 1,
      delivery: "",
      comment: ""
    });

    // Bild wird in die Datenbank gespeichert
    this.setState({ uploading: true });
    firebase
      .storage()
      .ref(`bilder/images/${filename}`) //Pfad zum Upload
      .putFile(this.state.imageUri)
      .on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        snapshot => {
          let state = {};
          state = {
            ...state,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 // Calculate progress percentage
          };
          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            const allImages = this.state.images;
            allImages.push(snapshot.downloadURL);
            state = {
              ...state,
              uploading: false,
              imgSource: "",
              imageUri: "",
              resizedImageUri: "",
              progress: 0,
              images: allImages
            };
            AsyncStorage.setItem("images", JSON.stringify(allImages));
            Alert.alert(
              "Erfolgreich",
              "Paket wurde hochgeladen.",
              [
                {
                  text: "Cool",
                  onPress: () => {
                    this.setState({ isAddPackageVisible: false });
                  }
                }
              ],
              { cancelable: false }
            );
          }
          this.setState(state);
        },
        error => {
          unsubscribe();
          alert("Sorry, Try again.");
        }
      );
  }

  delivery = listViewData => {
    this.setState({
      packagekey: listViewData.key,
      spinner: false
    });
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
              .ref(`/pakete/${this.props.user.key}/${this.state.packagekey}`)
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
              .update({ delivered: countDelivered + 1 });

            var that = this;

            that.setState({ listViewData: "" });

            firebase
              .database()
              .ref(`/pakete/${this.props.user.key}`)
              .orderByChild("/user/")
              .equalTo(this.state.mail)
              .on("child_added", function(data) {
                var newData = [...that.state.listViewData];
                newData.push(data);
                that.setState({
                  listViewData: newData,
                  credit: countCredit + countPriceTag,
                  delivered: countDelivered + 1
                });
              });
          }
        },

        { text: "Nein", onPress: () => console.log("OK Pressed") }
      ],
      { cancelable: false }
    );
    this.setState(state);
  };

  navigatePackageScreen = listViewData => {
    this.setState({ spinner: true });
    this.props.dispatch({
      type: "ADD_USERFNAME",
      packagekey: listViewData.key,
      key: this.props.user.key,
      firstName: this.props.user.firstName,
      lastName: this.props.user.lastName,
      email: this.props.user.email,
      delivered: this.props.user.delivered,
      accepted: this.props.user.accepted,
      credit: this.props.user.credit,
      pricetag: this.props.user.pricetag
    });
    this.props.navigation.navigate("PackageScreen");
  };

  //Remove image from the state and persistance storage
  removeImage = imageIndex => {
    let images = this.state.images;
    images.pop(imageIndex);
    this.setState({ images });
  };

  //Paketendetails aus der Liste entfernen
  async deleteRow(secId, rowId, rowMap, data) {
    /*
    await firebase.database().ref('pakete/'+ data.key).set(null)
    rowMap[`${secId}${rowId}`].props.closeRow();
    var newData = [...this.state.listViewData];
    newData.splice(rowId,1)
    this.setState({ listViewData: newData});
    */
    alert("Diese Funktion wurde temporär deaktiviert.");
  }

  // Modalfunktionen
  showInformation = () => {
    this.setState({ isInformationVisible: !this.state.isInformationVisible });
  };
  showAddPackage = () => {
    this.setState({ isAddPackageVisible: !this.state.isAddPackageVisible });
  };
  closeModal = () => {
    this.setState({
      isAddPackageVisible: false,
      isInformationVisible: false,
      stateurlProfile: ""
    });
  };

  render() {
    const { currentUser } = this.state;
    const {
      uploading,
      imgSource,
      progress,
      images,
      imageavailable
    } = this.state;
    const disabledStyle = uploading ? styles.disabledBtn : {};
    const actionBtnStyles = [styles.btn, disabledStyle];

    const menu_button = (
      <Icon.Button
        name="bars"
        backgroundColor="#5d0018"
        onPress={() =>
          this.props.navigation.dispatch(DrawerActions.openDrawer())
        }
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

    const btn_pickImage = (
      <Icon.Button
        name="box"
        backgroundColor="#5d0018"
        onPress={this.pickImage}
      />
    );

    const btn_closeModal = (
      <Icon.Button
        name="window-close"
        backgroundColor="#5d0018"
        onPress={this.closeModal}
      />
    );

    const btn_Abgabe = (
      <Icon.Button
        name="people-carry"
        backgroundColor="#5d0018"
        onPress={() => this.delivery(listViewData)}
      />
    );

    const modal_Information = <Modal />;

    // Modal, welche für das hinzufügen von Paketen veranowortlich ist
    const modal_AddPackage = (
      <Modal
        isVisible={this.state.isAddPackageVisible}
        onBackdropPress={!this.state.isAddPackageVisible}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.9)",
            paddingTop: 75,
            paddingBottom: 50
          }}
        >
          <Container style={styles.inputModular}>
            <Content>
              <Item>
                <Text style={{ color: "white" }}>
                  Für jedes Paket einzeln ausfüllen:
                </Text>
              </Item>
              <Item>
                {/** Inputfeld für Paketeingabe */}
                <Input
                  onChangeText={delivery => this.setState({ delivery })}
                  placeholder="Paketdienst"
                />
              </Item>
              <Item>
                <Input
                  onChangeText={comment => this.setState({ comment })}
                  placeholder="Kommentarfeld"
                />
              </Item>

              {/** Abgabe durch hochladen des Bilds */}
              {btn_pickImage}

              {/** Display selected image */}
              {imgSource !== "" && (
                <View>
                  <Image source={imgSource} style={styles.image} />

                  {/** Upload-Textfeld */}
                  <TouchableOpacity
                    style={actionBtnStyles}
                    onPress={() =>
                      this.uploadImage(
                        this.state.delivery,
                        this.state.comment,
                        currentUser.email
                      )
                    }
                    disabled={uploading}
                  >
                    <View>
                      {/** Ladebalken */}
                      {uploading ? (
                        <Text style={{ color: "#ffffff" }}>
                          Paket wird versendet
                        </Text>
                      ) : (
                        <Text style={{ color: "#ffffff" }}>
                          Paket einreichen
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </Content>
            {btn_closeModal}
          </Container>
        </View>
      </Modal>
    );

    return (
      <Container style={styles.container}>
        <Spinner visible={this.state.spinner} textContent={"Loading..."} />
        {/** Pop-Up-Modals */}
        {modal_AddPackage}
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
                Deine Pakete,{"\n"}
                {this.props.user.firstName}
              </Text>
            </Body>
            <Right style={{ flex: 0 }}>{logout_button}</Right>
          </Header>
          {/** Hauptbereich in der Mitte */}
          <Container style={styles.body}>
            <Content>
              <Text note>Angenommene Pakete: {this.state.accepted} </Text>
              <Text note>Abgegebene Pakete: {this.state.delivered} </Text>
              <Text note>
                Guthaben für abgegebene Pakete: {this.state.credit}€
              </Text>
              <Text>Unten siehst du alle deine Pakete:</Text>
              {/** Liste, um alle Pakete anzuzeigen */}
              <List
                style={{ flex: 1, transform: [{ scaleY: -1 }] }}
                enableEmptySections
                disableLeftSwipe
                button={true}
                dataSource={this.ds.cloneWithRows(this.state.listViewData)}
                renderRow={listViewData => (
                  <ListItem
                    style={{ transform: [{ scaleY: -1 }], height: 187.5 }}
                    onPress={() => {
                      this.setState({ spinner: true });
                      this.navigatePackageScreen(listViewData);
                    }}
                  >
                    <Container style={{ height: 150 }}>
                      <Card>
                        <CardItem header>
                          <Text style={{ fontWeight: "bold" }}>
                            {listViewData.val().delivery}
                          </Text>
                        </CardItem>
                        <CardItem>
                          <Body>
                            <Text>
                              {listViewData.val().date +
                                " - " +
                                listViewData.val().status}
                              {listViewData.val().comment !== "" &&
                                " - " + listViewData.val().comment}
                            </Text>
                          </Body>
                        </CardItem>
                        <CardItem>
                          <Left>
                            <Icon.Button
                              style={{
                                marginRight: -7.5
                              }}
                              name="info-circle"
                              backgroundColor="#5d0018"
                              onPress={() => {
                                this.setState({ spinner: true });
                                this.navigatePackageScreen(listViewData);
                              }}
                            />
                          </Left>
                          <Right>
                            {listViewData.val().status !== "Abgegeben" && (
                              <Icon.Button
                                style={{
                                  marginRight: -7.5
                                }}
                                name="people-carry"
                                backgroundColor="#5d0018"
                                onPress={() => this.delivery(listViewData)}
                              />
                            )}
                          </Right>
                        </CardItem>
                      </Card>
                    </Container>
                  </ListItem>
                )}
                renderLeftHiddenRow={data => (
                  <Icon.Button
                    name="info-circle"
                    backgroundColor="#c1c1c1"
                    onPress={() =>
                      this.props.navigation.navigate("PackageScreen")
                    }
                  />
                )}
                renderRightHiddenRow={(data, secId, rowId, rowMap) => (
                  <Button full danger onPress={this.showAddPackage}>
                    <Icon name="trash" />
                  </Button>
                )}
                leftOpenValue={75}
                rightOpenValue={-75}
              />
            </Content>
          </Container>
        </Container>
        {/** Floating Button down right */}
        <Fab
          active={this.state.active}
          direction="up"
          containerStyle={{}}
          style={{ backgroundColor: "#5d0018" }}
          position="bottomRight"
          onPress={this.showAddPackage}
        >
          <Icon name="box" />
        </Fab>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  body: {
    justifyContent: "center",
    paddingLeft: "2.5%",
    paddingTop: "2.5%",
    paddingRight: "2.5%"
  },

  btn: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    backgroundColor: "#5d0018",
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

    flex: 1,
    justifyContent: "center"
  }
});

const mapStateToProps = state => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps)(User);
