/**
 * External dependencies
 */
import { expect } from 'chai';
import set from 'lodash/set';

/**
 * Internal dependencies
 */
import {
	isCurrentUserUploadingGravatar
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isCurrentUserUploadingGravatar', () => {
		it( 'returns false when state is undefined', () => {
			expect( isCurrentUserUploadingGravatar( undefined ) ).to.equal( false );
		} );

		it( 'returns state when defined', () => {
			const state = {};
			set( state, 'currentUser.gravatarStatus.isUploading', true );
			expect( isCurrentUserUploadingGravatar( state ) ).to.equal( true );
			set( state, 'currentUser.gravatarStatus.isUploading', false );
			expect( isCurrentUserUploadingGravatar( state ) ).to.equal( false );
		} );
	} );
} );
