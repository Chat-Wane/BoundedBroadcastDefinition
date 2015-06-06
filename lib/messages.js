
/*!
 * \brief message containing data to broadcast
 * \param id the identifier of the broadcast message
 * \param payload the broadcasted data
 */
function MBroadcast(id, payload){
    this.protocol = 'bounded-broadcast';
    this.id = id;
    this.payload = payload;
};
module.exports.MBroadcast = MBroadcast;
