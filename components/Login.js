// Login.js
import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
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
  Button,
  Grid,
  Row,
  Col
} from "native-base";
import firebase from "react-native-firebase";
import Spinner from "react-native-loading-spinner-overlay";
import Logo from "./pictures/Logo.png";

export default class Login extends React.Component {
  state = {
    email: "",
    password: "",
    errorMessage: null,
    spinner: false,
    forgot: "false",
    forgottenmail: ""
  };
  handleLogin = () => {
    const { email, password } = this.state;

    //Intervall für das zeitschalten des Spinners
    this.setState({ visible: true });
    setTimeout(() => {
      this.setState({ visible: false });
    }, 3000);

    //Login des Users
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => this.props.navigation.navigate("Role"))
      .catch(error =>
        this.setState({ errorMessage: error.message, spinner: false })
      );
  };
  render() {
    return (
      <View style={styles.container}>
        <Spinner
          cancelable={true}
          visible={this.state.spinner}
          textContent={"Loading..."}
        />
        <Container>
          <Header style={{ backgroundColor: "#9b0029" }}>
            <Title style={{ paddingTop: "1.25%" }}>Willkommen bei PAXET</Title>
          </Header>
          <Content>
            <Form>
              <Grid>
                {/** Image mit Logo */}
                <Row style={{ paddingRight: "2.5%", paddingTop: "5%" }}>
                  <Col
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Image
                      style={{
                        flex: 1,
                        width: 300,
                        height: 100
                      }}
                      source={Logo}
                    />
                  </Col>
                </Row>

                {/** Eingabefeld: E-Mail */}
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col>
                    <Item floatingLabel style={{ paddingBottom: "2%" }}>
                      <Label style={{ paddingBottom: "1%" }}>E-Mail</Label>
                      <Input
                        autoCapitalize="none"
                        onChangeText={email => this.setState({ email })}
                        value={this.state.email}
                      />
                    </Item>
                  </Col>
                </Row>

                {/** Eingabefeld: Passwort */}
                <Row style={{ paddingRight: "2.5%" }}>
                  <Col>
                    <Item floatingLabel style={{ paddingBottom: "2%" }} last>
                      <Label style={{ paddingBottom: "1%" }}>Password</Label>
                      <Input
                        secureTextEntry
                        autoCapitalize="none"
                        onChangeText={password => this.setState({ password })}
                        value={this.state.password}
                      />
                    </Item>
                    {this.state.errorMessage && (
                      <Text style={{ color: "red", paddingLeft: "3.5%" }}>
                        "Falscher Nutzername oder Passwort. Bei Problemen
                        schreibe eine E-Mail an 'support@paxet.de'."
                      </Text>
                    )}
                  </Col>
                </Row>

                {/** Login Btn */}
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
                      onPress={this.handleLogin}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 20,
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        Login
                      </Text>
                    </Button>
                  </Col>
                </Row>

                {/** Sign-Up Btn */}
                <Row style={{ paddingTop: "2.5%", paddingBottom: "2.5%" }}>
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
                      onPress={() => this.props.navigation.navigate("SignUp")}
                    >
                      <Text
                        style={{
                          color: "white",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: 20
                        }}
                      >
                        Zur Registrierung
                      </Text>
                    </Button>
                  </Col>
                </Row>

                {/** Textfeld das erscheint, wenn Passwort vergessen gedrückt wird */}
                {/** Eingabe zum Passwort Reset */}
                {this.state.forgot === "true" && (
                  <Row style={{ paddingRight: "2.5%" }}>
                    <Col>
                      <Item floatingLabel style={{ paddingBottom: "2%" }}>
                        <Label style={{ paddingBottom: "1%" }}>E-Mail</Label>
                        <Input
                          autoCapitalize="none"
                          onChangeText={forgottenmail =>
                            this.setState({ forgottenmail })
                          }
                          value={this.state.forgottenmail}
                        />
                      </Item>
                    </Col>
                  </Row>
                )}

                {/** Passwort vergessen btn */}
                {/** nur angezeigt, bis Knopf gedrückt wird */}
                {this.state.forgot === "false" && (
                  <Row style={{ paddingTop: "2.5%", paddingBottom: "5%" }}>
                    <Col>
                      <Button
                        rounded
                        style={{
                          backgroundColor: "#9b0029",
                          alignSelf: "center",
                          justifyContent: "center",
                          width: "60%"
                        }}
                        onPress={() =>
                          this.setState({
                            forgot: "true"
                          })
                        }
                      >
                        <Text
                          style={{
                            color: "white",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: 15
                          }}
                        >
                          Passwort vergessen
                        </Text>
                      </Button>
                    </Col>
                  </Row>
                )}

                {/** Passwort zurücksetzen btn */}
                {/** nur angezeigt, sobald Knopf gedrückt wird */}
                {this.state.forgot === "true" && (
                  <Row style={{ paddingTop: "2.5%", paddingBottom: "5%" }}>
                    <Col>
                      <Button
                        rounded
                        style={{
                          backgroundColor: "#9b0029",
                          alignSelf: "center",
                          justifyContent: "center",
                          width: "60%"
                        }}
                        onPress={
                          (forgotPassword = () => {
                            firebase
                              .auth()
                              .sendPasswordResetEmail(this.state.forgottenmail)
                              .then(() => {
                                alert(
                                  "Falls die E-Mail stimmt, bekommst du eine E-Mail."
                                );
                              })
                              .then(() => {
                                this.setState({
                                  forgot: false,
                                  forgottenmail: ""
                                });
                              })
                              .catch(function(e) {
                                alert(
                                  "Falls die E-Mail stimmt, bekommst du eine E-Mail."
                                );
                              });
                          })
                        }
                      >
                        <Text
                          style={{
                            color: "white",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: 15
                          }}
                        >
                          Passwort zurücksetzen
                        </Text>
                      </Button>
                    </Col>
                  </Row>
                )}
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
    justifyContent: "center"
  },
  Input: {
    height: 40,
    width: "90%",
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 8
  }
});
