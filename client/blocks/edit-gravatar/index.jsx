/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FilePicker from 'components/file-picker';
import FormLabel from 'components/forms/form-label';
import {
	getCurrentUser,
	isCurrentUserUploadingGravatar
} from 'state/current-user/selectors';
import Gravatar from 'components/gravatar';
import { isOffline } from 'state/application/selectors';
import { localize } from 'i18n-calypso';
import Spinner from 'components/spinner';
import * as OAuthToken from 'lib/oauth-token';
import { uploadGravatar } from 'state/current-user/actions';

export class EditGravatar extends Component {
	constructor() {
		super();
		this.handleOnPick = this.handleOnPick.bind( this );
	}

	static propTypes = {
		isOffline: PropTypes.bool,
		translate: PropTypes.func,
		user: PropTypes.object,
		dispatch: PropTypes.func,
		isUploading: PropTypes.bool,
	};

	handleOnPick( files ) {
		const { dispatch, user } = this.props;
		console.log( 'you picked',  JSON.stringify( files[0].name ) );

		// check for bearerToken from desktop app
		let bearerToken = OAuthToken.getToken();

		if ( ! bearerToken ) {
			bearerToken = localStorage.getItem( 'bearerToken' );
		}

		// send gravatar request
		if ( bearerToken ) {
			console.log( 'Got the bearerToken, sending request' );
			dispatch( uploadGravatar( files[ 0 ], bearerToken, user.email ) );
		} else {
			console.log( 'Oops - no bearer token.' );
		}
	}

	render() {
		const { isOffline, translate, user, isUploading } = this.props;
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
						{ 'is-uploading': isUploading }
					) }
				>
					<Gravatar
						imgSize={ 270 }
						size={ 100 }
						user={ user }
					/>
					{ isUploading && <Spinner className='gravatar-updater__spinner' /> }
				</div>
				<p>
					{ translate( 'To change, select an image or ' +
					'drag and drop a picture from your computer.' ) }
				</p>
				<FilePicker accept="image/*" onPick={ this.handleOnPick }>
					<Button
						disabled={ isOffline || isUploading || ! user.email_verified }
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
		isUploading: isCurrentUserUploadingGravatar( state ),
	} )
)( localize ( EditGravatar ) );
