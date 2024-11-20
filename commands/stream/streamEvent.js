/* License is GPL 3.0.
- made by Studio moremi.
 - support@studio-moremi.kro.kr
*/
const createResource = require('./resource.js');
const createConnection = require('./connection.js');
const queue = require('../index.js');

module.export = function stream(interaction,url, run) {
 let connection;
 let resource;
 let player;
 
 
 if(queue.length == 0) {
  connection = createConnection(interaction);
  player = createAudioPlayer({
  behaviors: {
   noSubscriber: NoSubscriberBehavior.Stop,
  },
 })
 };
 
 player = queue[0].player;
 connection = queue[0].connection;
 resource = createResource(url);
 
 player.play(resource);
 
 connection.subscribe(player);
 
 run(player, connection);
}
