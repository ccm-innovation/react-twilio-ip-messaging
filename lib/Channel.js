let React = require('react-native')

let {
    NativeModules,
    NativeAppEventEmitter,
    Platform
} = React

let {
    TwilioIPMessagingClient,
    TwilioIPMessagingChannels,
    TwilioIPMessagingMessages,
    TwilioIPMessagingMembers
} = NativeModules

let Message = require('./Message')
let Member = require('./Member')

class Channel {
    constructor(props) {
        this.sid = props.sid
        this.friendlyName = props.friendlyName
        this.uniqueName = props.uniqueName
        this.synchronizationStatus = props.synchronizationStatus
        this.status = props.status
        this.type = props.type
        this.attributes = props.attributes
                
        this.onSynchronizationStatusChanged = null
        this.onChanged = null
        this.onDeleted = null
        this.onMemberJoined = null
        this.onMemberChanged = null
        this.onMemberLeft = null
        this.onMemberUserInfoUpdated = null
        this.onMessageAdded = null
        this.onMessageChanged = null
        this.onMessageDeleted = null
        this.onTypingStarted = null
        this.onTypingEnded = null
        this.onToastReceived = null
        
        // event handlers
        this._channelSynchronizationStatusChangedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channel:synchronizationStatusChanged',
            ({channelSid, status}) => {
                if (channelSid == this.sid && this.onSynchronizationStatusChanged) this.onSynchronizationStatusChanged(status)
            }
        )
        
