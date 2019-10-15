// User.js
import React from 'react';
import { StyleSheet, Platform, Image, Text, View, ListView, TouchableOpacity, AsyncStorage, Dimensions, Alert} from 'react-native';
import {Container, Content, Header, Form,Card, CardItem, Thumbnail, Input, Right, Left, Body, Item, Button, Label, List, ListItem, Fab} from 'native-base';
import firebase from 'react-native-firebase';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/FontAwesome5';
import ImagePicker from 'react-native-image-picker';
import uuid from 'uuid/v4';

import FetchLocation from './FetchLocation';
import Favicon from './pictures/brand.png';


export default class Header extends React.Component {
  constructor(props){
    super(props);


    //States für die Liste der Pakete
    this.state= {
      // enthält die Informationen aller Pakete
      currentUser: null,
			firstName:'',
			lastName:'',
      adress:'',
      database : firebase.database(),
      imgSource: '',
			stateurlProfile:'https://firebasestorage.googleapis.com/v0/b/paxet-app.appspot.com/o/bilder%2Fprofile%2Fmarcel%40paxet.de.jpg?alt=media&token=04d713dd-4ca5-464e-9dd0-e344e83b2afc'
    }
  };



  componentDidMount() {
      // Authentification
      const { currentUser } = firebase.auth();
      this.setState({ currentUser });


			// Listener, um die Informationen des Users zu speichern
			// es wird nach der Benutzermail gefiltert
			firebase.database().ref('/users').orderByChild('mail').equalTo(currentUser.email).on('child_added', (snapshot) =>{
				this.setState({
					firstName: snapshot.val().firstName,
					lastName: snapshot.val().lastName,
          adress: snapshot.val().adress

				})
			})

  }


	render() {

    const { currentUser } = this.state;
    const windowWidth = Dimensions.get('window').width;
    const disabledStyle = uploading ? styles.disabledBtn : {};
    const actionBtnStyles = [styles.btn, disabledStyle];

    const menu_button = (
    <Icon.Button name="bars" backgroundColor="#c1c1c1" onPress={() => this.props.navigation.toggleDrawer()} />
    );

    const logout_button = (
    <Icon.Button name="sign-out-alt" backgroundColor="#c1c1c1" onPress={() => firebase.auth().signOut()} />
    );

	return (

    <Container style={styles.container}>
    	<Container style={styles.header}>
        {/** Kopfzeile */}
        <Header>
          <Left>
            {menu_button}
          </Left>
          <Body>
            <Text>
              Dein Bereich, {this.state.firstName}!
            </Text>
          </Body>
          <Right>
            {logout_button}
          </Right>
        </Header>
      </Container>
	   </Container>
	    )
	  }
	}

const styles = StyleSheet.create({
	  container: {
	    flex: 1,
	  },
    header: {
	  },
    body: {
      justifyContent:'center'
    },
    btnTxt: {
      color: '#fff'
    },
    btn: {
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: 20,
      backgroundColor: 'rgb(3, 154, 229)',
      marginTop: 20,
      alignItems: 'center'
    },
    disabledBtn: {
      backgroundColor: 'rgba(3,155,229,0.5)'
    },
    image: {
      marginTop: 20,
      minWidth: 200,
      height: 200,
      resizeMode: 'contain',
      backgroundColor: '#ccc',
    },
    img: {
      flex: 1,
      height: 100,
      margin: 5,
      resizeMode: 'contain',
      borderWidth: 1,
      borderColor: '#eee',
      backgroundColor: '#ccc'
    },
    progressBar: {
      backgroundColor: 'rgb(3, 154, 229)',
      height: 3,
      shadowColor: '#000',
    },
    inputModular: {
      backgroundColor: 'rgb(255, 255, 255)',
      paddingTop:20,
      width: 240,
      flex: 1,
      justifyContent:'center'
    }
})
