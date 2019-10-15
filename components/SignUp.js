// SignUp.js

// JS, welcher die Metadaten der Registreriung in der Datenbank speichert
// leitet zunächst zu Mail.js weiter

import React from "react";
import { StyleSheet, Text, View, Linking, Switch } from "react-native";
import {
  Input,
  Item,
  Form,
  Container,
  Header,
  Content,
  Label,
  Left,
  Body,
  Right,
  Title,
  Grid,
  Row,
  Col,
  H1,
  Toast,
  Button
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import { DrawerActions } from "react-navigation";
import firebase from "react-native-firebase";
import Spinner from "react-native-loading-spinner-overlay";

export default class SignUp extends React.Component {
  state = {
    spinner: false,
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    adress: "",
    number: "",
    plz: "",
    location: "",
    phone: "",
    errorMessage: null,
    currentUser: "",
    key: "",
    accepted: false
  };

  doRegistration = () => {
    this.handleSignUp();
  };

  doUser = () => {
    {
      /* Eigener Eintrag, welcher für den User gedacht ist */
    }
    var key = firebase
      .database()
      .ref("/users")
      .push().key;

    firebase
      .database()
      .ref("/users")
      .child(key)
      .set({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        mail: this.state.email,
        phone: this.state.phone,
        pricetag: 0.25,
        accepted: 0,
        delivered: 0,
        coupons: 0,
        key: key,
        role: "hub"
      });

    firebase
      .database()
      .ref("/users")
      .orderByChild("mail")
      .equalTo(this.state.email)
      .once("child_added", snapshot => {
        this.setState({
          key: snapshot.val().key
        });
      });

    {
      /* Eigener Eintrag, welcher für die Paketdienstleister gedacht ist */
    }

    firebase
      .database()
      .ref("/delivery/")
      .child(key)
      .set({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        adress: this.state.adress,
        number: this.state.number,
        plz: this.state.plz,
        location: this.state.location,
        key: key
      });

    {
      /* Um das Guthaben am Anfang auf 0 zu setzen */
    }

    firebase
      .database()
      .ref("/credit/")
      .child(key)
      .set({
        credit: 0,
        verwendungszweck: "Auszahlung",
        key: key
      });

    firebase
      .database()
      .ref("/datasecurity/")
      .child(key)
      .set({
        user: key,
        accepted: "accepted"
      });
  };

  handleSignUp = () => {
    //Intervall für das zeitschalten des Spinners
    this.setState({ visible: true });
    setTimeout(() => {
      this.setState({ visible: false });
    }, 3000);

    //Authentifizierung
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.doUser();
        this.props.navigation.navigate("Mail");
      })
      .catch(error =>
        this.setState({ errorMessage: error.message, spinner: false })
      );
  };

  // Sliderfunktion, um anwesend / abwesend anzuzeigen

  AcceptedSlider = () => {
    this.setState({
      accepted: !this.state.accepted
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Container>
          <Spinner
            cancelable={true}
            visible={this.state.spinner}
            textContent={"Loading..."}
          />
          <Header style={{ backgroundColor: "#9b0029" }}>
            <Left />
            <Body>
              <Title>Registrierung</Title>
            </Body>
            <Right />
          </Header>
          <Content>
            <Form>
              <Grid>
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col>
                    <H1 style={{ paddingLeft: "5%", paddingTop: "5%" }}>
                      Login-Daten:
                    </H1>
                  </Col>
                </Row>
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col>
                    <Item floatingLabel style={{ paddingBottom: "2%" }}>
                      <Label style={{ paddingBottom: "0.5%" }}>E-Mail</Label>
                      <Input
                        autoCapitalize="none"
                        onChangeText={email => this.setState({ email })}
                        value={this.state.email}
                      />
                    </Item>
                    {this.state.errorMessage &&
                      this.state.errorMessage ===
                        "The email address is already in use by another account." && (
                        <Text style={{ color: "red", paddingLeft: "3.5%" }}>
                          {"Diese E-Mail Adresse wird bereits verwendet."}
                        </Text>
                      )}
                  </Col>
                </Row>
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col>
                    <Item floatingLabel style={{ paddingBottom: "2%" }}>
                      <Label
                        style={{ paddingBottom: "0.5%", paddingRight: "2.5%" }}
                      >
                        Password
                      </Label>
                      <Input
                        secureTextEntry
                        autoCapitalize="none"
                        onChangeText={password => this.setState({ password })}
                        value={this.state.password}
                      />
                    </Item>
                    {/*IOS Fehlermeldung*/}
                    {this.state.errorMessage &&
                      (this.state.errorMessage ===
                        "The given password is invalid." ||
                        this.state.errorMessage ===
                          "The given password is invalid. [ Password should be at least 6 characters ]") && (
                        <Text style={{ color: "red", paddingLeft: "3.5%" }}>
                          {"Mindestens 6 Zeichen, 1x Groß, 1x Klein, 1x Zahl"}
                        </Text>
                      )}
                  </Col>
                </Row>
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col>
                    <H1 style={{ paddingLeft: "5%", paddingTop: "10%" }}>
                      Persönliche-Daten:
                    </H1>
                  </Col>
                </Row>
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col>
                    <Item floatingLabel style={{ paddingBottom: "2%" }}>
                      <Label style={{ paddingBottom: "0.5%" }}>Vorname</Label>
                      <Input
                        autoCapitalize="none"
                        onChangeText={firstName => this.setState({ firstName })}
                        value={this.state.firstName}
                      />
                    </Item>
                  </Col>
                  <Col>
                    <Item floatingLabel style={{ paddingBottom: "2%" }}>
                      <Label style={{ paddingBottom: "0.5%" }}>Nachname</Label>
                      <Input
                        autoCapitalize="none"
                        onChangeText={lastName => this.setState({ lastName })}
                        value={this.state.lastName}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col size={50}>
                    <Item floatingLabel style={{ paddingBottom: "2%" }}>
                      <Label style={{ paddingBottom: "0.5%" }}>Straße</Label>
                      <Input
                        autoCapitalize="none"
                        onChangeText={adress => this.setState({ adress })}
                        value={this.state.adress}
                      />
                    </Item>
                  </Col>
                  <Col size={50}>
                    <Item floatingLabel style={{ paddingBottom: "2%" }}>
                      <Label style={{ paddingBottom: "0.5%" }}>
                        Hausnummer
                      </Label>
                      <Input
                        autoCapitalize="none"
                        onChangeText={number => this.setState({ number })}
                        value={this.state.number}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col size={50}>
                    <Item floatingLabel style={{ paddingBottom: "2%" }}>
                      <Label style={{ paddingBottom: "0.5%" }}>
                        {" "}
                        Postleitzahl
                      </Label>
                      <Input
                        autoCapitalize="none"
                        onChangeText={plz => this.setState({ plz })}
                        value={this.state.plz}
                      />
                    </Item>
                  </Col>
                  <Col size={50}>
                    <Item floatingLabel last style={{ paddingBottom: "2%" }}>
                      <Label style={{ paddingBottom: "0.5%" }}>Wohnort</Label>
                      <Input
                        autoCapitalize="none"
                        onChangeText={location => this.setState({ location })}
                        value={this.state.location}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col>
                    <Item floatingLabel last style={{ paddingBottom: "2%" }}>
                      <Label style={{ paddingBottom: "0.5%" }}>
                        Telefonnummer
                      </Label>
                      <Input
                        autoCapitalize="none"
                        onChangeText={phone => this.setState({ phone })}
                        value={this.state.phone}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row
                  style={{
                    paddingTop: "2.5%",
                    paddingBottom: "5%",
                    paddingLeft: "15%"
                  }}
                >
                  <Col
                    style={{
                      paddingTop: "2.5%"
                    }}
                  >
                    <Switch
                      onValueChange={this.AcceptedSlider}
                      value={this.state.accepted}
                    />
                  </Col>
                  <Col>
                    <Button
                      rounded
                      large
                      style={{
                        backgroundColor: "#ffffff",
                        alignSelf: "center",
                        justifyContent: "center",
                        width: "100%"
                      }}
                      onPress={() =>
                        Linking.openURL(
                          "https://paxet.de/datenschutzerklaerung-paxet-app/"
                        )
                      }
                    >
                      <Text
                        style={{
                          color: "black",
                          fontSize: 15,
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        Datenschutzerklärung akzeptieren {"\n"}
                        <Text
                          style={{
                            color: "blue",
                            fontSize: 10,
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        >
                          (Drücken zum Ansehen)
                        </Text>
                      </Text>
                    </Button>
                  </Col>
                </Row>

                {this.state.accepted == true && (
                  <Row style={{ paddingTop: "5%", paddingBottom: "2.5%" }}>
                    <Col>
                      <Button
                        rounded
                        large
                        style={{
                          backgroundColor: "#9b0029",
                          alignSelf: "center",
                          justifyContent: "center",
                          width: "60%"
                        }}
                        onPress={this.doRegistration}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 20,
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        >
                          Registrieren{" "}
                        </Text>
                      </Button>
                    </Col>
                  </Row>
                )}

                <Row style={{ paddingTop: "2.5%", paddingBottom: "5%" }}>
                  <Col>
                    <Button
                      rounded
                      large
                      style={{
                        backgroundColor: "#9b0029",
                        alignSelf: "center",
                        justifyContent: "center",
                        width: "60%"
                      }}
                      onPress={() => this.props.navigation.navigate("Login")}
                    >
                      <Text
                        style={{
                          color: "white",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: 20
                        }}
                      >
                        Zum Login
                      </Text>
                    </Button>
                  </Col>
                </Row>
              </Grid>
            </Form>
          </Content>
        </Container>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#9b0029"
  }
});