        this._channelChangedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channelChanged',
            (channel) => {
                if (channel.sid == this.sid && this.onChanged) {
                    this.sid = channel.sid
                    this.friendlyName = channel.friendlyName
                    this.uniqueName = channel.uniqueName
                    this.synchronizationStatus = channel.synchronizationStatus
                    this.status = channel.status
                    this.type = channel.type
                    this.attributes = channel.attributes
                    this.dateCreated = new Date(channel.dateCreated)
                    this.dateUpdated = new Date(channel.dateUpdated)
                    this.onChanged()
                }
            }
        )
        
        this._channelDeletedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channelDeleted',
            (channel) => {
                if (channel.sid == this.sid && this.onDeleted) this.onDeleted()
            }
        )
        
        this._channelMemberJoinedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channel:memberJoined',
            ({channelSid, member}) => {
                if (channelSid == this.sid && this.onMemberJoined) this.onMemberJoined(new Member(member))
            }
        )
        
        this._channelMemberChangedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channel:memberChanged',
            ({channelSid, member}) => {
                if (channelSid == this.sid && this.onMemberChanged) this.onMemberChanged(new Member(member))
            }
        )
        
        this._channelMemberLeftSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channel:memberLeft',
            ({channelSid, member}) => {
                if (channelSid == this.sid && this.onMemberLeft) this.onMemberLeft(new Member(member))
            }
        )
        
        this._channelMessageAddedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channel:messageAdded',
            ({channelSid, message}) => {
                if (channelSid == this.sid && this.onMessageAdded) this.onMessageAdded(new Message(message, channelSid))
            }
        )
        
        this._channelMessageChangedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channel:messageChanged',
            ({channelSid, message}) => {
                if (channelSid == this.sid && this.onMessageChanged) this.onMessageChanged(new Message(message, channelSid))
            }
        )
        
        this._channelMessageDeletedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channel:messageDeleted',
            ({channelSid, message}) => {
                if (channelSid == this.sid && this.onMessageDeleted) this.onMessageDeleted(new Message(message, channelSid))
            }
        )
        
        this._typingChannelStartedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:typingStartedOnChannel',
            ({channelSid, member}) => {
                if (channelSid == this.sid && this.onTypingStarted) this.onTypingStarted(new Member(member))
            }
        )
        
        this._typingChannelEndedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:typingEndedOnChannel',
            ({channelSid, member}) => {
                if (channelSid == this.sid && this.onTypingEnded) this.onTypingEnded(new Member(member))
            }
        )
        
        this._toastReceivedChannelSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:toastReceivedOnChannel',
            ({channelSid, message}) => {
                if (channelSid == this.sid && this.onToastReceived) this.onToastReceived(new Message(message))
            }
        )

        this._memberUserInfoUpdatedSubscription = NativeAppEventEmitter.addListener(
            'ipMessagingClient:channel:member:userInfoUpdated',
            ({channelSid, updated, userInfo}) => {
               if (channelSid == this.sid && this.onMemberUserInfoUpdated) this.onMemberUserInfoUpdated({updated, userInfo: new UserInfo(userInfo)})
            }
        )
    }
    
    initialize() {
        return TwilioIPMessagingChannels.synchronize(this.sid)
    }
    
    setAttributes(attributes) {
        this.attributes = attributes
        return TwilioIPMessagingChannels.setAttributes(this.sid, attributes)
    }
    
    setFriendlyName(friendlyName) {
        this.friendlyName = friendlyName
        return TwilioIPMessagingChannels.setFriendlyName(this.sid, friendlyName)
    }
    
    setUniqueName(uniqueName) {
        this.uniqueName = uniqueName
        return TwilioIPMessagingChannels.setUniqueName(this.sid, uniqueName)
    }
    
    join() {
        return TwilioIPMessagingChannels.join(this.sid)
    }
    
    declineInvitation() {
        return TwilioIPMessagingChannels.declineInvitation(this.sid)
    }
    
    leave() {
        return TwilioIPMessagingChannels.leave(this.sid)
    }
    
    destroy() {
        return TwilioIPMessagingChannels.destroy(this.sid)
    }
    
    typing() {
        TwilioIPMessagingChannels.typing(this.sid)
    }
    
    getMember(identity) {
        return TwilioIPMessagingChannels.getMember(this.sid, identity)
        .then((member) => new Member(member))
    }
    
    getMembers() {
        return TwilioIPMessagingMembers.getMembers(this.sid)
        .then((members) => members.map((member) => new Member(member)))
    }
    
    add(identity) {
        return TwilioIPMessagingMembers.add(this.sid, identity)
    }
    
    invite(identity) {
        return TwilioIPMessagingMembers.invite(this.sid, identity)
    }
    
    remove(identity) {
        return TwilioIPMessagingMembers.remove(this.sid, identity)
    }
    
    getLastConsumedMessageIndex() {
        return TwilioIPMessagingMessages.getLastConsumedMessageIndex(this.sid)
    }
    
    lastConsumedMessageIndex() {
        console.warn("lastConsumedMessageIndex is deprecated. Please use getLastConsumedMessageIndex before upgrading to the next version.")
        return TwilioIPMessagingMessages.getLastConsumedMessageIndex(this.sid)
    }

    sendMessage(body) {
        if(Platform.OS == 'android'){
            this.initialize()
        }
        return TwilioIPMessagingMessages.getLastMessages(this.sid, count)
    }
    
    removeMessage(index) {
        return TwilioIPMessagingMessages.removeMessage(this.sid, index)
    }
    
    getMessages(count = 10) {
        return TwilioIPMessagingMessages.getLastMessages(this.sid, count)
        .then((messages) => messages.map((message) => new Message(message, this.sid)))
    }
    
    getMessagesBefore(index, count) {
        return TwilioIPMessagingMessages.getMessagesBefore(this.sid, index, count)
        .then((messages) => messages.map((message) => new Message(message, this.sid)))

    }
    
    getMessagesAfter(index, count) {
        return TwilioIPMessagingMessages.getMessagesAfter(this.sid, index, count)
        .then((messages) => messages.map((message) => new Message(message, this.sid)))
    }
    
    getMessage(index) {
        return TwilioIPMessagingMessages.getMessage(this.sid, index)
        .then((message) => new Message(message, this.sid))
    }
    
    getMessageForConsumption(index) {
        if (Platform.OS != 'ios') console.warn("getMessageForConsumption is only available on iOS.")
        else {
            return TwilioIPMessagingMessages.messageForConsumptionIndex(this.sid, index)
            .then((message) => new Message(message, this.sid))
        }
    }
    
    setLastConsumedMessageIndex(index) {
        TwilioIPMessagingMessages.setLastConsumedMessageIndex(this.sid, index)
    }
    
    advanceLastConsumedMessageIndex(index) {
        TwilioIPMessagingMessages.advanceLastConsumedMessageIndex(this.sid, index)
    }
    
    setAllMessagesConsumed() {
        TwilioIPMessagingMessages.setAllMessagesConsumed(this.sid)
    }
    
    close() {
        this._channelChangedSubscription.remove()
        this._channelDeletedSubscription.remove()
        this._channelSynchronizationStatusChangedSubscription.remove()
        this._channelMemberJoinedSubscription.remove()
        this._channelMemberChangedSubscription.remove()
        this._channelMemberLeftSubscription.remove()
        this._channelMessageAddedSubscription.remove()
        this._channelMessageChangedSubscription.remove()
        this._channelMessageDeletedSubscription.remove()
        this._typingChannelStartedSubscription.remove()
        this._typingChannelEndedSubscription.remove()
        this._toastReceivedChannelSubscription.remove()
        this._memberUserInfoUpdatedSubscription.remove()
    }
}

module.exports = Channel