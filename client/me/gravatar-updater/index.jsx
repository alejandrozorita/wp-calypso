/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import request from 'superagent';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FilePicker from 'components/file-picker';
import FormLabel from 'components/forms/form-label';
import { getCurrentUser } from 'state/current-user/selectors';
import Gravatar from 'components/gravatar';
import * as OAuthToken from 'lib/oauth-token';

export class GravatarUpdater extends React.Component {
	handleOnPick( files ) {
		console.log( 'you picked',  JSON.stringify( files[0].name ) );

		// check for bearerToken from desktop app
		let bearerToken = OAuthToken.getToken();

		if ( ! bearerToken ) {
			bearerToken = localStorage.getItem( 'bearerToken' );
		}

		// send gravatar request
		if ( bearerToken ) {
			console.log( 'Got the bearerToken, sending request' );

			const data = new FormData();
			data.append( 'filedata', files[0] );
			data.append( 'account', this.props.user.email );

			request
				.post( 'https://api.gravatar.com/v1/upload-image' )
				.send( data )
				.set( 'Authorization', 'Bearer ' + bearerToken )
				.set( 'Accept-Language', '*' )
				.then( function ( result ) {
					console.log( 'result', result );
				} )
				.catch( function ( error ) {
					console.log( 'error', error );
				} );
		} else {
			console.log( 'Oops - no bearer token.' );
		}
	}

	render() {
		return (
			<div>
				<FormLabel>Avatar</FormLabel>
				<Gravatar
					imgSize={ 270 }
					size={ 100 }
					user={ this.props.user }
				/>
				<p>
					To change, select an image or drag and drop a picture from your computer.
				</p>
				<FilePicker accept="image/*" onPick={ this.handleOnPick.bind( this ) }>
					<Button>Select Image</Button>
				</FilePicker>
			</div>
		);
	}
}
GravatarUpdater.propTypes = { user: React.PropTypes.object };

function mapStateToProps( state ) {
	return {
		user: getCurrentUser( state ),
	};
}

export default connect( mapStateToProps )( GravatarUpdater );
