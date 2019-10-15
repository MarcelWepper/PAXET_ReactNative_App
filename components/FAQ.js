import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  AsyncStorage,
  Dimensions,
  ScrollView
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
  Picker,
  Accordion
} from "native-base";
import ImagePicker from "react-native-image-picker";
import Icon from "react-native-vector-icons/FontAwesome5";
import firebase from "react-native-firebase";
import uuid from "uuid/v4"; // Import UUID to generate UUID

// Inhalt des Accordions

const dataArray = [
  {
    title: "Wie funktioniert das System?",
    content:
      "1. Innerhalb weniger Tage senden wir dir das notwendige Klingeldschild per Post zu.\n\n2. Du hast Lust und Zeit Pakete anzunehmen?\nKlebe das Schild an deinen Briefkasten oder an die Klingel.\n\n3. Der Paketbote weiß nun Bescheid und er wird dir Pakete für nicht erreichte Nachbarn liefern.\n\n4. Sobald du Pakete für deine Nachbarn erhalten hast, lade jedes einzelne im Paketbereich mit einem Foto und Nennung des Lieferdienstes hoch.\n\n5. Du hast die Wahl – Entweder du lieferst das Paket aus oder der Empfänger wird selbst vorbeikommen und das Paket bei dir abholen.\n\n6. Bestätige die Paketabgabe in der PAXET-App. Dein Guthabenstand wird sich nun erhöhen.\n\n7. Wenn du keine Pakete mehr annehmen möchtest, kannst du das Klingelschild wieder abnehmen.\nDas heißt du kannst es immer wieder an- und abkleben, je nachdem wie du Zeit und Lust hast."
  },
  {
    title: "Was für Vorteile hat es, ein Paket-Hub zu sein?",
    content:
      "Du entlastest die Paketboten, hilfst deinen Nachbarn und verdienst dabei Geld.\nDas Geld kannst du dir entweder auszahlen lassen, oder es direkt an eine Umweltorganisation spenden!\nDas Beste dabei: Du machst nichts anderes als das, was du bereits kennst."
  },
  {
    title:
      "Muss ich den ganzen Tag zu Hause bleiben, um ein Paket-Hub zu sein?",
    content:
      "Nein, du musst nicht den ganzen Tag zu Hause bleiben, um ein Paket-Hub zu sein.\nDu kannst selber entscheiden, wann du Pakete annehmen willst, und wann nicht!"
  },
  {
    title: "Was ist, wenn ich nur selten Pakete annehmen kann?",
    content:
      "Das schöne ist, dass du Pakete annehmen kannst, so oft und wann immer du willst!\nDu musst keine bestimmte Anzahl an Tagen die Pakete annehmen."
  },
  {
    title: "Muss ich jedes Paket annehmen?",
    content: "Du kannst selber entscheiden, ob und welche Pakete du annimmst."
  }
];

export default class FAQ extends Component {
  state = {
    // imgSource scheinbar der Zugriff auf das Bild
    // imageUri scheinbar Link, um das Bild hochzuladen
    imgSource: "",
    uploading: false,
    progress: 0,
    images: []
  };

  _renderHeader(item, expanded) {
    return (
      <View
        style={{
          color: "white"
        }}
      />
    );
  }

  componentDidMount() {}

  render() {
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

    return (
      <Container style={styles.container}>
        {/** Pop-Up-Modals */}

        <Container style={styles.header}>
          {/** Kopfzeile */}
          <Header style={{ height: 75, backgroundColor: "#9b0029" }}>
            <Left style={{ flex: 0 }}>{menu_button}</Left>
            <Body>
              <Text
                style={{
                  paddingTop: 10,
                  flex: 1,
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  alignSelf: "center"
                }}
              >
                Häufig gestellte Fragen
              </Text>
            </Body>
            <Right style={{ flex: 0 }}>{logout_button}</Right>
          </Header>
          {/** Hauptbereich in der Mitte */}
          <Container style={styles.body}>
            <Content padder style={{ color: "white" }}>
              <Accordion
                dataArray={dataArray}
                iconStyle={{ color: "#5d0018" }}
                expandedIconStyle={{ color: "#9b0029" }}
                headerStyle={this._renderHeader}
                contentStyle={{ backgroundColor: "#9b0029", color: "white" }}
                icon="add"
                expandedIcon="remove"
              />
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
  }
});
