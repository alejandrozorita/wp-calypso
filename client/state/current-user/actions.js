/**
 * External dependencies
 */
import request from 'superagent';

/**
 * Internal dependencies
 */
import { CURRENT_USER_ID_SET,
	CURRENT_USER_FLAGS_RECEIVE,
	GRAVATAR_UPLOAD_START,
	GRAVATAR_UPLOAD_SUCCESS,
	GRAVATAR_UPLOAD_FAILURE
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that the current user ID
 * has been set.
 *
 * @param  {Number} userId User ID
 * @return {Object}        Action object
 */
export function setCurrentUserId( userId ) {
	return {
		type: CURRENT_USER_ID_SET,
		userId
	};
}

export function setCurrentUserFlags( flags ) {
	return {
		type: CURRENT_USER_FLAGS_RECEIVE,
		flags
	};
}

export function uploadGravatar( file, bearerToken, email ) {
	return dispatch => {
		dispatch( { type: GRAVATAR_UPLOAD_START } );
		const data = new FormData();
		data.append( 'filedata', file );
		data.append( 'account', email );
		return request
			.post( 'https://api.gravatar.com/v1/upload-image' )
			.send( data )
			.set( 'Authorization', 'Bearer ' + bearerToken )
			.set( 'Accept-Language', '*' )
			.then( () => {
				dispatch( gravatarUploadSuccess() );
			} )
			.catch( () => {
				dispatch( gravatarUploadFailure() );
			} );
	};
}

export function gravatarUploadSuccess() {
	return {
		type: GRAVATAR_UPLOAD_SUCCESS
	};
}

export function gravatarUploadFailure() {
	return {
		type: GRAVATAR_UPLOAD_FAILURE
	};
}
