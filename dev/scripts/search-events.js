import React from 'react';
import ReactDOM from 'react-dom';

import SearchForm from './search-form.js'
import EventTile from './event-tile.js'

export default class SearchEvents extends React.Component {

  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="searchEvents__div clearfix">
        {/* Map over the array with our search results, and return one EventTile component per result. Pass in the data needed as props */}
        {this.props.searchResults.map((result) => {
          return (
            <EventTile
              searchResults={this.props.searchResults}
              // Our api call method which will be used as a prop
              apiCall={this.props.apiCall}
              // A method we will call to clear the searchResults array on app.js before making a new api call
              clearSearch={this.props.clearSearch}
              // A method that will make an api call when going to the specific event page
              specificEvent={this.props.specificEvent}
              // The page the current user is on
              currentPage={this.props.currentPage}
              // A method that will be used to update the currentPage state
              updatePage={this.props.updatePage}
              // The email of the current user; will be used to push information to Firebase
              currentUser={this.props.currentUser}
              // The name of the event
              eventName={result.name}
              // The ID of the event
              eventID={result.id}
              // The TicketMaster event URL
              eventURL={result.url}
              // The event image URL
              eventImageURL={result.images[0].url}
              // The start date for ticket sales
              eventSalesStart={result.sales.public.startDateTime}
              // The end date for ticket sales
              eventSalesEnd={result.sales.public.endDateTime}
              // The date the event is happening
              eventDate={result.dates.start.localDate}
              // The time the event is happening
              eventTime={result.dates.start.localTime}
              // The type of event
              eventType={result.classifications[0].segment.name}
              // The genre of the event content
              eventGenre={result.classifications[0].genre.name}
              // The sub-genre of the event content
              eventSubGenre={result.classifications[0].subGenre.name}
              // The name of the venue the event will be hosted at
              venue={result._embedded.venues[0].name}
              // The address of the venue the event will be hosted at
              address={result._embedded.venues[0].address.line1}
            />
          )
        })}
      </div>
    )
  }
}
