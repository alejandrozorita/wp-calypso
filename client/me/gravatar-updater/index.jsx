/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
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
import { isOffline } from 'state/application/selectors';
import { localize } from 'i18n-calypso';
import Spinner from 'components/spinner';
import * as OAuthToken from 'lib/oauth-token';

export class GravatarUpdater extends Component {
	constructor() {
		super();
		this.state = { isUploading: false };
		this.handleOnPick = this.handleOnPick.bind( this );
	}

	static propTypes = {
		isOffline: React.PropTypes.bool,
		translate: React.PropTypes.func,
		user: PropTypes.object,
	};

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
			this.setState( {
				isUploading: true
			} );

			const data = new FormData();
			data.append( 'filedata', files[0] );
			data.append( 'account', this.props.user.email );
			request
				.post( 'https://api.gravatar.com/v1/upload-image' )
				.send( data )
				.set( 'Authorization', 'Bearer ' + bearerToken )
				.set( 'Accept-Language', '*' )
				.then( result => {
					console.log( 'result', result );
					this.setState( {
						isUploading: false
					} );
				} )
				.catch( error => {
					console.log( 'error', error );
					this.setState( {
						isUploading: false
					} );
				} );
		} else {
			console.log( 'Oops - no bearer token.' );
		}
	}

	render() {
		const { isOffline, translate, user } = this.props;
		return (
			<div>
				<FormLabel>
					{ translate( 'Avatar', {
							comment: 'A section heading on the profile page.'
						}
					) }
				</FormLabel>
				<div
					className={ classnames( 'gravatar-updater__image-container',
						{ 'is-uploading': this.state.isUploading }
					) }
				>
					<Gravatar
						imgSize={ 270 }
						size={ 100 }
						user={ user }
					/>
					{ this.state.isUploading &&
						<Spinner className='gravatar-updater__spinner' /> }
				</div>
				<p>
					{ translate( 'To change, select an image or ' +
					'drag and drop a picture from your computer.' ) }
				</p>
				<FilePicker accept="image/*" onPick={ this.handleOnPick }>
					<Button
						disabled={ isOffline ||
							this.state.isUploading ||
							! user.email_verified }
					>
						{ translate( 'Select Image' ) }
					</Button>
				</FilePicker>
			</div>
		);
	}
}

export default connect(
	state => ( {
		user: getCurrentUser( state ),
		isOffline: isOffline( state ),
	} )
)( localize ( GravatarUpdater ) );
