import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { List, ListItem, Button, Text, Icon } from 'react-native-elements';
// import PushNotification from 'react-native-push-notification';

// PushNotification.configure({
 
//   // (optional) Called when Token is generated (iOS and Android)
//   onRegister: function(token) {
//       console.log( 'TOKEN:', token );
//   },

//   // (required) Called when a remote or local notification is opened or received
//   onNotification: function(notification) {
//       console.log( 'NOTIFICATION:', notification );

//       // process the notification

//       // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
//       notification.finish(PushNotificationIOS.FetchResult.NoData);
//   },

//   // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
//   senderID: "YOUR GCM (OR FCM) SENDER ID",

//   // IOS ONLY (optional): default: all - Permissions to register.
//   permissions: {
//       alert: true,
//       badge: true,
//       sound: true
//   },

//   // Should the initial notification be popped automatically
//   // default: true
//   popInitialNotification: true,

//   /**
//     * (optional) default: true
//     * - Specified if permissions (ios) and token (android and ios) will requested or not,
//     * - if not, you must call PushNotificationsHandler.requestPermissions() later
//     */
//   requestPermissions: true,
// });


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coinData: [],
      coinList: [],
      coinExpect: ['BTC','ETH'],
      diffLimit: 0,
    };
  }
  componentDidMount() {
    this._executeQuery()
    setInterval(this._executeQuery, 3000);
  }
  _executeQuery = () => {
    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${this.state.coinExpect.join(',')}&tsyms=EUR`)
    .then( response => response.json())
    .then(response => {
      const coinData = Object.keys(response).map((coin) => {
        const isCoin = this.state.coinData.find(el => el.name === coin);
        const diff = isCoin ? isCoin.price - response[coin].EUR : 0;
        // diff > diffLimit && PushNotification.localNotification({message: "My Notification Message"});
        
        return {
          key: coin,
          name: coin,
          price: response[coin].EUR,
          diff,
        }
      });
      this.setState({
        coinData,
        })
    }) 
  }

  _loadList = () => {
    fetch('https://www.cryptocompare.com/api/data/coinlist')
    .then( response => response.json())
    .then(response => {
      this.setState({
        coinList: Object.keys(response.Data).map(coin => ({
          key: response.Data[coin].Id,
          abbr: response.Data[coin].Name,
          name: response.Data[coin].CoinName,
        })),
      });
    })
  }
  
  addCoin = (abbr) => {
    this.setState({
      coinExpect: this.state.coinExpect.concat(abbr),
    })
  }

  render() {
    const { coinData, coinList } = this.state;
    return (
      <View style={{marginTop: 50, flex: 1}}>
        <Text h1 style={{textAlign: 'center'}} >Coins dinamic</Text>
        <List containerStyle={{marginBottom: 20}} >
          {coinData.map((item) => (
            <ListItem 
              key={item.key}
              title={item.name}
              subtitle={item.price}
              avatar={<Icon
              name={ item.diff !== 0 ? item.diff > 0 ? 'keyboard-arrow-up' : 'keyboard-arrow-down' : null}
              color={ item.diff >= 0 ? 'green' : 'red ' }
              />}
              />
          ))}
        </List>
        <Button
          raised
          large
          onPress={this._loadList}
          title='Load Coins' />
        <List containerStyle={{marginBottom: 20, flex: 1}} >
          {coinList.map((item) => (
            <ListItem 
              key={item.key}
              title={item.name}
              onPress={this.addCoin.bind(this, item.abbr)}
              />
          ))}
        </List>
      </View>
    );
  }
}


