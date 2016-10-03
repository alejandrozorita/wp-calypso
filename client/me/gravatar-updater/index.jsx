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

export class GravatarUpdater extends React.Component {
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
				<FilePicker accept="image/*">
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
