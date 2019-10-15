// Profile.js
// Es werden alle Profilinformationen
// einschließlich abgegebener Pakete angezeigt
import React from "react";
import { connect } from "react-redux";
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
  Card,
  CardItem,
  Thumbnail,
  Input,
  Right,
  Left,
  Body,
  Item,
  Button,
  Label,
  List,
  ListItem,
  Picker
} from "native-base";
import firebase from "react-native-firebase";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/FontAwesome5";
import ImagePicker from "react-native-image-picker";
import uuid from "uuid/v4";

import FetchLocation from "./FetchLocation";
import Favicon from "./pictures/brand.png";

// Optionen für den Image Picker
const options = {
  title: "Select Image",
  quality: 0.25,
  storageOptions: {
    skipBackup: true,
    path: "images"
  }
};

// Array, welcher die Metainformationen des Pakethinzufügens speichert
var data = [];

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      // enthält die Informationen des User
      ViewProfileData: data,
      listViewPackage: [],
      currentUser: null,
      lastName: "",
      adress: "",
      accepted: "",
      delivered: "",
      coupons: "",
      key: "",
      mail: "",
      database: firebase.database(),
      imgSource: "",
      // Standardpfad zum Profilbild
      stateurlProfile:
        "https://firebasestorage.googleapis.com/v0/b/paxet-app.appspot.com/o/bilder%2Fdefault%2FBrandNew.png?alt=media&token=4452936f-2a8c-4caa-bfdf-02b950e3bbc2"
    };
  }

  //States für das Profilbild
  state = {
    imgSource: "",
    uploading: false,
    progress: 0,
    images: [],
    isInformationVisible: false,
    isProfilePicVisible: false,
    verwendungszweck: ""
  };

  componentDidMount() {
    // Authentification
    const { currentUser } = firebase.auth();
    this.setState({ currentUser });

    // Funktion, um das Profilbild zu laden
    this.getProPic(currentUser.email);

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
          mail: snapshot.val().mail,
          accepted: snapshot.val().accepted,
          delivered: snapshot.val().delivered,
          coupons: snapshot.val().coupons,
          key: snapshot.val().key,
          pricetag: snapshot.val().pricetag
        });
      });

    //Funktion, welche den Verwendungszweck in den Picker lädt
    firebase
      .database()
      .ref("/credit/")
      .orderByChild("key")
      .equalTo(this.props.user.key)
      .on("child_added", snapshot => {
        this.setState({
          key: this.props.user.key,
          verwendungszweck: snapshot.val().verwendungszweck,
          credit: snapshot.val().credit
        });
      });

    //Funktion, um die Adresse zu laden
    firebase
      .database()
      .ref("/delivery/")
      .orderByChild("key")
      .equalTo(this.props.user.key)
      .on("child_added", snapshot => {
        this.setState({
          adress: snapshot.val().adress,
          number: snapshot.val().number,
          plz: snapshot.val().plz,
          location: snapshot.val().location
        });
      });
  }

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

  // Methode, um Bilder aus dem Picker hochzuladen
  async uploadImage(currentUser) {
    const ext = this.state.imageUri.split(".").pop(); // Extract image extension
    const filename = `${currentUser}.${ext}`; // Use e-Mail+jpg as Filename

    //delete picture firebasestorage
    firebase
      .storage()
      .ref("bilder/profile")
      .child(`${currentUser}.jpg`)
      .delete();

    // Bild wird in die Datenbank gespeichert
    this.setState({ uploading: true });
    firebase
      .storage()
      .ref(`bilder/profile/${filename}`) //Pfad zum Upload
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
            state = {
              ...state,
              uploading: false,
              imgSource: "",
              imageUri: "",
              progress: 0
            };

            //Guter Alert, welcher nach dem dem OKAY einen State ändert.
            Alert.alert(
              "Neues Profilbild",
              "Profilbild wurde hochgeladen. Es wird nach dem Neustart angezeigt.",
              [
                {
                  text: "Cool",
                  onPress: () => {
                    this.setState({ isProfilePicVisible: false });
                  }
                }
              ],
              { cancelable: false }
            );
            // alert geht bis hier
          }
          this.setState(state);
        },
        error => {
          unsubscribe();
          alert("Sorry, Try again.");
        }
      )
      .catch(error => {
        alert("PickPicture: " + error);
      });
  }

  async VerwendungszweckPicker(value) {
    firebase
      .database()
      .ref(`/credit/${this.props.user.key}`)
      .update({
        verwendungszweck: value
      })
      .catch(error => {
        alert("PickerError: " + error);
      });

    this.setState({
      verwendungszweck: value
    });
  }

  // Load the Profile-Picture from the database
  async getProPic(currentUser) {
    firebase
      .storage()
      .ref("bilder/profile")
      .child(`${currentUser}.jpg`)
      .getDownloadURL()
      .then(url => {
        this.setState({
          stateurlProfile: url
        });
      })
      .catch(error => {
        console("ProfilePictureError: " + error);
      });
  }

  // Modalfunktionen
  showInformation = () => {
    this.setState({ isInformationVisible: !this.state.isInformationVisible });
  };
  showProfilePic = () => {
    this.setState({ isProfilePicVisible: !this.state.isProfilePicVisible });
  };
  closeModal = () => {
    this.setState({ isProfilePicVisible: false, isInformationVisible: false });
  };

  render() {
    const { currentUser } = this.state;
    const { uploading, imgSource, progress, images } = this.state;
    const disabledStyle = uploading ? styles.disabledBtn : {};
    const actionBtnStyles = [styles.btn, disabledStyle];

    const menu_button = (
      <Icon.Button
        name="bars"
        backgroundColor="#5d0018"
        onPress={() => this.props.navigation.toggleDrawer()}
      />
    );

    const logout_button = (
      <Icon.Button
        name="sign-out-alt"
        backgroundColor="#5d0018"
        onPress={() => firebase.auth().signOut()}
      />
    );

    const btn_closeModal = (
      <Icon.Button
        name="window-close"
        backgroundColor="#5d0018"
        onPress={this.closeModal}
      />
    );

    const btn_pickImage = (
      <Icon.Button
        name="plus"
        backgroundColor="#5d0018"
        onPress={this.pickImage}
      />
    );

    const btn_addProfilePic = (
      <Icon.Button
        name="people-carry"
        backgroundColor="#5d0018"
        onPress={this.showProfilePic}
      />
    );

    const modal_AddProfilePic = (
      <Modal
        isVisible={this.state.isProfilePicVisible}
        onBackdropPress={!this.state.isProfilePicVisible}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.9)"
          }}
        >
          <Container style={styles.inputModular}>
            <Content>
              <Text>Lad dein eigenes Profilbild hoch!</Text>

              {/** Hochladen Profilbild */}
              {btn_pickImage}

              {/** Display selected image */}
              {imgSource !== "" && (
                <View>
                  <Image source={imgSource} style={styles.image} />

                  {/** Upload-Textfeld */}
                  <TouchableOpacity
                    style={actionBtnStyles}
                    onPress={() => this.uploadImage(currentUser.email)}
                    disabled={uploading}
                  >
                    <View>
                      {/** Ladebalken */}
                      {uploading ? (
                        <Text style={styles.btnTxt}>
                          Profilbild wird hochgeladen.
                        </Text>
                      ) : (
                        <Text style={styles.btnTxt}>Profilbild hochladen.</Text>
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

    const thumbnailplaceholder = (
      <Thumbnail source={{ uri: this.state.stateurlProfile }} />
    );

    return (
      <Container style={styles.container}>
        {/** Pop-Up-Modals */}
        {modal_AddProfilePic}
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
                Dein Profil,{"\n"}
                {this.props.user.firstName}
              </Text>
            </Body>
            <Right style={{ flex: 0 }}>{logout_button}</Right>
          </Header>
          {/** Hauptbereich in der Mitte */}
          <Container style={styles.body}>
            <Content>
              <Card>
                <CardItem>
                  <Left>
                    <TouchableOpacity onPress={this.showProfilePic}>
                      {thumbnailplaceholder}
                    </TouchableOpacity>
                    <Body>
                      <Text>E-Mail: {this.state.mail}</Text>
                      <Text note>Vorname: {this.state.firstName} </Text>
                      <Text note>Nachname: {this.state.lastName} </Text>
                      <Text note>
                        Adresse: {this.state.adress} {this.state.number}
                      </Text>
                      <Text note>
                        Stadt: {this.state.plz} {this.state.location}
                      </Text>
                    </Body>
                  </Left>
                </CardItem>
              </Card>
              {/*
              <Text note>Verwendungszweck des Guthabens: </Text>
              <Form>
                <Item picker>
                  <Picker
                    mode="dropdown"
                    iosIcon={<Icon name="arrow-down" />}
                    style={{ width: undefined }}
                    placeholder="Guthabenverwendung"
                    placeholderStyle={{ color: "#bfc6ea" }}
                    placeholderIconColor="#007aff"
                    selectedValue={this.state.verwendungszweck}
                    onValueChange={this.VerwendungszweckPicker.bind(this)}
                  >
                    <Picker.Item label="Auszahlung" value="Auszahlung" />
                    <Picker.Item label="Umweltschutz" value="Umweltschutz" />
                    <Picker.Item label="Tierheim" value="Tierheim" />
                    <Picker.Item label="Kinderhilfe" value="Kinderhilfe" />
                  </Picker>
                </Item>
              </Form>
              {this.state.verwendungszweck != "Auszahlung" && (
                <Text note>
                  Momentan wird der Gesamte Betrag in Höhe von{" "}
                  {this.state.credit}€ am Ende des Monats für{" "}
                  {this.state.verwendungszweck} gespendet.
                </Text>
              )}
              {this.state.verwendungszweck === "Auszahlung" && (
                <Text note>
                  Momentan hast du einen Guthabenbetrag in Höhe von{" "}
                  {this.state.credit}€. Bei 5€ wird er dir per Amazon-Gutschein
                  zur Verfügung gestellt.
                </Text>
              )}

              */}
            </Content>
          </Container>
        </Container>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {},
  body: {
    justifyContent: "center"
  },
  btnTxt: {
    color: "#fff"
  },
  body: {
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

export default connect(mapStateToProps)(Profile);
