/**
 * External dependencies
 */
import has from 'lodash/has';

export function isCurrentUserUploadingGravatar( state ) {
	return has( state, 'currentUser.gravatarStatus.isUploading' ) &&
		state.currentUser.gravatarStatus.isUploading;
}
