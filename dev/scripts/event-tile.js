import React from 'react';
import ReactDOM from 'react-dom';
import CommentForm from './comment-form.js'
import CommentBox from './comment-box.js'
import InviteUser from './invite-user.js'
import EventTileButton from './event-tile-button.js'
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink
} from 'react-router-dom';

// This component displays event info as returned by apiCall
export default class EventTile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invited: false,
      going: false,
    }
    this.addEvent = this.addEvent.bind(this)
    this.sendEmail = this.sendEmail.bind(this)
    this.checkRSVP = this.checkRSVP.bind(this)
  }

  addEvent() {
    const user = this.props.currentUser.email.replace(/\./g, ',')
    const ref = firebase.database().ref(`users/${user}/events/${this.props.eventID}`);
    ref.set({
      host: user,
      going: true,
      invited: false
    })
  }

  sendEmail(friend) {
    // Look for friend in db, if exists add event with current user as host & set invited to true
    const toEmail = friend.replace(/\./g, ',');

    firebase.database().ref(`users/${toEmail}`).once('value', (snapshot) => {
      let exists = snapshot.val();

      if (exists !== null) {
        const host = this.props.currentUser.email.replace(/\./g, ',');
        let ref = firebase.database().ref(`users/${toEmail}/events/${this.props.eventID}`);

        ref.set({
          host: host,
          going: false,
          invited: true
        })

      // If friend is not in database, send invite email
      } else {
        document.location.href = `mailto:${friend}?subject=What's%20%20the%20Haps?&body=A%20friend%20has%20invited%20you%20to%20a%20meetup!%20Create%20an%20account%20to%20find%20out%20the%20Haps:%20https://what-s-the-haps.firebaseapp.com`;
      }
    })
  }

  // Check the state of the event tile to see if the user is going or has been invited. This will be used as a prop on the EventTileButton component in order to conditionally render the content of EventTileButton
  checkRSVP() {
    let rsvp;
    if (this.state.going === true) {
      rsvp = 'going'
    } else if (this.state.invited === true) {
      rsvp = 'invited'
    } else {
      rsvp = 'neither'
    }
    return rsvp
  }

  componentDidMount() {

    const user = this.props.currentUser.email.replace(/\./g, ',')
    const events = firebase.database().ref(`users/${user}/events`);

    events.on('value', snapshot => {
      let event = snapshot.val()
      for (let key in event) {

        if (key === this.props.eventID && event[key].going === true) {
          this.setState({
            going: true,
            invited: false
          })
        } else if (key === this.props.eventID && event[key].invited === true) {
          this.setState({
            going: false,
            invited: true
          })
        }
      }
    });

  }

    render() {

      let ticketSalesDates = `${this.props.eventSalesStart} - ${this.props.eventSalesEnd}`
      ticketSalesDates = ticketSalesDates
        // Replace dashes in date with slashes
        .replace(/\-/g, '/')
        // Replace the T and Z which appear before/after the timestamps with empty spaces
        .replace(/\T/g, ' ')
        .replace(/\Z/g, ' ')
        // Remove the specific sales times for tickets, while leaving the dates
        .replace(/[0-9]{2}:[0-9]{2}:[0-9]{2}/g, '')
        // Clean up the remaining characters that exist between the two dates
        .replace(/   \//g, ' —')

      let eventDateTime = `${this.props.eventDate}, ${this.props.eventTime}`
      eventDateTime = eventDateTime
        // Replace dashes in event date with slashes
        .replace(/\-/g, '/')
        // Get rid of the seconds indicator in the event time
        .replace(/:[0-9]{2}$/g, '')

      // Avoid displaying subGenre if it's the same as Genre
      let eventGenres = ''
      if (`${this.props.eventGenre}` === `${this.props.eventSubGenre}`) {
        eventGenres = `${this.props.eventGenre}`
      } else {
        eventGenres = `${this.props.eventGenre}, ${this.props.eventSubGenre}`
      }

      let rsvpClass = '';
      if (this.props.currentPage === 'home' || this.props.currentPage === 'search') {
        if (this.state.going === true) {
          rsvpClass = 'eventTile__div going'
        } else if (this.state.invited === true) {
          rsvpClass = 'eventTile__div invited'
        } else {
          rsvpClass = 'eventTile__div'
        }
      } else {
        rsvpClass = 'eventTile__div specific'
      }

      return (

        <div className={`${rsvpClass}`}>
            <figure className="eventTile__figure">
              <img className="eventTile__img--eventImage" src={`${this.props.eventImageURL}`} alt={`Promo image for ${this.props.eventName}`} />
              <figcaption className="eventTile__figcaption">
                <a className="eventTile__a--eventURL" href={`${this.props.eventURL}`}>See event on Ticketmaster</a>
              </figcaption>
            </figure>

          <h2 className="eventTile__head--eventName">{this.props.eventName}</h2>

          {/* This link will display on mobile */}
          <a className="eventTile__a--eventURLMobile"href={`${this.props.eventURL}`}>See event on Ticketmaster</a>

          <p className="eventTile__p--eventTags">{this.props.eventType}, {eventGenres}</p>

          <h3>Date &amp; Time:</h3>
          <p className="eventTile__p--eventDeets">
          {eventDateTime}<br />
          <h3>Location:</h3>
          {this.props.venue}<br />
          {this.props.address}
          </p>

          <EventTileButton
            apiCall={this.props.apiCall}
            currentUser={this.props.currentUser}
            rsvp={this.checkRSVP()}
            currentPage={this.props.currentPage}
            updatePage={this.props.updatePage}
            eventID={this.props.eventID}
            specificEvent={this.props.specificEvent}
            clearSearch={this.props.clearSearch}
          />

          {/* When landing on specific event page -- load 1. Invite User 2. Comment Box */}
          <Route path="/event/:event"
            render={props => <InviteUser submitEmail={this.sendEmail} />} />

          <Route path="/event/:event"
            render={props => <CommentBox
            eventID={this.props.eventID}
            searchResults={this.props.searchResults}
            userEmail={this.props.currentUser.email} />} />

        </div>
      )
    }
}
