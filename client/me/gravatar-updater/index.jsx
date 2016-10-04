/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

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

			const obj = {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer ' + bearerToken,
					'Accept-Language': '*'
				},
				body: data,
			};

		fetch( 'https://api.gravatar.com/v1/upload-image', obj )
			.then( function ( result ) {
				if ( result.ok ) {
					return result.json();
				}
			} )
			.then( function ( result ) {
				console.log( 'fetch result', result );
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
